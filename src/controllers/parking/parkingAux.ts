import { QueryResult } from "pg";
import { ClientsManager } from "../../clientsManager";
import { connect } from "../../database";
import { addUserToParkAt, removeUserToParkAt } from "../../userParkedAt";

//TODO: manage chk_attendance error
/**The method modifie attendance has power over UserToPark.
 * In case you don't want to add the user to user_parked_at you MUST NOT pass the user, instead use null.
 */
//TODO: before setting down the attendance without mail, should check if there was someone that entered without mail, 
//could be an extra column in parking
export async function modifieAttendance(parkId: number, userMail: string | null,  increase: boolean, reservation: boolean,
     clManager: ClientsManager) {

    try{
        let connRes: QueryResult;
        const conn = connect();
        if (increase){
            connRes = await conn.query('UPDATE parkings SET attendance = attendance + 1 WHERE gid = $1 RETURNING attendance',
                [parkId]);
            if (userMail == null) return;
            addUserToParkAt(userMail, parkId.toString(),!reservation);
        }
        else{
            connRes = await conn.query('UPDATE parkings SET attendance = attendance - 1 WHERE gid = $1 RETURNING attendance',
                [parkId]);
            if (userMail == null) return;
            removeUserToParkAt(userMail);
        }


        //rise event attendance modified
        clManager.notifyClients(parkId, connRes.rows[0].attendance);
    }catch(err){
        throw err;
    }
}