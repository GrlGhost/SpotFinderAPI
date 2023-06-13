import { NextFunction, Request, Response } from "express";
import { connect } from "../../database";
import { BadRequestError, BadRequestGeoBoxError, BadRequestGeoBoxOutOfBoundsError } from "../../error";
import { HttpStatus } from "../../httpStatus";
import { parking } from "../../interfaces/parking.interface";
import { boxArea } from "../../interfaces/boxArea.interface";
import { ClientsManager } from "../../clientsManager";
import { QueryResult } from "pg";
import { modifieAttendance as modAttendanceAux } from "./parkingAux";


//TODO: check if datatipe body can be aplied interface user
export async function addParking(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    //adds an user to the database
    try {
        const newPark: parking = req.body;

        const conn = connect();
        await conn.query('INSERT INTO parkings(geog, name, capacity, openHour, closeHour, phone, rating, ownermail)'
            + 'VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
            ['SRID=4326;POINT(' + newPark.lon + ' ' + newPark.lat + ')', newPark.name, newPark.capacity,
            newPark.openHour ? newPark.openHour : null, newPark.closeHour ? newPark.closeHour : null,
            newPark.phone ? newPark.phone : null, 0, newPark.ownerMail]);
        return res.status(HttpStatus.OK).json({ response: 'Succesfuly created parking' })
    } catch (err) {
        return next(err);
    }
}

export async function modifieParking(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const parkingID = req.params.id;
        const updates = req.body;

        const allowedColumns: string[] = ['name', 'capacity', 'openHour', 'closeHour', 'phone', 'ownerMail'];
        const validUpdates: validUpdates = {};

        Object.keys(updates).forEach(key => {
            if (allowedColumns.includes(key)) {
                validUpdates[key] = updates[key];
            }
        });

        let i: number = 1;
        let columns = Object.keys(validUpdates).map(key => `${key} = $${i++}`).join(', ');
        let values = Object.values(validUpdates);

        let dbReq = `UPDATE parkings SET ${columns} WHERE gid = $${i}`;
        values.push(parkingID);

        console.log('query built:');
        console.log('query:', dbReq);
        console.log('params:', values);

        const conn = connect();
        await conn.query(dbReq, values);

        res.status(HttpStatus.OK).send('parking modified')
    } catch (err) {
        return next(err);
    }
}

export async function deleteParking(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const parkingID = req.params.id;

        const conn = connect();
        await conn.query('DELETE FROM parkings WHERE gid = $1', [parkingID]);
        res.status(HttpStatus.OK).send('parking deleted');
    } catch (err) {
        return next(err);
    }
}

export async function getParkingsOfOwner(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const usermail: string = req.params.userMail;

        const conn = connect();
        const qres: QueryResult = await conn.query('SELECT gid AS id, ST_X(ST_Transform(geog::geometry, 4326)) ' +
            'longitude, ST_Y(ST_Transform(geog::geometry, 4326)) latitude, name, capacity, openhour,' +
            ' closehour, phone, rating FROM parkings WHERE ownerMail = $1', [usermail]);
        console.log("qres rows count: " + qres.rowCount);

        res.status(HttpStatus.OK).send({ 'parkingsOwned': qres.rows });
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
        const result = await conn.query('SELECT gid AS id, ST_X(ST_Transform(geog::geometry, 4326)) longitude, ' +
            'ST_Y(ST_Transform(geog::geometry, 4326)) latitude, name, capacity, openhour, closehour, phone, ' +
            'rating, attendance FROM parkings WHERE ST_Intersects(geog, ST_MakeEnvelope($1, $2, $3, $4, 4326))',
            [area.mLon, area.mLat, area.MLon, area.MLat]);

        res.status(HttpStatus.OK).json(result.rows);
    } catch (err) {
        return next(err);
    }
}

export async function modifieAttendance(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const increase: boolean = req.body.increase;
        const userMail: string | null = req.body.userMail;
        await modAttendanceAux(parseInt(req.params.id), userMail, increase, false, req.body.appClients);

        res.status(HttpStatus.OK).send('correctly updated');
    } catch (err) {
        next(err)
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

interface validUpdates {
    [key: string]: any;
}