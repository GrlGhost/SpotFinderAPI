import { NextFunction, Request, Response } from "express";
import { ReservListener } from "../reservListener";
import { BadRequestError, NotFoundError } from "../error";
import { ReservManager } from "../reservManager";
import { connect } from "../database";
import { HttpStatus } from "../httpStatus";

export function generateReservListener(req: Request, res: Response, next: NextFunction) {
    try {
        const rvManager: ReservManager = req.body.rvManager;

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Check for existing ID in Last-Event-ID header
        const mail = req.headers['last-event-mail'] as string || req.body.mail;
        if (mail === null) throw new BadRequestError(true, 'mail');

        let listener: ReservListener;
        let auxListener: ReservListener | null = rvManager.getListener(mail);
        //@ts-ignore: variable not asigned.
        if (auxListener === null) {
            listener = new ReservListener(mail, res);
            rvManager.addListener(listener);
        } else { listener = auxListener; }

        //write to user
        res.write(`mail: ${listener.getMail()}\n`)
        res.write(`event: client_mail\n\n`);

        //TODO: close this
        //close client event listener
        /*req.on('close', () => {
            console.log(`client mail: ${listener.getMail()} disconected`);
            rvManager.removeListener(listener);
        })*/
    } catch (err) {
        next(err);
    }
}

export async function startListeneningReservsOfParking(req: Request, res: Response, next: NextFunction) {
    try {
        const rvManager: ReservManager = req.body.rvManager;
        const mail: string = req.body.mail;

        console.log("mail: " + mail);

        if (!mail) throw new BadRequestError(true, 'mail');

        let listener: ReservListener;
        const auxListener: ReservListener | null = rvManager.getListener(mail);
        if (auxListener === null) throw new NotFoundError(true, 'mail as listener');
        listener = auxListener;

        const keys: string = req.params.ids;
        if (keys == null) throw new BadRequestError(true, "ids in params");
        const parkingIDs: number[] = keys.split(',').map((k: string) => parseInt(k));

        //subscribe to existing parkings.
        const conn = connect();
        const connRes = await conn.query('SELECT parkings.gid FROM parkings WHERE gid = ANY ($1)', [parkingIDs]);
        connRes.rows.forEach(r => rvManager.startListenening(mail, r.gid));

        res.status(HttpStatus.OK).json('existing keys added');

    } catch (err) {
        next(err);
    }
}

export async function stopListenengReservOfParkings(req: Request, res: Response, next: NextFunction) {
    try {
        //seting variables.
        const rvManager: ReservManager = req.body.rvManager;
        const mail: string = req.body.mail;
        let listener: ReservListener;

        if (!mail) throw new BadRequestError(true, 'mail');

        //set client
        let auxListener = rvManager.getListener(mail);
        if (auxListener == null) throw new NotFoundError(true, 'mail');
        listener = auxListener;

        const parkingIDs: string[] = req.params.parkingID.split(',');

        //remove listeners.
        parkingIDs.forEach(id => rvManager.stopListening(mail, parseInt(id)));
    } catch (err) {

    }
}