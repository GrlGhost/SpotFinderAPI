import { QueryResult } from "pg";
import { connect } from "../../database";
import { ErrorRest, NotFoundError } from "../../error";
import { HttpStatus } from "../../httpStatus";

export async function sendMoney(senderMail: string, recipientMail: string, balance: number){
    const client = connect();
      
    try {
        await client.query('BEGIN');
        
        // Check if sender has sufficient balance
        const senderBalanceQuery = 'SELECT balance FROM balance WHERE mail = $1';
        const senderBalanceResult: QueryResult = await client.query(senderBalanceQuery, [senderMail]);
      
        if (senderBalanceResult.rowCount === 0) throw new NotFoundError(true, 'senderMail');
        
        const senderBalance = senderBalanceResult.rows[0].balance;
      
        if (senderBalance < balance){
            const status: number = HttpStatus['BadRequest'];
            const message: string = 'Not balid balance to add';
            throw new ErrorRest({status, message});
        }
        
        // Subtract the amount from the sender's balance
        await client.query('UPDATE balance SET balance = balance - $1 WHERE mail = $2', [balance, senderMail]);
      
        // Add the amount to the recipient's balance
        const updateRecipientBalanceQuery = 'INSERT INTO balance (mail, balance) VALUES ($1, $2) ' +
        'ON CONFLICT (mail) DO UPDATE SET balance = balance + $2';
        await client.query(updateRecipientBalanceQuery, [recipientMail, balance]);
      
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}