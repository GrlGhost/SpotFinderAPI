import { NextFunction, Request, Response } from "express";
import { modifieAttendance } from "./parkingAux";
import { JwtPayload, sign, verify, TokenExpiredError, JsonWebTokenError, decode } from "jsonwebtoken";
import { HttpStatus } from "../../httpStatus";
import { qrData } from "../../interfaces/qrData.interface";
import { ClientsManager } from "../../clientsManager";
import { ReservManager } from "../../reservManager";
import { addUserToParkAt, setEntryTime } from "../../userParkedAt";

//TODO: same user can't make multiple reservations
export async function makeReservation(req: Request, res: Response, next: NextFunction) {
    try {
        const appClient: ClientsManager = req.body.appClients;
        const rvManager: ReservManager = req.body.rvManager;
        //increase counter in database and notify clients.
        await modifieAttendance(parseInt(req.params.id), req.body.userMail, true, true, appClient);
        //@ts-ignore
        const timeIdaux: NodeJS.Timeout = setTimeout(modifieAttendance, 600000, req.params.id, req.body.userMail, false, false, appClient);
        const timeId: number = timeIdaux[Symbol.toPrimitive]()
        const qrData: qrData = { parkingId: parseInt(req.params.id), userMail: req.body.userMail, timeId: timeId };

        //make a token for the qr
        const token: string = sign(qrData, 'SpotFinderQrPasword_325fsdao',
            { 'expiresIn': '600s', 'issuer': 'SpFdAPIqrGenerator' });

        //notufy owner and manager
        const decodedToken: JwtPayload = decode(token) as JwtPayload;
        const date: Date = new Date((decodedToken.exp as number) * 1000);
        rvManager.notifyNewReservation(parseInt(req.params.id), date.toUTCString(), req.body.userMail);

        //send the token
        res.status(HttpStatus.OK).send({ 'token': token });
    } catch (err) {
        next(err);
    }
}

//TODO: listen to reservation asserted
export async function assertQR(req: Request, res: Response, next: NextFunction) {
    try {
        const token: string = req.params.token;
        const tokenData: JwtPayload = verify(token, 'SpotFinderQrPasword_325fsdao',
            { 'issuer': 'SpFdAPIqrGenerator' }) as JwtPayload;

        clearTimeout(tokenData.timeId);
        setEntryTime(tokenData.userMail);

        res.status(HttpStatus.OK).send({ 'message': 'qr validated', 'valid': true, 'userMail': tokenData.userMail });
    } catch (err) {
        if (err instanceof TokenExpiredError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'qr expired', 'valid': false });
        else if (err instanceof JsonWebTokenError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'invalid token by authentication or shape' });
        else next(err);
    }
}

//TODO: add to routes.
export async function cancelReservation(req: Request, res: Response, next: NextFunction) {
    try {
        const token: string = req.params.token;
        const rvManager: ReservManager = req.body.rvManager;
        const appClients: ClientsManager = req.body.appClients;

        const tokenData: JwtPayload & qrData = verify(token, 'SpotFinderQrPasword_325fsdao',
            { 'issuer': 'SpFdAPIqrGenerator' }) as JwtPayload & qrData;

        clearTimeout(tokenData.timeId);
        modifieAttendance(tokenData.parkingId, tokenData.userMail, false, false, appClients);

        rvManager.notifyReservationCanceled(tokenData.parkingId, tokenData.userMail);

        res.status(HttpStatus.OK).send({ 'message': 'reservation canceled' });
    } catch (err) {
        if (err instanceof JsonWebTokenError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'invalid token by authentication or shape' });
        else next(err);
    }
}

/* 
This method check that the token was issued by the correct authority and extracts the user from it adding it to the body.
*/
export async function assertAndAddUserFromUserAtParking(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const token: string = req.params.token;
        const tokenData: JwtPayload = verify(token, 'SpotFinderQrPasword_325fsdao',
            { 'issuer': 'SpFdAPIUserParkedAt' }) as JwtPayload;

        req.body.userMail = tokenData.userMail;
        req.body.increase = false;
        next();
    } catch (err) {
        if (err instanceof JsonWebTokenError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'invalid token by authentication or shape' });
        else next(err);
    }
}