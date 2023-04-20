import { Response } from "express";
import { v4 as uuidv4 } from "uuid";

export class AppClient {
    private clientID: string;
    private clientResponse: Response;
    private parkingIDS: Set<number>;

    constructor(response: Response) {
        this.clientID = uuidv4();
        this.clientResponse = response;
        this.parkingIDS = new Set<number>;
    }

    public veryfyClientID(id: string): boolean {
        return this.clientID === id;
    }

    public getClientID(): string { return this.clientID; }

    public getResponse(): Response { return this.clientResponse; }

    public addKeyToListen(k: number) { this.parkingIDS.add(k); }

    public removeKeyFromListen(k: number) { this.parkingIDS.delete(k); }

    public removeKeysFromListen(ks: number[]) { ks.forEach(k => this.parkingIDS.delete(k)) }

    public isListening(k: number): boolean { return this.parkingIDS.has(k); }
}