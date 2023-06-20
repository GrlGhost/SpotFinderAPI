import { NextFunction, Request, Response } from "express";
import { connect } from "../database";
import { BadRequestError, Conflict, NotFoundError } from "../error";
import { HttpStatus } from "../httpStatus";
import { sign } from "jsonwebtoken";
import { DatabaseError } from "pg";



export async function getWhereUserIsParking(req: Request, res: Response, next: NextFunction){
    try {
        if (!req.params.userMail) throw new BadRequestError(true, 'userMail')
        const conn = connect();
        const rpUsersParked = await conn.query('SELECT parkinggid, entryHourUTC FROM user_parked_at WHERE userMail = $1', [req.params.userMail]);

        if (rpUsersParked.rowCount == 0) throw new NotFoundError(true, 'userMail');


        const rpParkings = await conn.query('SELECT gid AS id, ST_X(ST_Transform(geog::geometry, 4326)) longitude, ' +
        'ST_Y(ST_Transform(geog::geometry, 4326)) latitude, name, capacity, openhour, closehour, phone, ' +
        'rating, attendance FROM parkings WHERE gid = $1', [rpUsersParked.rows[0].parkinggid]);

        if (rpParkings.rowCount == 0) throw new NotFoundError(false, 'gid');

        const parkingData = rpParkings.rows[0];
        const userData = {'userMail': req.params.userMail};
        const jwt = sign(userData, 'SpotFinderQrPasword_325fsdao', {'issuer': 'SpFdAPIUserParkedAt'});

        res.status(HttpStatus.OK).send({
            'parkingData': parkingData,
            'token': jwt,
            'entryHourUTC': rpUsersParked.rows[0].entryhourutc
        });
        
    }catch(err){
        if (err instanceof DatabaseError){
            const dErr: DatabaseError = err as DatabaseError;
            if (dErr.code === '23505')
                if (dErr.constraint === 'unique_user_park_at')
                    return next(new Conflict(true, 'User parked or reserved at another parking', 'userMail', req.params.userMail));
        }
        return next(err);
    }
}

export async function getUsersAtParking(req: Request, res: Response, next: NextFunction) {
    try{
        const conn = connect();
        const response = await conn.query('SELECT * FROM user_parked_at WHERE parkinggid = $1', [req.params.id]);

        res.status(HttpStatus.OK).send(response.rows)
    }catch(err){
        next(err);
    }
}

