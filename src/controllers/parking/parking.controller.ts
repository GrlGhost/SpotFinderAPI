import { NextFunction, Request, Response } from "express";
import { connect } from "../../database";
import { BadRequestError, BadRequestGeoBoxError, BadRequestGeoBoxOutOfBoundsError, Conflict, NotFoundError } from "../../error";
import { HttpStatus } from "../../httpStatus";
import { parking } from "../../interfaces/parking.interface";
import { boxArea } from "../../interfaces/boxArea.interface";
import { DatabaseError, QueryResult } from "pg";
import { modifieAttendance as modAttendanceAux } from "./parkingAux";
import { sendMoney } from "../Balance/balanceAux";


//TODO: check if datatipe body can be aplied interface user
export async function addParking(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    //adds an user to the database
    try {
        const newPark: parking = req.body;

        //NEW METHOD

        let strQuery = 'INSERT INTO parkings(geog, name, capacity, ownermail';
        let values = ['SRID=4326;POINT(' + newPark.lon + ' ' + newPark.lat + ')', newPark.name, newPark.capacity, newPark.ownerMail];
        if (newPark.openHour){
            strQuery+= ', openHour';
            values.push(newPark.openHour);
        }
        if (newPark.closeHour){
            strQuery+= ', closeHour';
            values.push(newPark.closeHour);
        }
        if (newPark.phone){
            strQuery+= ', phone';
            values.push(newPark.phone);
        }
        if (newPark.pricexminute){
            strQuery+= ', pricexminute';
            values.push(newPark.pricexminute);
        }
        strQuery += ') VALUES($1';
        for (let i = 2; i <= values.length; i++) {
            strQuery += `, $${i}`;
        }
        strQuery+= ')';
        console.log("Query: " + strQuery);
        

        //FINISH OF NEW METHOD

        const conn = connect();
        await conn.query(strQuery, values);
        return res.status(HttpStatus.OK).json({ response: 'Succesfuly created parking' })
    } catch (err) {
        if (err instanceof DatabaseError){
            const dbErr: DatabaseError = err as DatabaseError;
            if (dbErr.code === '23505'){
                if (dbErr.constraint === 'parkings_name_key') return next(new Conflict(true, 
                    'The name was already taken, try another name',
                    'name', req.body.mail));
            }else if (dbErr.code === '23502'){
                //TODO: manage all individual columns to return the corresponding message
                return next(new BadRequestError(true, dbErr.column as string))
            }
        }
        next(err);
    }
}

export async function modifieParking(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const parkingID = req.params.id;
        const updates = req.body;

        const allowedColumns: string[] = ['name', 'capacity', 'openHour', 'closeHour', 'phone', 'ownerMail', 'pricexminute'];
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
            ' closehour, phone, rating, attendance, pricexminute FROM parkings WHERE ownerMail = $1', [usermail]);

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
            'rating, attendance, pricexminute FROM parkings WHERE ST_Intersects(geog, ST_MakeEnvelope($1, $2, $3, $4, 4326))',
            [area.mLon, area.mLat, area.MLon, area.MLat]);

        res.status(HttpStatus.OK).json(result.rows);
    } catch (err) {
        return next(err);
    }
}


//TODO: this endpoint should not be so open to get users for mail user. The user should be pass by qr (previos endpoint)
//TODO: create a full table of price x time
export async function modifieAttendance(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const increase: boolean = req.body.increase;
        const userMail: string | null = req.body.userMail;

        if (req.body.automatedExit){
            if (userMail === null) throw new Error('Unexpected error, automated exit without mail');
            const conn = connect();
            const qRes: QueryResult = await conn.query('SELECT ownermail, pricexminute FROM parkings WHERE gid = $1', [req.params.id]);
            if (qRes.rowCount === 0) throw new NotFoundError(true, 'id');

            const qRes2: QueryResult = await conn.query('SELECT entryhourutc FROM user_parked_at WHERE usermail = $1', [userMail]);
            if (qRes2.rowCount === 0) throw new NotFoundError(true, 'userMail');

            const timeEntry: number[] = (qRes2.rows[0].entryhourutc as string).split(':').map(parseInt);

            const date: Date = new Date();
            const time: number[] = [date.getUTCHours(), date.getMinutes()];

            //Calculate time of stay
            let minutes = time[1]-timeEntry[1];
            minutes = (time[0]-timeEntry[0])*60;

            await sendMoney(userMail, qRes.rows[0].ownermail, qRes.rows[0].pricexminute*minutes);   
        }
        await modAttendanceAux(parseInt(req.params.id), userMail, increase, false, req.body.appClients);

        res.status(HttpStatus.OK).send('correctly updated');
    } catch (err) {
        next(err)
    }
}

export async function getAllInfoOfParking(req: Request, res: Response, next: NextFunction){
    try{
        const conn = connect();
        const response = await conn.query('SELECT gid AS id, ST_X(ST_Transform(geog::geometry, 4326)) longitude, ' +
        'ST_Y(ST_Transform(geog::geometry, 4326)) latitude, name, capacity, openhour, closehour, phone, ' +
        'rating, attendance, pricexminute FROM parkings WHERE gid = $1', [req.params.id]);
        
        if (response.rowCount == 0) throw new NotFoundError(true, 'id');

        res.status(HttpStatus.OK).send(response.rows[0]);
    } catch (err) {
        next(err);
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