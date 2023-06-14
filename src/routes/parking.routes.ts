import { Router } from "express";
import { addParking, deleteParking, getAllInfoOfParking, getParkingsFromArea, getParkingsOfOwner, modifieAttendance, modifieParking } from "../controllers/parking/parking.controller";
import { authForParkingOwner } from "../controllers/parking/autPark.controller";
import { generateClient, subscribeToParkingLot, unsubscribeFromParkingLot } from "../controllers/event.controller";
import { assertAndAddUserFromUserAtParking, assertQR, makeReservation } from "../controllers/parking/qr.controller";
import { authForUserActions } from "../controllers/user/authenticate.controller";
import { generateReservListener, startListeneningReservsOfParking, stopListenengReservOfParkings } from "../controllers/reservListener.controllers";
import { getUsersAtParking } from "../controllers/userParkedAt.controller";


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

//TODO: auth of owner or manager
parkingRouter.route('/reservationListener')
    .post(generateReservListener);

//TODO: auth of owner or manager
parkingRouter.route('/reservationListener/:ids')
    .post(startListeneningReservsOfParking)
    .delete(stopListenengReservOfParkings);

parkingRouter.route('/ownedParkings/:userMail')
    .get(authForUserActions, getParkingsOfOwner);

parkingRouter.route('/manageParkings/:id')
    .post(authForParkingOwner, modifieParking)
    .get(getAllInfoOfParking)
    .delete(authForParkingOwner, deleteParking);

parkingRouter.route('/:id/:token/userExit')
    .get(assertAndAddUserFromUserAtParking, modifieAttendance);

//TODO: add auth middleware
parkingRouter.route('/:id/modifieAttendance')
    .post(modifieAttendance);

parkingRouter.route('/:id/parkingReservation')
    .post(makeReservation);

parkingRouter.route('/:id/usersAtParking')
    .get(getUsersAtParking);

parkingRouter.route('/:token/parkingReservation')
    .get(assertQR);









export default parkingRouter;