const { client } = require("./client");

// async function createRoutineActivities(routineId, activityId) {
//     try {
//         console.log(routineId, activityId);
//         const result = await client.query(`
//         INSERT INTO routine_activities("routineId", "activityId")
//         VALUES ($1, $2)
//         ON CONFLICT ("routineId", "activityId") DO NOTHING;
//         `, [routineId, activityId])

//         console.log("Create Join Table:", result)
//     } catch (error) {
//         throw error;
//     }
// }

async function createRoutineActivities({ routineId, activityId, duration, sets, reps }) {
    try {
        console.log("Creating routine_activity...")
        await client.query(`
        INSERT INTO routine_activities("routineId", "activityId", duration, sets, reps)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT ("routineId", "activityId") DO NOTHING
        RETURNING *;
        `, [routineId, activityId, duration, sets, reps])
        console.log("Finished creating routine_activity!")
    } catch (error) {
        throw error;
    }
}

async function updateRoutineActivity(id, fields = {}) {
    try {
        const setString = Object.keys(fields).map(
            (key, index) => `"${key}"=$${index + 1}`
        ).join(', ');

        const { rows } = await client.query(`
        UPDATE routine_activities
        SET ${setString}
        WHERE "routineId"=${id}
        RETURNING *;
        `, Object.values(fields));

        return rows;
    } catch (error) {
        throw error;
    }
}

//Don't know what this is supposed to be doing
//used to be dumb but now its not
async function destroyRoutineActivity(activityId) {
    try {
        const { rows: deletedRoutine } = await client.query(`
        DELETE FROM routine_activities
        WHERE "activityId"=$1
        RETURNING *;
        `, [activityId]);

        return deletedRoutine;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createRoutineActivities,
    updateRoutineActivity,
    destroyRoutineActivity
}

/*
SELECT routine_activities."routineId", routines.name, routine_activities.duration
FROM routine_activities
INNER JOIN routines ON routine_activities."routineId"=routines.id;
*/