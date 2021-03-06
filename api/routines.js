const routinesRouter = require('express').Router();
const { getAllPublicRoutines, getRoutineByName, createRoutine, getRoutineById, getActivityByName, createRoutineActivities, updateRoutine, destroyRoutine } = require('../db');
const { requireUser } = require('./utils');

routinesRouter.use((req, res, next) => {
    console.log("A request is being made to /routines...");

    next();
});

// ~~ MIDDLEWARE ~~
//-- GET Middleware --
//Get all public routines.
routinesRouter.get('/', async (req, res) => {
    try {
        const routines = await getAllPublicRoutines();
        res.send({
            'routines': routines
        });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

//-- POST Middleware --
//Create new routine.
routinesRouter.post('/', requireUser, async (req, res, next) => {
    const { public, name, goal } = req.body.routineData;
    const activities = req.body.activities;

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

                const routine = await createRoutine({ routineData, activities });
                if (routine) {
                    res.send({ newRoutine: routine });
                } else {
                    next({ name: "InvalidInput", message: "Invalid name or description entered." })
                }
            }

        } catch ({ name, message }) {
            next({ name, message });
        }
    }
});

//Add an activity to a routine.
routinesRouter.post('/:routineId/activities', async (req, res, next) => {
    const { name, duration, sets, reps } = req.body;

    try {
        const retrievedActivity = await getActivityByName(name);

        //Checks if retrieved activity exists.
        if (retrievedActivity) {

            const newActivity = {};
            newActivity.activityId = retrievedActivity.id;

            //Checks if duration, sets, or reps exist to update.
            if (duration) {
                newActivity.duration = duration;
            }

            if (sets) {
                newActivity.sets = sets;
            }

            if (reps) {
                newActivity.reps = reps;
            }

            //Retrieve routine from passed id.
            const { routineId } = req.params;
            const originalRoutine = await getRoutineById(routineId);

            //Check if retrieved routine exists.
            if (!originalRoutine) {
                next({ name: "InvalidInput", message: "Routine does not exist to update." })
            } else {
                //Adds retrieved routine's id to the new activity object.
                newActivity.routineId = routineId;

                //Checks if the new activity is already in the original routine.
                const activities = originalRoutine.activities;
                const activitiyIds = activities.map(activity => { return activity.id });
                if (activitiyIds.includes(retrievedActivity.id)) {
                    next({ name: "InvalidInput", message: "There is already an activity with that name in the selected routine." })
                } else {
                    //Updates the routine_activities table with the added activity.
                    const updatedRoutine = await createRoutineActivities(newActivity);

                    if (updatedRoutine) {
                        //Don't know if this should return the full new routine with the added activity or if it should just return the updated routine_activities data.
                        //GET all routines shows that this does indeed update the routine with the activity.
                        res.send({ updatedRoutine });
                    } else {
                        next({ name: "InvalidResponse", message: "This routine could not be updated." })
                    }
                }
            }
        } else {
            next({ name: "InvalidInput", message: "Activity does not exist to update." })
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

//-- PATCH Middleware --
//Update a routine.
routinesRouter.patch('/:routineId', requireUser, async (req, res, next) => {
    const { name, public, goal } = req.body;
    const { routineId } = req.params;

    try {
        //Retrieve routine from passed id.
        const originalRoutine = await getRoutineById(routineId);

        //Check if logged in user is same user for routine.
        if (originalRoutine.user.id !== req.user.id) {
            next({ name: "InvalidUser", message: "You cannot update a routine you are not the owner of." })
        } else {
            const updateFields = {};

            //Check for update fields.
            if (name) {
                updateFields.name = name;
            }

            if (public) {
                updateFields.public = public;
            }

            if (goal) {
                updateFields.goal = goal;
            }

            const updatedRoutine = await updateRoutine(routineId, updateFields);

            //Checks if updateRoutine was successful.
            if (updatedRoutine) {
                res.send({ updatedRoutine })
            } else {
                next({ name: "InvalidResponse", message: "This routine could not be updated." })
            }
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

//-- DELETE Middleware --
//Delete a routine.
//For some reasons some of my error messages (next(...)) are not firing when they should. They still produce and error, just not the
//specified name/message response it should.
routinesRouter.delete('/:routineId', requireUser, async (req, res, next) => {
    const { routineId } = req.params;
    try {
        const routine = await getRoutineById(routineId);
        //Check if routine exists.
        if (!routine) {
            next({ name: "InvalidInput", message: "This routine does not exist." })
        } else {
            //Checks if logged in user and routine's user match.
            if (routine.user.id !== req.user.id) {
                next({ name: "InvalidUser", message: "You cannot delete a routine you are not the owner of." })
            } else {
                const [destroyedRoutine] = await destroyRoutine(routineId);

                //Checks if destroyRoutine was successful.
                if (destroyedRoutine) {
                    res.send({ message: "The routine was successfully destroyed.", destroyedRoutine });
                } else {
                    next({ name: "InvalidResponse", message: "This routine could not be deleted." })
                }
            }
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = routinesRouter
