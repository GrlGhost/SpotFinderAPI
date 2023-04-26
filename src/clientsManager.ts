import { AppClient } from "./client";
import { Response } from "express";


export class ClientsManager {
    private clients: AppClient[];

    constructor() {
        this.clients = [];
    }

    public addClient(newClient: AppClient) {
        this.clients.push(newClient);
    }

    public removeClient(clientID: string) {
        this.clients = this.clients.filter(c => c.getClientID() !== clientID);
    }

    public getClient(clientID: string): AppClient | null {
        for (let i = 0; i < this.clients.length; i++) {
            if (this.clients[i].getClientID() !== clientID) continue;
            return this.clients[i];
        }
        return null;
    }

    public notifyClients(key: number, attendace: number) {
        const data = { "key": key, "attendance": attendace }
        const eventData = `data: ${JSON.stringify(data)}\n\n`;

        this.clients.forEach(c => {
            if (c.isListening(key)) {
                const res: Response = c.getResponse();
                res.write(`event: assist_update\n`);
                res.write(eventData);
            }
        })
    }
}