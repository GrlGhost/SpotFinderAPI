import { DatabaseError } from "pg";
import { connect } from "./database"
import { Conflict } from "./error";


//TODO: errors not rising
export async function addUserToParkAt(userMail: string, parkingId: string, entryHourUTC: boolean) {
    try{        
        const conn = connect();
        if (entryHourUTC) {
            const date: Date = new Date();
            const time: string = date.getUTCHours() + ":" + date.getMinutes();

            await conn.query('INSERT INTO user_parked_at VALUES($1, $2, $3)', [userMail, parkingId, time]);
        }
        else 
            await conn.query('INSERT INTO user_parked_at(usermail, parkinggid) VALUES($1, $2)', [userMail, parkingId]);
            

    }catch(err){
        if (err instanceof DatabaseError) {
            const dErr: DatabaseError = err as DatabaseError;
            if (dErr.code === '23505') {
                if (dErr.constraint === 'unique_user_park_aty') throw new Conflict(true,
                    'The user is alredy in another parking', 'userMail', userMail);
            }
        }        
        throw err;
    }
    
}

export async function setEntryTime(userMail: string){
    const conn = connect();
    const date: Date = new Date();
    const time: string = date.getUTCHours() + ":" + date.getMinutes();
    await conn.query('UPDATE user_parked_at SET entryHourUTC = $1 WHERE userMail = $2', [time, userMail])
}

export async function removeUserToParkAt(userMail: string) {
        const conn = connect();
        await conn.query('DELETE FROM user_parked_at WHERE userMail = $1', [userMail]);
}