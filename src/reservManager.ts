import { ReservListener } from "./reservListener";
import { ReservObserver } from "./reservObserver";

export class ReservManager {
    private listeners: Set<ReservListener>;
    private observers: { [observingId: number]: ReservObserver };

    constructor() {
        this.listeners = new Set<ReservListener>;
        this.observers = {};
    }

    public addListener(listener: ReservListener) {
        if (!listener) return;
        this.listeners.add(listener);
        console.log("listener added: " + this.listeners.size);

    }

    public removeListener(listener: ReservListener) {
        if (!listener) return;
        this.listeners.delete(listener);
    }

    public getListener(mail: string): ReservListener | null {
        for (let listener of this.listeners) {
            if (listener.getMail() !== mail) continue;
            return listener;
        }
        return null;
    }

    public startListenening(mail: string, id: number) {
        let observer: ReservObserver = this.observers[id];
        if (!observer) {
            observer = new ReservObserver(id);
            this.observers[id] = observer;
        }
        const listener: ReservListener | null = this.getListener(mail);
        if (!listener) throw new Error('Not listener found');

        observer.addListener(listener);
    }

    public stopListening(mail: string, id: number) {
        let observer: ReservObserver = this.observers[id];
        if (!observer) return;
        const listener = this.getListener(mail);
        if (!listener) throw new Error('Not listener found');
        if (observer.removeListener(listener)) delete (this.observers[id]);
    }

    public notifyNewReservation(id: number, tokenExpiration: string, reservationMaker: string) {
        this.observers[id]?.notifyNewReservation(tokenExpiration, reservationMaker);
    }

    public notifyReservationCanceled(id: number, reservationMaker: string) {
        this.observers[id]?.notifyCanceledReservation(reservationMaker);
    }

}