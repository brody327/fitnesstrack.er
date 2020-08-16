const jwt = require('jsonwebtoken');
const { getUser } = require('../db');
const { JWT_SECRET } = process.env;

const apiRouter = require('express').Router();

//Verifies request sent from client.
apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if (!auth) { // nothing to see here
        next();
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);

        try {
            const { username } = jwt.verify(token, JWT_SECRET);

            if (username) {
                req.user = await getUser({ username });
                next();
            }
        } catch ({ name, message }) {
            next({ name, message });
        }
    } else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${prefix}`
        });
    }
});

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const routinesRouter = require('./routines');
apiRouter.use('/routines', routinesRouter);

const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);

const routineActivitiesRouter = require('./routine_activities');
apiRouter.use('/routine_activities', routineActivitiesRouter);

apiRouter.use((error, req, res, next) => {
    res.send(error);
});

module.exports = apiRouter;