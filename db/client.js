const { Client } = require('pg');

const connectectionString = 'postgres://localhost:5432/fitness-dev';

const client = new Client(connectectionString);

module.exports = {
    client,
}