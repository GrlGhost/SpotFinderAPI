import { NextFunction, Request, Response } from "express";
import { connect } from "../database";
import { BadRequestError, BadRequestGeoBoxError, BadRequestGeoBoxOutOfBoundsError } from "../error";
import { HttpStatus } from "../httpStatus";
import { parking } from "../interfaces/parking.interface";
import { boxArea } from "../interfaces/boxArea.interface";


//TODO: check if datatipe body can be aplied interface user
export async function addParking(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    //adds an user to the database
    try {
        const newPark: parking = req.body;

        const conn = connect();
        await conn.query('INSERT INTO parkings(geog, name, capacity, openHour, closeHour, phone, rating, ownermail)'
            + 'VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
            ['SRID=4326;POINT(' + newPark.lat + ' ' + newPark.lon + ')', newPark.name, newPark.capacity,
            newPark.openHour ? newPark.openHour : null, newPark.closeHour ? newPark.closeHour : null,
            newPark.phone ? newPark.phone : null, 0, newPark.ownerMail]);
        return res.status(HttpStatus.OK).json({ response: 'Succesfuly created user' })
    } catch (err) {
        return next(err);
    }
}

export async function modifieParking(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        throw new Error("not implemented");
    } catch (err) {
        return next(err);
    }
}

export async function deleteParking(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        throw new Error("not implemented");
    } catch (err) {
        return next(err);
    }
}

export async function getParkings(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        throw new Error("not implemented");
    } catch (err) {
        return next(err);
    }
}

export async function getParkingsFromArea(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const area: boxArea = req.body;
        assertBox(area.mLon, area.mLat, area.MLon, area.MLat);

        const conn = connect();
        //min_lon, min_lat, max_lon, max_lat, 4326
        const result = await conn.query('SELECT * FROM parkings WHERE ST_Intersects(geog, ST_MakeEnvelope($1, $2, $3, $4, 4326))',
            [area.mLon, area.mLat, area.MLon, area.MLat]);

        res.status(HttpStatus.OK).json(result.rows);
    } catch (err) {
        return next(err);
    }
}

function assertBox(mLon: number, mLat: number, MLon: number, MLat: number) {
    if (mLon >= MLon) throw new BadRequestGeoBoxError(true, 'mLon', 'MLon');
    if (mLat >= MLat) throw new BadRequestGeoBoxError(true, 'mLat', 'MLat');
    if (mLon < -180 || 180 < mLon) throw new BadRequestGeoBoxOutOfBoundsError(true, 'mLon', -180, 180);
    if (MLon < -180 || 180 < MLon) throw new BadRequestGeoBoxOutOfBoundsError(true, 'MLon', -180, 180);
    if (mLat < -90 || 90 < mLat) throw new BadRequestGeoBoxOutOfBoundsError(true, 'mLat', -90, 90);
    if (MLat < -90 || 90 < MLat) throw new BadRequestGeoBoxOutOfBoundsError(true, 'MLat', -90, 90);
}