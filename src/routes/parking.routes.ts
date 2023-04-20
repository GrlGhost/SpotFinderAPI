import { Router } from "express";
import { addParking, deleteParking, getParkingsFromArea, modifieAttendance, modifieParking } from "../controllers/parking.controller";
import { authForParkingOwner } from "../controllers/autPark.controller";
import { generateClient, subscribeToParkingLot, unsubscribeFromParkingLot } from "../controllers/event.controller";


const parkingRouter = Router();

parkingRouter.route('/')
    .post(addParking);

parkingRouter.route('/parkingsFromArea')
    .get(getParkingsFromArea);

parkingRouter.route('/events')
    .post(generateClient);

parkingRouter.route('/events/:ids')
    .post(subscribeToParkingLot)
    .delete(unsubscribeFromParkingLot);

//TODO: add auth middleware
parkingRouter.route('/:id/modifieAttendance')
    .post(modifieAttendance);

parkingRouter.route('/:id')
    .post(authForParkingOwner, modifieParking)
    .delete(authForParkingOwner, deleteParking);



export default parkingRouter;