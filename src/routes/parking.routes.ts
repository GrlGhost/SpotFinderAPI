import { Router } from "express";
import { addParking, deleteParking, getParkingsFromArea, modifieParking } from "../controllers/parking.controller";
import { authForParkingOwner } from "../controllers/autPark.controller";


const parkingRouter = Router();

parkingRouter.route('/')
    .post(addParking);

parkingRouter.route('/:id')
    .post(authForParkingOwner, modifieParking)
    .delete(authForParkingOwner, deleteParking);

parkingRouter.route('/parkingsFromArea')
    .get(getParkingsFromArea);

export default parkingRouter;