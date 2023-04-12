import { NextFunction, Request, Response } from "express";
import { BadRequestError, Unauthorize } from "../error";
import jwt, { JwtPayload } from 'jsonwebtoken';



export async function authForUserActions(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.body.token) throw new BadRequestError(true, 'token');

        //TODO: aplly sesion interface and verify mail.
        const tokenDecoded: JwtPayload = jwt.verify(req.body.token, 'SpotFinderSecretPSW105920') as JwtPayload;
        console.log(tokenDecoded);

        if (req.params.userMail) {
            if (req.params.userMail != tokenDecoded.userMail) throw new Unauthorize(true, 'for action user must be the same as stated in the token');

            next();
        } else if (req.body.mail) {
            if (req.body.mail != tokenDecoded.userMail) throw new Unauthorize(true, 'for action user must be the same as stated in the token');

            next();
        } else throw new BadRequestError(true, 'params.userMail | body.mail');

    } catch (err) {
        next(err);
    }
}