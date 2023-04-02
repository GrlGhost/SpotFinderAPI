import { NextFunction, Request, Response } from "express";
import { connect } from "../database";
import { BadRequestError } from "../error";
import { HttpStatus } from "../httpStatus";
import { User } from "../interfaces/user.interfaces";


//TODO: check if datatipe body can be aplied interface user
export async function addUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    //adds an user to the database
    const body = req.body;
    console.log("Analizing body");
    if (body.mail == null) return next(new BadRequestError(true, 'mail'));
    else if (body.userName == null) return next(new BadRequestError(true, 'userName'));
    else if (body.psw == null) return next(new BadRequestError(true, 'psw'));
    else {
        console.log("Body verified");

        const newUser: User = body;
        //TODO: verify mail
        const conn = connect();
        await conn.query('INSERT INTO users SET ?', newUser);
        return res.status(HttpStatus.OK).json({ response: 'Succesfuly created user' })
    }
}

export async function modifieUser(req: Request, res: Response): Promise<Response> {
    //modifie an user to the database
    const mail: string = req.params.userMail
    const psw: string = req.body.psw; //TODO: check data type
    const conn = connect();
    await conn.query('UPDATE users set psw = ? WHERE mail = ?', [psw, mail])
    return res.json('user modified')
}

export async function deleteUser(req: Request, res: Response): Promise<Response> {
    //delete an user to the database
    //TODO: delete data from favorites table
    const mail: string = req.params.userMail
    const conn = connect();
    await conn.query('DELETE FROM users WHERE mail = ?', [mail])
    return res.json('user delete')
}