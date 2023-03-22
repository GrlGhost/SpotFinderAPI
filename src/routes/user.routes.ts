import { Router } from "express";
import { addUser, deleteUser, modifieUser } from "../controllers/user.controller";

const usersRouter = Router();

usersRouter.route('/add')
    .post(addUser)


//Example: amd/pepito33@gmail this implies a delete or modification in pepito33    
usersRouter.route('/:userMail')
    .post(modifieUser)
    .delete(deleteUser)

export default usersRouter
