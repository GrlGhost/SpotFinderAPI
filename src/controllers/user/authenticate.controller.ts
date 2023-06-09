import { NextFunction, Request, Response } from "express";
import { BadRequestError, Unauthorize } from "../../error";
import jwt, { JwtPayload, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { HttpStatus } from "../../httpStatus";




export async function authForUserActions(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.header('Authorization')) throw new BadRequestError(true, 'Authorization');

        const token: string = req.header('Authorization')?.replace('Bearer ', '') as string;

        const tokenDecoded: JwtPayload = jwt.verify(token, 'SpotFinderSecretPSW105920') as JwtPayload;

        if (req.params.userMail) {
            if (req.params.userMail != tokenDecoded.userMail) throw new Unauthorize(true, 'verify user');

            next();
        } else if (req.body.mail) {
            if (req.body.mail != tokenDecoded.userMail) throw new Unauthorize(true, 'verify user');

            next();
        } else throw new BadRequestError(true, 'params.userMail | body.mail');

    } catch (err) {
        if (err instanceof TokenExpiredError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'token expired', 'valid': false });
        else if (err instanceof JsonWebTokenError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'invalid token by authentication or shape' });
        else next(err);
    }
}