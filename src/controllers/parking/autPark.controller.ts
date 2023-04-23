import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../error";
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { connect } from "../../database";
import { QueryResultRow } from "pg";
import { NotFoundError } from "../../error";
import { Unauthorize } from "../../error";
import { HttpStatus } from "../../httpStatus";



export async function authForParkingOwner(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.header('Authorization')) throw new BadRequestError(true, 'Authorization');

        const token: string = req.header('Authorization')?.replace('Bearer ', '') as string;
        const tokenDecoded: JwtPayload = jwt.verify(token, 'SpotFinderSecretPSW105920') as JwtPayload;

        if (!req.params.id) throw new BadRequestError(true, 'id');

        const conn = connect();
        const dbRes: QueryResultRow = await conn.query('SELECT ownermail from parkings WHERE gid = $1',
            [req.params.id]);

        if (dbRes.rowCount == 0) throw new NotFoundError(true, 'parking');

        if (dbRes.rows[0].ownermail != tokenDecoded.userMail) throw new Unauthorize(true, 'verify user or parking');

        next();
    } catch (err) {
        if (err instanceof TokenExpiredError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'token expired', 'valid': false });
        else if (err instanceof JsonWebTokenError)
            res.status(HttpStatus.Unauthorised).send({ 'message': 'invalid token by authentication or shape' });
        else next(err);
    }
}