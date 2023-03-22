import { Request, Response } from "express";
import { connect } from "../database";
import { User } from "../interfaces/user.interfaces";


//TODO: check if datatipe body can be aplied interface user
export async function addUser(req: Request, res: Response): Promise<Response> {
    //adds an user to the database
    const newUser: User = req.body;
    const conn = connect();
    await conn.query('INSERT INTO users SET ?', newUser);
    return res.json('user created')
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