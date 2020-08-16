const routineActivitiesRouter = require('express').Router();
const { updateRoutineActivity, destroyRoutineActivity, getRoutineActivityById, getRoutineById } = require('../db');
const { requireUser } = require("./utils");

// ~~ MIDDLEWARE ~~
//-- PATCH Middleware --
//Update the duration, sets, or reps on a routine's activity.
routineActivitiesRouter.patch('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { duration, sets, reps } = req.body;

    try {
        //Retrieve routineActivity using passed id.
        const [routineActivity] = await getRoutineActivityById(routineActivityId);
        //Checks if routineActivity exists.
        if (!routineActivity) {
            next({ name: "InvalidInput", message: "Routine does not exist to update." })
        } else {
            const { user } = await getRoutineById(routineActivity.routineId);

            //Check if logged in user is same as routine.
            if (user.id != req.user.id) {
                next({ name: "InvalidUser", message: "You cannot update a routine activity you are not the owner of." })
            } else {
                const updateFields = {};

                //Check for update fields.
                if (duration) {
                    updateFields.duration = duration;
                }

                if (sets) {
                    updateFields.sets = sets;
                }

                if (reps) {
                    updateFields.reps = reps;
                }

                const [updatedRoutineActivity] = await updateRoutineActivity(routineActivityId, updateFields);
                //Checks if updateRoutineActivity was successful.
                if (updatedRoutineActivity) {
                    res.send({ updatedRoutineActivity });
                } else {
                    next({ name: "InvalidResponse", message: "This routine could not be updated." })
                }
            }
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

//-- DELETE Middleware --
//Delete an activity from a routine.
routineActivitiesRouter.delete('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    try {
        //Retrieve routineActivity using passed id.
        const [routineActivity] = await getRoutineActivityById(routineActivityId);

        //Checks if routineActivity exists.
        if (!routineActivity) {
            next({ name: "InvalidInput", message: "Routine does not exist to delete." })
        } else {
            const { user } = await getRoutineById(routineActivity.routineId);

            //Check if logged in user is same as routine.
            if (user.id != req.user.id) {
                next({ name: "InvalidUser", message: "You cannot delete a routine activity you are not the owner of." })
            } else {
                const [destroyedRoutineActivity] = await destroyRoutineActivity(routineActivityId);

                //Checks if destroyRoutine was successful.
                if (destroyedRoutineActivity) {
                    res.send({ message: "The routine actvity was successfully destroyed.", destroyedRoutineActivity });
                } else {
                    next({ name: "InvalidResponse", message: "This routine could not be deleted." })
                }
            }
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = routineActivitiesRouter;