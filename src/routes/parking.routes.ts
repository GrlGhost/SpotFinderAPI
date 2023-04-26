import { Router } from "express";
import { addParking, deleteParking, getParkingsFromArea, getParkingsOfOwner, modifieAttendance, modifieParking } from "../controllers/parking/parking.controller";
import { authForParkingOwner } from "../controllers/parking/autPark.controller";
import { generateClient, subscribeToParkingLot, unsubscribeFromParkingLot } from "../controllers/event.controller";
import { assertQR, makeReservation } from "../controllers/parking/qr.controller";
import { authForUserActions } from "../controllers/user/authenticate.controller";


const parkingRouter = Router();

parkingRouter.route('/')
    .post(addParking);

parkingRouter.route('/parkingsFromArea')
    .post(getParkingsFromArea);

parkingRouter.route('/events')
    .post(generateClient);

parkingRouter.route('/events/:ids')
    .post(subscribeToParkingLot)
    .delete(unsubscribeFromParkingLot);

//TODO: add auth middleware
parkingRouter.route('/:id/modifieAttendance')
    .post(modifieAttendance);

parkingRouter.route('/:id/parkingReservation')
    .post(makeReservation);

parkingRouter.route('/:token/parkingReservation')
    .get(assertQR);

parkingRouter.route('/:id')
    .post(authForParkingOwner, modifieParking)
    .delete(authForParkingOwner, deleteParking);

parkingRouter.route('/:userMail')
    .get(authForUserActions, getParkingsOfOwner);





export default parkingRouter;