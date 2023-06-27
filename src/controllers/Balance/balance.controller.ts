import { NextFunction, Request, Response } from "express";
import { BadRequestError, ErrorRest, NotFoundError } from "../../error";
import { connect } from "../../database";
import { HttpStatus } from "../../httpStatus";

export async function addBalance(req: Request, res: Response, next: NextFunction){
    try{
        if (!req.body.balance) throw new BadRequestError(true, 'balance');
        if (req.body.balance <= 0) {
            const status: number = HttpStatus['BadRequest'];
            const message: string = 'Not balid balance to add';
            throw new ErrorRest({status, message});
        }

        const conn = connect();
        const qRes = await conn.query('UPDATE balance SET balance = balance + $1 WHERE mail = $2', [req.body.balance, req.params.mail]);
        if (qRes.rowCount == 0) throw new NotFoundError(true, 'mail');

        res.status(HttpStatus.OK).send({balance: qRes.rows[0].balance, message: 'operation made succesefully'});
    }catch(err){
        next(err);
    }
}

export async function getBalance(req: Request, res: Response, next: NextFunction){
    try{
        const conn = connect();
        const qRes = await conn.query('SELECT balance FROM balance WHERE mail = $1', [req.params.mail]);
        if (qRes.rowCount === 0) res.status(HttpStatus.OK).send({balance: 0, message: 'operation made succesefully'});
        else res.status(HttpStatus.OK).send({balance: qRes.rows[0].balance, message: 'operationn made succesfully'});
    }catch(err){
        next(err);
    }
}