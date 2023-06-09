import { Router } from "express";
import { addUser, deleteUser, logInUser, modifieUser } from "../controllers/user/user.controller";
import { authForUserActions } from "../controllers/user/authenticate.controller";
import { getWhereUserIsParking } from "../controllers/userParkedAt.controller";

const usersRouter = Router();

usersRouter.route('/')
    .post(addUser, logInUser);//for adding somthing new

usersRouter.route('/:userMail/getCurrentParking')
    .get(getWhereUserIsParking);


//Example: amd/pepito33@gmail this implies a delete or modification in pepito33    
usersRouter.route('/:userMail')
    .post(logInUser)
    .put(authForUserActions, modifieUser)//post to modify
    .delete(authForUserActions, deleteUser);

export default usersRouter
