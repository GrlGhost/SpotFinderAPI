import { Router } from "express";
import { addParking, deleteParking, getParkingsFromArea, modifieParking } from "../controllers/parking.controller";


const parkingRouter = Router();

parkingRouter.route('/')
    .post(addParking);

parkingRouter.route('/:id')
    .post(modifieParking)
    .delete(deleteParking);

parkingRouter.route('/parkingsFromArea')
    .get(getParkingsFromArea);

export default parkingRouter;