import { Router } from "express";
import { addParking, deleteParking, getParkingsFromArea, modifieAttendance, modifieParking } from "../controllers/parking/parking.controller";
import { authForParkingOwner } from "../controllers/parking/autPark.controller";
import { generateClient, subscribeToParkingLot, unsubscribeFromParkingLot } from "../controllers/event.controller";
import { assertQR, makeReservation } from "../controllers/parking/qr.controller";


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

parkingRouter.route('/:id/parkingReservation')
    .post(makeReservation)
    .get(assertQR);

parkingRouter.route('/:id')
    .post(authForParkingOwner, modifieParking)
    .delete(authForParkingOwner, deleteParking);





export default parkingRouter;