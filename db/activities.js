const { client } = require("./client");

async function getAllActivities() {
    try {
        const { rows } = await client.query(`
        SELECT *
        FROM activities;
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}

async function getActivityByName(activityName) {
    try {
        activityName = activityName.toLowerCase();

        const { rows: [activity] } = await client.query(`
        SELECT *
        FROM activities
        WHERE name = $1;
        `, [activityName]);

        return activity;
    } catch (error) {
        throw error;
    }
}

async function getActivityById(activityId) {
    try {
        const { rows } = await client.query(`
        SELECT *
        FROM activities
        WHERE id = $1;
        `, [activityId]);

        return rows;
    } catch (error) {
        throw error;
    }
}


async function createActivity({ name, description }) {
    name = name.toLowerCase();
    try {
        const { rows } = await client.query(`
        INSERT INTO activities(name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
        RETURNING *;
        `, [name, description]);

        return rows;
    } catch (error) {
        throw error;
    }
}

async function updateActivity(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows } = await client.query(`
        UPDATE activities
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
        `, Object.values(fields));

        return rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllActivities,
    getActivityByName,
    getActivityById,
    createActivity,
    updateActivity
}