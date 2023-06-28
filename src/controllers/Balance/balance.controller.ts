import { NextFunction, Request, Response } from "express";
import { BadRequestError, ErrorRest, NotFoundError, PersonalizedBadRequestError } from "../../error";
import { connect } from "../../database";
import { HttpStatus } from "../../httpStatus";
import { QueryResult } from "pg";

export async function addBalance(req: Request, res: Response, next: NextFunction){
    try{
        if (!req.body.balance) throw new BadRequestError(true, 'balance');
        if (req.body.balance <= 0) {
            throw new PersonalizedBadRequestError(true, 'Not valid balance to add in property', 'balance');
        }

        const conn = connect();
        let qRes: QueryResult = await conn.query('UPDATE balance SET balance_c = balance_c + $1 WHERE mail = $2', [req.body.balance, req.params.mail]);
        if (qRes.rowCount === 0) {
            qRes = await conn.query('INSERT INTO balance VALUES($1, $2)', [req.params.mail, req.body.balance]); 
        }

        getBalance(req, res, next);
    }catch(err){
        next(err);
    }
}

export async function getBalance(req: Request, res: Response, next: NextFunction){
    try{
        const conn = connect();
        const qRes = await conn.query('SELECT balance_c FROM balance WHERE mail = $1', [req.params.mail]);
        if (qRes.rowCount === 0) res.status(HttpStatus.OK).send({balance: 0, message: 'operation made succesefully'});
        else res.status(HttpStatus.OK).send({balance: qRes.rows[0].balance, message: 'operation made succesfully'});
    }catch(err){
        next(err);
    }
}