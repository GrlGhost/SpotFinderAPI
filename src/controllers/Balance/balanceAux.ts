import { QueryResult } from "pg";
import { connect } from "../../database";
import { ErrorRest, NotFoundError } from "../../error";
import { HttpStatus } from "../../httpStatus";

export async function sendMoney(senderMail: string, recipientMail: string, balance: number){
    const client = connect();
      
    try {
        await client.query('BEGIN');
        
        // Check if sender has sufficient balance
        const senderBalanceQuery = 'SELECT balance_c FROM balance WHERE mail = $1';
        const senderBalanceResult: QueryResult = await client.query(senderBalanceQuery, [senderMail]);
      
        if (senderBalanceResult.rowCount === 0) throw new NotFoundError(true, 'senderMail');
        
        const senderBalance = senderBalanceResult.rows[0].balance;
      
        if (senderBalance < balance){
            const status: number = HttpStatus['BadRequest'];
            const message: string = 'Not balid balance to add';
            throw new ErrorRest({status, message});
        }
        
        // Subtract the amount from the sender's balance
        await client.query('UPDATE balance SET balance_c = balance_c - $1 WHERE mail = $2', [balance, senderMail]);
      
        console.log("reached hear");
        
        // Add the amount to the recipient's balance
        const updateRecipientBalanceQuery = 'INSERT INTO balance (mail, balance_c) VALUES ($1, $2) ' +
        'ON CONFLICT (mail) DO UPDATE SET balance_c = balance.balance_c + $2';
        await client.query(updateRecipientBalanceQuery, [recipientMail, balance]);
    
    

        console.log("reached hear 2");
        
      
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}