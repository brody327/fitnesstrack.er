const usersRouter = require('express').Router();
const { getAllUsers, getPublicRoutinesByUser, getUser, createUser } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");

    next();
});

//GET Middleware
//Get all users.
usersRouter.get('/', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.send({
            users
        });
    } catch (error) {
        next(error);
    }
});

//Get public routines by username.
usersRouter.get('/:username/routines', async (req, res) => {
    try {
        const { username } = req.params;
        const routines = await getPublicRoutinesByUser({ username });

        res.send({ 'routines': routines });
    } catch (error) {
        next(error);
    }
});

//POST Middleware
//Register User
usersRouter.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const SALT_COUNT = 10;

        //Checks for username and password requirements
        if (await getUser({ username })) {
            next({ name: 'Username Exists', message: `The username "${username}" alreayd exists. Please try a new username.` });
        } else if (password.length < 8) {
            next({ name: 'Invalid Password Length', message: `The password you have entered is too short. Please try a longer password.` });
        } else {
            //Creates user after hashing password.
            bcrypt.hash(password, SALT_COUNT, async (err, hashedPassword) => {
                const newUser = await createUser({
                    username,
                    password: hashedPassword
                });
                //Creates jsonWebToken
                const token = jwt.sign({
                    id: newUser.id,
                    username
                }, process.env.JWT_SECRET, {
                    expiresIn: '1w'
                });

                res.send({ message: 'User created', token })
            });
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
});

//Login User
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    //Check if input username and password exist.
    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    } else {
        try {
            //Get user from database using input username.
            const user = await getUser({ username });

            //Check if the user exists in the database.
            if (user) {
                const hashedPassword = user.password;
                bcrypt.compare(password, hashedPassword, function (err, passwordsMatch) {
                    //Check if the hashed password matches the input password.
                    if (passwordsMatch) {
                        //Login user by comapring JSONWebTokens.
                        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
                        res.send({ message: "You're logged in!", token })
                    } else {
                        next({ name: "IncorrectPassword", message: "Password is incorrect" });
                    }
                });
            } else {
                next({
                    name: 'IncorrectCredentialsError',
                    message: 'Username is incorrect'
                });
            }
        } catch (error) {
            next(error);
        }
    }
});

module.exports = usersRouter;