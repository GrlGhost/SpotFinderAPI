import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../error";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connect } from "../database";
import { QueryResultRow } from "pg";
import { NotFoundError } from "../error";
import { Unauthorize } from "../error";



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

        console.log(dbRes.row);
        console.log(dbRes.rows);

        if (dbRes.row[0] != tokenDecoded.userMail) throw new Unauthorize(true, 'verify user or parking');

        next();
    } catch (err) {
        next(err);
    }
}