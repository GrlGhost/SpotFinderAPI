import { Router } from "express";
import { makeCalification, modifyCalification } from "../controllers/califications/califications.controller";

const calificationsRouter = Router();

calificationsRouter.route('/makeCalification')
    .post(makeCalification);

calificationsRouter.route('/modifieCalification')
    .post(modifyCalification);

export default calificationsRouter;