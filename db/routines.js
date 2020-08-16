const { client } = require("./client");
//For some reason this is not working when trying to draw from .index. It works with seem, but not here.
// const { getActivityByName, createRoutineActivities } = require("./index");
const { getActivityByName } = require('./activities');
const { createRoutineActivities } = require('./routine_activities');

//Get all routines.
async function getAllRoutines() {
    try {
        const { rows: routineIds } = await client.query(`
        SELECT id
        FROM routines;
        `);

        const routines = await Promise.all(routineIds.map(
            routine => getRoutineById(routine.id)
        ));

        return routines;
    } catch (error) {
        throw error;
    }
}

//Get a public routines.
async function getAllPublicRoutines() {
    try {
        const { rows: routineIds } = await client.query(`
        SELECT id
        FROM routines
        WHERE public=true;
        `);

        const routines = await Promise.all(routineIds.map(
            routine => getRoutineById(routine.id)
        ));

        return routines;
    } catch (error) {
        throw error;
    }
}

//Get a routine using its name.
async function getRoutineByName({ name }) {
    try {
        const { rows: id } = await client.query(`
        SELECT id
        FROM routines
        WHERE name=$1;
        `, [name]);

        return id;
    } catch (error) {
        throw error;
    }
}

//Get all routines from a user.
async function getAllRoutinesByUser({ username }) {
    try {
        const { rows: user } = await client.query(`
        SELECT users.id
        FROM users
        JOIN routines ON users.id=routines."userId"
        WHERE users.username=$1;
        `, [username]);

        const { rows: routineIds } = await client.query(`
        SELECT id
        FROM routines
        WHERE "userId"=$1;
        `, [user[0].id])

        const routines = await Promise.all(routineIds.map(
            routine => getRoutineById(routine.id)
        ));

        return routines;
    } catch (error) {
        throw error;
    }
}

//Get all public routines from a user.
async function getPublicRoutinesByUser({ username }) {
    try {
        const { rows: user } = await client.query(`
        SELECT users.id
        FROM users
        JOIN routines ON users.id=routines."userId"
        WHERE users.username=$1;
        `, [username]);

        const { rows: routineIds } = await client.query(`
        SELECT id
        FROM routines
        WHERE "userId"=$1 AND public=true;
        `, [user[0].id])

        const routines = await Promise.all(routineIds.map(
            routine => getRoutineById(routine.id)
        ));

        return routines;
    } catch (error) {
        throw error;
    }
}

//Get all public routines that have a specific activity in them.
async function getPublicRoutinesByActivityId({ activityId }) {
    try {
        const { rows: routineIds } = await client.query(`
        SELECT routines.id
        FROM routines
        JOIN routine_activities ON routines.id=routine_activities."routineId"
        WHERE routine_activities."activityId"=$1 AND routines.public=true;
        `, [activityId]);

        const routines = await Promise.all(routineIds.map(
            routine => getRoutineById(routine.id)
        ));

        return routines;
    } catch (error) {
        throw error;
    }

}

//Creates a routine by being passed a routineData object and an array of activity objects.
async function createRoutine({ routineData, activities = [] }) {
    const { name, userId, public, goal } = routineData;

    try {
        const { rows: [routine] } = await client.query(`
        INSERT INTO routines("userId", public, name, goal)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
        RETURNING *;
        `, [userId, public, name, goal]);

        //Unfortunatley, taking this into its own function breaks it for some reason.
        for (const activity of activities) {
            activity.name = (activity.name).toLowerCase();
            const activityIdObject = await getActivityByName(activity.name);

            activity.activityId = activityIdObject.id;
            activity.routineId = routine.id;

            await createRoutineActivities(activity);
        }

        return await getRoutineById(routine.id);
    } catch (error) {
        throw error;
    }
}

//Gets a routine using its id and creates the final routine object, attaching its activities and the user.
async function getRoutineById(routineId) {
    try {
        const { rows: [routine] } = await client.query(`
        SELECT *
        FROM routines
        WHERE id=$1;
        `, [routineId]);

        const { rows: activities } = await client.query(`
        SELECT activities.*, routine_activities.duration, routine_activities.sets, routine_activities.reps
        FROM activities
        JOIN routine_activities ON activities.id=routine_activities."activityId"
        WHERE routine_activities."routineId"=$1;
        `, [routineId]);

        const { rows: [user] } = await client.query(`
        SELECT id, username
        FROM users
        WHERE id=$1;
        `, [routine.userId]);

        routine.activities = activities;
        routine.user = user;

        delete routine.userId;

        return routine;
    } catch (error) {
        throw error;
    }
}

//Updates the specified routine.
async function updateRoutine(id, fields = {}) {
    try {

        const setString = Object.keys(fields).map(
            (key, index) => `"${key}"=$${index + 1}`
        ).join(', ');

        const { rows } = await client.query(`
        UPDATE routines
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
        `, Object.values(fields));

        return rows;
    } catch (error) {
        throw error;
    }
}

//Destroys the specified routine.
async function destroyRoutine(id) {
    try {
        await client.query(`
        DELETE FROM routine_activities
        WHERE "routineId"=$1;
        `, [id]);

        const { rows: routineDeleted } = await client.query(`
        DELETE FROM routines
        WHERE id=$1
        RETURNING *;
        `, [id]);

        return [routineDeleted[0]];
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllRoutines,
    getAllPublicRoutines,
    getAllRoutinesByUser,
    getRoutineByName,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivityId,
    getRoutineById,
    createRoutine,
    updateRoutine,
    destroyRoutine
}