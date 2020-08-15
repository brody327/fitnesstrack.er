const routinesRouter = require('express').Router();
const { getAllPublicRoutines, getRoutineByName, createRoutine } = require('../db');
const { requireUser } = require('./utils');

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

//POST Middleware
//Create new routine.
routinesRouter.post('/', requireUser, async (req, res, next) => {
    const { public, name, goal } = req.body.routineData;
    const activities = req.body.activities || [];
    const temp = req.body;

    if (!name || !goal) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a name and a goal."
        });
    } else {
        try {
            //Checks if the routine name is already in the database.
            if (await getRoutineByName({ name }) == true) {
                next({ name: "InvalidInput", message: "Routine name already exists." })
            } else {
                //Creates the new activity using routineData.
                routineData = {};
                routineData.name = name;
                routineData.public = public;
                routineData.goal = goal;
                routineData.userId = req.user.id;

                console.log("ROTUINE:", routineData);
                console.log("ACT:", activities);
                console.log("FINAL OBJ:", { routineData, activities });
                const routine = await createRoutine({ routineData, activities });
                // const routine = await createRoutine(temp);
                console.log("RETURNED:", routine);
                if (routine) {
                    console.log("RUNNING RES.SEND");
                    res.send(routine);
                } else {
                    next({ name: "InvalidInput", message: "Invalid name or description entered." })
                }
            }

        } catch (error) {
            console.log("banana");
            console.log(error);
            next(error);
        }
    }
});

//Attach an activity to a routine.
routinesRouter.post('/:routineId/activities', async (req, res, next) => {
    const { routineId } = req.params;
    //Retrieve routine by id
    //add new activity to retrieved routine
    //OR rebuild routine with new activity added to activity list
});

//PATCH Middleware
//Update a routine.
routinesRouter.patch('/:routineId', async (req, res, next) => {
    const { routineId } = req.params;
    //retrieve routine by id
    //req.body has public= true/false, name, or goal
    //change retrieved object with above

});

//DELETE Middleware
//Delete a routine.
routinesRouter.delete('/:routineId', async (req, res, next) => {
    const { routineId } = req.params;

});

module.exports = routinesRouter
