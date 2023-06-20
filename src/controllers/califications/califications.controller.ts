import { NextFunction, Request, Response } from "express";
import { connect } from "../../database";
import { BadRequestError, Conflict } from "../../error";
import { HttpStatus } from "../../httpStatus";
import { DatabaseError } from "pg";

export async function makeCalification(req: Request, res: Response, next: NextFunction) {
    try{
        if (!req.body.parkingID) throw new BadRequestError(true, 'parkingID');
        if (!req.body.userMail) throw new BadRequestError(true, 'userMail');
        if (!req.body.calification) throw new BadRequestError(true, 'clasification');
        if (!req.body.comment) throw new BadRequestError(true, 'comment');

        const conn = connect();
        await conn.query('INSERT INTO parkings_califications VALUES($1, $2, $3, $4)', [req.body.parkingID, req.body.userMail,
            req.body.calification, req.body.comment]);

        return res.status(HttpStatus.OK).send('operation succeded');
    }catch(err){
        if (err instanceof DatabaseError){
            const dErr: DatabaseError = err as DatabaseError;
            if (dErr.code === '23505'){
                if (dErr.constraint === 'unique_clasification')
                    return next(new Conflict(true, 'User already clasify this parking', 
                    'userMail, parkingID', req.params.userMail + ', ' + req.body.parkingID));
            }else if (dErr.code === '23514'){
                if (dErr.constraint === 'rating_constrain')
                    return next(new Conflict(true, 'Value of clasification goes between 1 and 5 inclusive', 'calification', 
                    req.body.calification));
            }
        }
        next(err);
    }
}

export async function modifyCalification(req: Request, res: Response, next: NextFunction){
    try{
        if (!req.body.parkingID) throw new BadRequestError(true, 'parkingID');
        if (!req.body.userMail) throw new BadRequestError(true, 'userMail');
        if (!req.body.calification) throw new BadRequestError(true, 'clasification');
        if (!req.body.comment) throw new BadRequestError(true, 'comment');

        const conn = connect();
        await conn.query('UPDATE parkings_califications SET calification = $3, comment = $4 WHERE parkinggid = $1 AND usermail = $2',
        [req.body.parkingID, req.body.userMail, req.body.calification, req.body.comment]);

        return res.status(HttpStatus.OK).send('operation succeded');

    }catch(err){
        next(err);
    }
}