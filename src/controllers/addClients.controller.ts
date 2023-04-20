import { NextFunction, Request, Response } from "express";
import { ClientsManager } from "../clientsManager";

export function addClients(appClients: ClientsManager) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.path === "/parkingsFromArea" || req.path.includes('/events') ||
            req.path.includes('/modifieAttendance')) {
            req.body.appClients = appClients;
        }
        next();
    }
}