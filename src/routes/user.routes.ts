import { Router } from "express";
import { addUser, deleteUser, modifieUser } from "../controllers/user.controller";

const usersRouter = Router();

usersRouter.route('/add')
    .put(addUser)//for adding somthing new


//Example: amd/pepito33@gmail this implies a delete or modification in pepito33    
usersRouter.route('/:userMail')
    .post(modifieUser)//post to modify
    .delete(deleteUser)

export default usersRouter
