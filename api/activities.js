const activitiesRouter = require('express').Router();
const { getAllActivities, getPublicRoutinesByActivityId, createActivity, getActivityByName, getActivityById, updateActivity } = require('../db');
const { requireUser } = require("./utils");

activitiesRouter.use((req, res, next) => {
    console.log('A request is being made to /activities...');

    next();
});

//GET Middleware
//Get all activities.
activitiesRouter.get('/', async (req, res) => {
    try {
        const activities = await getAllActivities();

        res.send({
            'activities': activities
        });
    } catch (error) {
        next(error);
    }
});

//Get routines by activity.
activitiesRouter.get('/:activityId/routines', async (req, res) => {
    try {
        const { activityId } = req.params;
        const routines = await getPublicRoutinesByActivityId({ activityId });

        res.send({
            'routines': routines
        });
    } catch (error) {
        next(error);
    }
});

//POST Middleware
//Create a new activity.
activitiesRouter.post('/', requireUser, async (req, res, next) => {
    const { name, description } = req.body;

    //Checks that name and description exist.
    if (!name || !description) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    } else {
        try {
            //Checks if the activity already is in the database.
            if (await getActivityByName(name)) {
                next({ name: "InvalidInput", message: "Activity name already exists." })
            } else {
                //Creates the new activity using activityData.
                activityData = {};
                activityData.name = name;
                activityData.description = description;

                const activity = await createActivity(activityData);

                if (activity) {
                    res.send({ activity });
                } else {
                    next({ name: "InvalidInput", message: "Invalid name or description entered." })
                }
            }

        } catch (error) {
            next(error);
        }
    }
});

//PATCH Middleware
//Update activity given an activity id.
activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
    const { activityId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a name and description."
        });
    } else if (await getActivityByName(name)) {
        next({
            name: "InvalidInput",
            message: "The input activity name already exists."
        });
    } else {
        try {
            const updateFields = {};
            updateFields.name = name;
            updateFields.description = description;

            const originalActivity = await getActivityById(activityId);
            if (originalActivity) {
                const updatedActivity = await updateActivity(activityId, updateFields)
                res.send({ activity: updatedActivity });
            } else {
                next({ name: "InvalidInput", message: "This activity does not exist." });
            }
        } catch (error) {
            next(error);
        }
    }
})
module.exports = activitiesRouter