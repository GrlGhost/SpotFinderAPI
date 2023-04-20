import { NextFunction, Request, Response } from "express";
import { AppClient } from "../client";
import { HttpStatus } from "../httpStatus";
import { BadRequestError, NotFoundError } from "../error";
import { connect } from "../database";
import { v4 as uuidv4 } from 'uuid';
import { ClientsManager } from "../clientsManager";


export function generateClient(req: Request, res: Response, next: NextFunction) {
    try {
        const clientsManager: ClientsManager = req.body.appClients;

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Check for existing ID in Last-Event-ID header
        const clientID = req.headers['last-event-id'] as string || uuidv4();

        let client: AppClient;
        let auxClient: AppClient | null = clientsManager.getClient(clientID);
        //@ts-ignore: variable not asigned.
        if (auxClient === null) {
            client = new AppClient(res);
            clientsManager.addClient(client);
        } else { client = auxClient; }

        //write to user
        res.write(`id: ${client.getClientID()}\n`)
        res.write(`event: client_id\n\n`);

        console.log(`client id: ${client.getClientID()} connected`);

        //close client event listener
        req.on('close', () => {
            console.log(`client id: ${client.getClientID()} disconected`);
            clientsManager.removeClient(client.getClientID());
        })
    } catch (err) {
        next(err);
    }
}

//this method does't alert if key doesn't exist;
export async function subscribeToParkingLot(req: Request, res: Response, next: NextFunction) {
    try {
        //seting variables
        const clientsManager: ClientsManager = req.body.appClients;
        const clientID: string = req.body.clientID;
        let client: AppClient;

        if (!clientID) throw new BadRequestError(true, 'clientID');

        //set client
        let auxClient = clientsManager.getClient(clientID);
        if (auxClient == null) throw new NotFoundError(true, 'clientID');
        client = auxClient;

        const keys: string = req.params.ids;
        if (keys == null) throw new BadRequestError(true, "ids in params");
        const parkingIDs: number[] = keys.split(',').map((k: string) => parseInt(k));

        //subscribe to existing parkings.
        const conn = connect();
        const connRes = await conn.query('SELECT parkings.gid FROM parkings WHERE gid = ANY ($1)', [parkingIDs]);
        connRes.rows.forEach(r => client.addKeyToListen(r.gid));

        res.status(HttpStatus.OK).json('existing keys added');
    } catch (err) {
        next(err);
    }
}

export async function unsubscribeFromParkingLot(req: Request, res: Response, next: NextFunction) {
    try {
        //seting variables.
        const clientsManager: ClientsManager = req.body.appClients;
        const clientID: string = req.body.clientID;
        let client: AppClient;

        if (!clientID) throw new BadRequestError(true, 'clientID');

        //set client
        let auxClient = clientsManager.getClient(clientID);
        if (auxClient == null) throw new NotFoundError(true, 'clientID');
        client = auxClient;

        const parkingIDs: string[] = req.params.parkingID.split(',');

        //remove listeners.
        client.removeKeysFromListen(parkingIDs.map(id => parseInt(id)));
    } catch (err) {
        next(err);
    }
}