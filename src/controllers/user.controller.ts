import { NextFunction, Request, Response } from "express";
import { connect } from "../database";
import { BadRequestError } from "../error";
import { HttpStatus } from "../httpStatus";
import { User } from "../interfaces/user.interfaces";


//TODO: check if datatipe body can be aplied interface user
export async function addUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    //adds an user to the database
    try {
        const body = req.body;
        console.log("Analizing body");
        if (body.mail == null) throw new BadRequestError(true, 'mail');
        else if (body.userName == null) throw new BadRequestError(true, 'userName');
        else if (body.psw == null) throw new BadRequestError(true, 'psw');

        console.log("Body verified");
        const newUser: User = body;
        //TODO: verify mail
        const conn = connect();
        await conn.query('INSERT INTO users(username, mail, psw) VALUES($1, $2, $3)',
            [newUser.userName, newUser.mail, newUser.psw]);
        return res.status(HttpStatus.OK).json({ response: 'Succesfuly created user' })

    } catch (err) {
        return next(err);
    }
}

export async function modifieUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        //modifie an user to the database
        const mail: string = req.params.userMail
        //TODO: verify mail.
        const psw: string = req.body.psw; //TODO: check data type
        const conn = connect();
        await conn.query('UPDATE users set psw = $1 WHERE mail = $2', [psw, mail])
        return res.status(HttpStatus.OK).json('user modified')
    } catch (err) {
        return next(err);
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        //delete an user to the database
        //TODO: delete data from favorites table
        const mail: string = req.params.userMail
        const conn = connect();
        await conn.query('DELETE FROM users WHERE mail = $1', [mail])
        return res.json('user delete')
    } catch (err) {
        return next(err);
    }
}