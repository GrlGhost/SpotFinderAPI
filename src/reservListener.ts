import { Response } from "express";

export class ReservListener {
    private listenerMail: string;
    private listenerResponse: Response

    constructor(mail: string, response: Response) {
        this.listenerMail = mail;
        this.listenerResponse = response;
    }

    public getMail(): string {
        return this.listenerMail;
    }

    public notifyNewRecervation(data: string) {
        this.listenerResponse.write(`event: reservation_recived\n`);
        this.listenerResponse.write(data);
    }

    public notifyReservationCanceled(data: string) {
        this.listenerResponse.write(`event: recervation_canceled\n`);
        this.listenerResponse.write(data);
    }
}