All routes should be preceded by /api. If a route has a (*) next to it, it means that it should require a logged in user to be present, if a route has a (**) next to it, the logged in user should be the owner of the modified object.

users

activities

routines

PATCH /routines/:routineId (**)
Update a routine, notably change public/private, the name, or the goal

DELETE /routines/:routineId (**)
Hard delete a routine. Make sure to delete all the routineActivities whose routine is the one being deleted.


routine_activities

PATCH /routine_activities/:routineActivityId (**)
Update the count or duration on the routine activity

DELETE /routine_activities/:routineActivityId (**)
Remove an activity from a routine, use hard delete