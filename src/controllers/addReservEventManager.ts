import { ReservManager } from "../reservManager";
import { Request, Response, NextFunction } from "express";

export function addReservManager(rvManager: ReservManager) {
    console.log('add reserv called');

    return (req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/reservationListener') || req.path.includes('/parkingReservation')) {
            req.body.rvManager = rvManager;
            console.log("rv manager added");
        }
        next();
    }
}