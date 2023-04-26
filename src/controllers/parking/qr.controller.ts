import { NextFunction, Request, Response } from "express";
import { modifieAttendance } from "./parkingAux";
import { JwtPayload, sign, verify, TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { HttpStatus } from "../../httpStatus";
import { qrData } from "../../interfaces/qrData.interface";

export async function makeReservation(req: Request, res: Response, next: NextFunction) {
    try {
        //increase counter in database and notify clients.
        await modifieAttendance(parseInt(req.params.id), true, req.body.appClients);
        //@ts-ignore
        const timeIdaux: NodeJS.Timeout = setTimeout(modifieAttendance, 5000, req.params.id, false, req.body.appClient);
        const timeId: number = timeIdaux[Symbol.toPrimitive]()
        const qrData: qrData = { userMail: req.body.userMail, timeId: timeId };

        //make a token for the qr
        const token: string = sign(qrData, 'SpotFinderQrPasword_325fsdao',
            { 'expiresIn': '3m', 'issuer': 'SpFdAPIqrGenerator' });
        //send the token
        res.status(HttpStatus.OK).send({ 'token': token });
    } catch (err) {
        next(err);
    }
}

export async function assertQR(req: Request, res: Response, next: NextFunction) {
    try {
        const token: string = req.params.token;
        const tokenData: JwtPayload = verify(token, 'SpotFinderQrPasword_325fsdao',
            { 'issuer': 'SpFdAPIqrGenerator' }) as JwtPayload;

        clearTimeout(tokenData.timeId);
        res.status(HttpStatus.OK).send({ 'message': 'qr validated', 'valid': true, 'userMail': tokenData.userMail });
    } catch (err) {
        if (err instanceof TokenExpiredError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'qr expired', 'valid': false });
        else if (err instanceof JsonWebTokenError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'invalid token by authentication or shape' })
        else next(err);
    }
}