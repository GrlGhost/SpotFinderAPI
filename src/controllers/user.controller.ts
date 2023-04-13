import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { connect } from "../database";
import { BadRequestError, NotFoundError, PassWordMissMatch } from "../error";
import { HttpStatus } from "../httpStatus";
import { User } from "../interfaces/user.interfaces";
import { session } from "../interfaces/session.interface";


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

        const hPsw = await bcrypt.hash(newUser.psw, 10);

        const conn = connect();
        await conn.query('INSERT INTO users(username, mail, psw) VALUES($1, $2, $3)',
            [newUser.userName, newUser.mail, hPsw]);

        req.params = { "userMail": body.mail };

        next();
    } catch (err) {
        return next(err);
    }
}

export async function logInUser(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.body.psw) throw new BadRequestError(true, 'psw');

        const conn = connect();
        let response;

        if (req.params.userMail) {
            response = await conn.query('SELECT * FROM users WHERE mail = $1', [req.params.userMail]);
        } else throw new BadRequestError(true, 'userMail');

        if (response.rowCount == 0) throw new NotFoundError(true, 'user');

        const user: User = response.rows[0];

        console.log("psw: " + req.body.psw);

        const pswMatch: Boolean = bcrypt.compareSync(req.body.psw, user.psw);
        if (!pswMatch) throw new PassWordMissMatch(true);

        const sessionData: session = { userMail: user.mail, userName: user.userName };
        const token = jwt.sign(sessionData, 'SpotFinderSecretPSW105920',
            { 'expiresIn': '3h' });
        res.status(HttpStatus.OK).send(token);
    } catch (err) {
        next(err);
    }
}

export async function modifieUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        //modifie an user to the database
        const mail: string = req.params.userMail;
        const psw: string = req.body.psw; //TODO: check data type

        const hPsw = await bcrypt.hash(psw, 10);

        const conn = connect();
        await conn.query('UPDATE users set psw = $1 WHERE mail = $2', [hPsw, mail])
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
        return res.status(HttpStatus.OK).json('user delete')
    } catch (err) {
        return next(err);
    }
}

