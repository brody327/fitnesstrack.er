const { client } = require("./client");

//Get routine_activity by id.
async function getRoutineActivityById(id) {
    try {
        console.log("Getting routine_activity...")

        const { rows } = await client.query(`
        SELECT *
        FROM routine_activities
        WHERE id=$1;
        `, [id]);

        return rows;
    } catch (error) {
        throw error;
    }
}

//Create a new routine_activity. This connects a routine with its activities.
async function createRoutineActivities({ routineId, activityId, duration, sets, reps }) {
    try {
        console.log("Creating routine_activity...")

        const { rows: [routine] } = await client.query(`
        INSERT INTO routine_activities("routineId", "activityId", duration, sets, reps)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT ("routineId", "activityId") DO NOTHING
        RETURNING *;
        `, [routineId, activityId, duration, sets, reps])

        console.log("Finished creating routine_activity!")
        return routine;
    } catch (error) {
        throw error;
    }
}

//Updates a routine_activity.
async function updateRoutineActivity(id, fields = {}) {
    try {
        const setString = Object.keys(fields).map(
            (key, index) => `"${key}"=$${index + 1}`
        ).join(', ');

        const { rows } = await client.query(`
        UPDATE routine_activities
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
        `, Object.values(fields));

        return rows;
    } catch (error) {
        throw error;
    }
}

//Destroys a routine_activity. Deletes an activity from a routine.
async function destroyRoutineActivity(routineActivitiyId) {
    try {
        const { rows: deletedRoutine } = await client.query(`
        DELETE FROM routine_activities
        WHERE id=$1
        RETURNING *;
        `, [routineActivitiyId]);

        return deletedRoutine;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getRoutineActivityById,
    createRoutineActivities,
    updateRoutineActivity,
    destroyRoutineActivity
}