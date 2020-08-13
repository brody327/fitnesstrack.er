const routinesRouter = require('express').Router();
const { getAllPublicRoutines } = require('../db');

routinesRouter.use((req, res, next) => {
    console.log("A request is being made to /routines...");

    next();
});

//GET Middleware
//Get all public routines.
routinesRouter.get('/', async (req, res) => {
    try {
        const routines = await getAllPublicRoutines();
        res.send({
            'routines': routines
        });
    } catch (error) {
        throw error;
    }
});

module.exports = routinesRouter
