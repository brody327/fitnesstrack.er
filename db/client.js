const { Client } = require('pg');

const connectectionString = 'postgres://localhost:5432/fitness-dev';

const client = new Client(process.env.DATABASE_URL || connectectionString);

module.exports = {
    client,
}