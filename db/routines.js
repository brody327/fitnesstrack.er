const { client } = require("./client");
const { getActivityByName, getActivityById } = require("./activities");
const { createRoutineActivities } = require("./routine_activities");

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

async function getRoutineByName({ name }) {
    try {
        const { rows: id } = await client.query(`
        SELECT id
        FROM routines
        WHERE name=$1;
        `, [name]);

        // const routines = await Promise.all(routineIds.map(
        //     routine => getRoutineById(routine.id)
        // ));

        return id;
    } catch (error) {
        throw error;
    }
}

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

//Needs to have another join (2) table for the activities.name to routine.id
// async function getPublicRoutinesByActivityName({ name }) {
//     name = name.toLowerCase();
//     try {
//         const { rows: routineIds } = await client.query(`
//         SELECT routines.id
//         FROM routines
//         JOIN routine_activities ON routines.id=routine_activities."routineId"
//         WHERE routine_activities."activityId"=$1 AND routines.public=true;
//         `, [name]);

//         const { rows: routineIds } = await client.query(`
//         SELECT id
//         FROM routines
//         WHERE public=true AND name=$1;
//         `, [name]);

//         console.log("ROUTINE IDS:", routineIds);

//         const routines = await Promise.all(routineIds.map(
//             routine => getRoutineById(routine.id)
//         ));

//         return routines;
//     } catch (error) {
//         throw error;
//     }

// }
//Original Call
//async function createRoutine({ userId, public, name, goal }, activities = []) {
async function createRoutine({ routineData, activities = [] }) {
    console.log("DB:", routineData);
    console.log("DB SENT SCTIVITIES:", activities);

    const { name, userId, public, goal } = routineData;
    console.log(name, userId, public, goal);

    try {
        const { rows: [routine] } = await client.query(`
        INSERT INTO routines("userId", public, name, goal)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
        RETURNING *;
        `, [userId, public, name, goal]);

        console.log("TABLE ROUTINE:", routine);

        for (const activity of activities) {
            console.log(activities);
            activity.name = (activity.name).toLowerCase();
            const activityIdObject = await getActivityByName(activity.name);

            activity.activityId = activityIdObject.id;
            activity.routineId = routine.id;
            console.log("DB Activity:", activity);
            await createRoutineActivities(activity);
        }

        console.log("BEFORE RETURN DB:", routine);
        return await getRoutineById(routine.id);
    } catch (error) {
        throw error;
    }
}

// async function addActivitiesToRoutines(routine, activities) {
//     try {
//         for (const activity of activities) {
//             activity.name = (activity.name).toLowerCase();
//             const activityIdObject = await getActivityByName(activity.name);
//             activity.activityId = activityIdObject.id;
//             activity.routineId = routine.id;
//             await createRoutineActivities(activity);
//         }

//         return await getRoutineById(routine.id);
//     } catch (error) {
//         throw error;
//     }

// }

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

async function updateRoutine(id, fields = {}) {
    try {
        //Why would this be nessecary?
        // const routine = await getRoutineById(id);

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

//TAKE AWAY RETURNING/return FOR FINAL
async function destroyRoutine(id) {
    try {
        const { rows: routine_activitiesDelete } = await client.query(`
        DELETE FROM routine_activities
        WHERE "routineId"=$1
        RETURNING *;
        `, [id]);

        const { rows: routineDelete } = await client.query(`
        DELETE FROM routines
        WHERE id=$1
        RETURNING *;
        `, [id]);

        return [routine_activitiesDelete, routineDelete];
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
    createRoutine,
    updateRoutine,
    destroyRoutine
}