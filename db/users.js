const { client } = require("./client");

async function getAllUsers() {
    const { rows } = await client.query(
        `SELECT id, username 
      FROM users;
    `);

    return rows;
}

async function getUser({ username }) {
    try {
        const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE username=$1;
        `, [username]);

        return user;
    } catch (error) {
        throw error;
    }
}

async function createUser({ username, password }) {
    try {
        const { rows } = await client.query(`
        INSERT INTO users(username, password)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, password]);

        return rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllUsers,
    getUser,
    createUser
}