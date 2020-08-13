All routes should be preceded by /api. If a route has a (*) next to it, it means that it should require a logged in user to be present, if a route has a (**) next to it, the logged in user should be the owner of the modified object.

users

activities

PATCH /activities/:activityId (*)
Anyone can update an activity (yes, this could lead to long term problems a la wikipedia)


routines

POST /routines (*)
Create a new routine

PATCH /routines/:routineId (**)
Update a routine, notably change public/private, the name, or the goal

DELETE /routines/:routineId (**)
Hard delete a routine. Make sure to delete all the routineActivities whose routine is the one being deleted.

POST /routines/:routineId/activities
Attach a single activity to a routine. Prevent duplication on (routineId, activityId) pair.


routine_activities
PATCH /routine_activities/:routineActivityId (**)
Update the count or duration on the routine activity

DELETE /routine_activities/:routineActivityId (**)
Remove an activity from a routine, use hard delete