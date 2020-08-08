const { client } = require("./client");
// const { getAllUsers, getUser, createUser } = require("./users");
// const { getAllActivities, createActivity, updateActivity } = require("./activities");
// const { getAllRoutines, getAllPublicRoutines, getAllRoutinesByUser, getPublicRoutinesByUser, getPublicRoutinesByActivityId, updateRoutine, createRoutine, destroyRoutine } = require('./routines');
// const { updateRoutineActivity, destroyRoutineActivity } = require("./routine_activities");

const { getAllUsers, getUser, createUser,
    getAllActivities, createActivity, updateActivity,
    getAllRoutines, getAllPublicRoutines, getAllRoutinesByUser, getPublicRoutinesByUser, getPublicRoutinesByActivityId, updateRoutine, createRoutine, destroyRoutine,
    updateRoutineActivity, destroyRoutineActivity } = require("./index");

async function dropTables() {
    try {
        console.log("Starting to drop tables...");

        await client.query(`
        DROP TABLE IF EXISTS routine_activities;
        DROP TABLE IF EXISTS routines;
        DROP TABLE IF EXISTS activities;
        DROP TABLE IF EXISTS users;
      `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    }
}

async function createTables() {
    try {
        console.log("Starting to build tables...");

        await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          active BOOLEAN DEFAULT true
        );
      `);

        await client.query(`
      CREATE TABLE activities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);

        await client.query(`
      CREATE TABLE routines (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER REFERENCES users(id),
      public BOOLEAN DEFAULT false,
      name VARCHAR(255) UNIQUE NOT NULL,
      goal TEXT NOT NULL,
      active BOOLEAN DEFAULT true
      );
  `);

        await client.query(`
        CREATE TABLE routine_activities (
        id SERIAL PRIMARY KEY,
        "routineId" INTEGER REFERENCES routines(id),
        "activityId" INTEGER REFERENCES activities(id),
        duration INTEGER,
        sets INTEGER,
        reps INTEGER,
        UNIQUE ("routineId", "activityId")
        );
        `);

        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error;
    }
}

async function createInitialUsers() {
    try {
        console.log("Starting to create users...");

        const brody = await createUser({ username: 'brody', password: 'wolfgang' });
        const bryan = await createUser({ username: 'bryan', password: 'zachariah' });
        const lacey = await createUser({ username: 'lacey', password: 'lacey21' });

        console.log(brody);
        console.log(bryan);
        console.log(lacey);

        console.log("Finished creating users!");
    } catch (error) {
        console.error("Error creating users!");
        throw error;
    }
}

async function createInitialActivities() {
    try {
        console.log("Starting to create activities...");

        const pushUP = await createActivity({
            name: 'push-up',
            description: 'A conditioning exercise performed in a prone position by raising and lowering the body with the straightening and bending of the arms while keeping the back straight and supporting the body on the hands and toes.'
        });
        const sitUp = await createActivity({
            name: 'sit-up',
            description: 'An exercise in which a person lies flat on the back, lifts the torso to a sitting position, and then lies flat again without changing the position of the legs: formerly done with the legs straight but now usually done with the knees bent.'
        });
        const pullUp = await createActivity({
            name: 'pull-up',
            description: 'An exercise consisting of chinning oneself, as on a horizontal bar attached at each end to a doorpost.'
        });

        console.log(pushUP);
        console.log(sitUp);
        console.log(pullUp);

        console.log("Finished creating activities!");
    } catch (error) {
        console.error("Error creating activities!");
        throw error;
    }
}

async function createInitialRoutines() {
    try {
        console.log("Starting to create routines...");

        await createRoutine(
            {
                userId: 1,
                public: false,
                name: "Monday",
                goal: "Chest workout and legs."
            },
            [
                {
                    name: "pull-up",
                    duration: 60,
                    sets: 5,
                    reps: 10
                },
                {
                    name: "PUSH-up",
                    sets: 12,
                    reps: 1
                }
            ]
        );
        await createRoutine({ userId: 3, public: true, name: "REDEMPTION", goal: "EVERYTHING!" }, [{
            name: "SIT-UP",
            duration: 120,
            sets: 500,
            reps: 100
        },]);
        await createRoutine(
            {
                userId: 2,
                public: false,
                name: "TUESDAY DOOMSDAY",
                goal: "You know it ;)."
            },
            [
                {
                    name: "pull-up",
                    duration: 60,
                    sets: 5,
                    reps: 10
                },
                {
                    name: "PUSH-up",
                    sets: 12,
                    reps: 1
                },
                {
                    name: "Sit-up",
                    sets: 12,
                    reps: 1
                }
            ]
        );

        await createRoutine(
            {
                userId: 2,
                public: true,
                name: "FRIDAY MYDAY",
                goal: "YEAH!."
            },
            [
                {
                    name: "pull-up",
                    duration: 60,
                    sets: 5,
                    reps: 10
                },
                {
                    name: "PUSH-up",
                    sets: 12,
                    reps: 1
                },
                {
                    name: "Sit-up",
                    sets: 12,
                    reps: 1
                }
            ]
        );

        await createRoutine(
            {
                userId: 1,
                public: true,
                name: "DESTROY ME",
                goal: ":O"
            },
            [
                {
                    name: "PUSH-up",
                    sets: 12,
                    reps: 1
                }
            ]
        );

        console.log("Finished creating routines!");
    } catch (error) {
        console.error("Error creating routines!");
        throw error;
    }
}

async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialActivities();
        await createInitialRoutines();
    } catch (error) {
        throw error;
    }
}

async function testDB() {
    try {
        console.log("Starting to test database...");

        const users = await getAllUsers();
        console.log("getAllUsers:", users);

        const oneUser = await getUser({ username: 'lacey', password: 'lacey21' });
        console.log('getUser:', oneUser);

        const activities = await getAllActivities();
        console.log("getAllActivities:", activities);

        const updateActivityResult = await updateActivity(users[0].id, {
            name: "New Activity",
            description: "New Description"
        });
        console.log("Update First Acitivty in Array:", updateActivityResult);

        const routines = await getAllRoutines();
        console.log("getAllRoutines:", routines);

        const publicRoutines = await getAllPublicRoutines();
        console.log("getAllPublicRoutines:", publicRoutines);

        const routinesByUser = await getAllRoutinesByUser({ username: "lacey" });
        console.log("getAllRoutinesByUser 'lacey':", routinesByUser);

        const publicRoutinesByUser = await getPublicRoutinesByUser({ username: "bryan" });
        console.log("getPublicRoutinesByUser 'bryan':", publicRoutinesByUser);

        const publicRoutinesByActivityId = await getPublicRoutinesByActivityId({ activityId: 3 });
        console.log("getPublicRoutinesByActivityId:", publicRoutinesByActivityId);

        const updatedRoutine = await updateRoutine(1, { public: true, name: "UPDATED", goal: "Be the best." });
        console.log("updatedRoutine:", updatedRoutine);

        const destroyedRoutine = await destroyRoutine(5);
        console.log("destroyedRoutine:", destroyedRoutine);

        const updatedRoutineActivity = await updateRoutineActivity(2, { duration: 100, sets: 3, reps: 8 });
        console.log("updatedRoutineActivity:", updatedRoutineActivity);

        //Takes an activityid number
        const destroyedRoutineActivity = await destroyRoutineActivity(2);
        console.log("destroyedRoutineActivity:", destroyedRoutineActivity);

        console.log("Finished database tests!");
    } catch (error) {
        console.error("Error testing database!");
        throw error;
    }
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());