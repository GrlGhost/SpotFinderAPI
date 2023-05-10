import { QueryResult } from "pg";
import { ClientsManager } from "../../clientsManager";
import { connect } from "../../database";

//TODO: manage chk_attendance error
export async function modifieAttendance(parkId: number, increase: boolean, clManager: ClientsManager) {
    let connRes: QueryResult;
    const conn = connect();
    if (increase)
        connRes = await conn.query('UPDATE parkings SET attendance = attendance + 1 WHERE gid = $1 RETURNING attendance',
            [parkId]);
    else
        connRes = await conn.query('UPDATE parkings SET attendance = attendance - 1 WHERE gid = $1 RETURNING attendance',
            [parkId]);

    //rise event attendance modified
    clManager.notifyClients(parkId, connRes.rows[0].attendance);
}