import { createPool } from "mysql2/promise"

export function connect() {
    const connection = createPool({
        host: 'localhost',
        user: 'root',
        password: 'Ghost1645',
        database: 'spotfinderdb',
        connectionLimit: 10
    });
    return connection;
}