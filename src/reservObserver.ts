import { ReservListener } from "./reservListener";

export class ReservObserver {
    private listeners: Set<ReservListener>;
    private observingId: number;

    constructor(parkingId: number) {
        this.observingId = parkingId;
        this.listeners = new Set<ReservListener>;
    }

    public getObservingId(): number {
        return this.observingId;
    }

    public addListener(listener: ReservListener) {
        if (listener === null) return;
        this.listeners.add(listener);
    }

    ///returns true if can be deleted
    public removeListener(listener: ReservListener): boolean {
        if (listener === null) return this.listeners.size === 0;
        this.listeners.delete(listener);
        return this.listeners.size === 0;
    }

    //token expiracy and who made it
    public notifyNewReservation(tokenExpiracy: string, reservationMaker: string) {
        if (!tokenExpiracy || !reservationMaker) return;
        const data = { id: this.observingId, tokenExpiracyHour: tokenExpiracy, reserver: reservationMaker };
        const eventData = `data: ${JSON.stringify(data)}\n\n`;
        this.listeners.forEach(l => l.notifyNewRecervation(eventData));
    }

    public notifyCanceledReservation(reservationMaker: string) {
        if (!reservationMaker) return;
        const data = { id: this.observingId, reserver: reservationMaker };
        const eventData = `data: ${JSON.stringify(data)}\n\n`;
        this.listeners.forEach(l => l.notifyReservationCanceled(eventData));
    }
}