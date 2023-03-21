import { createPool } from "mysql2/promise"

export function connect() {
    const connection = createPool({
        host: 'root@127.0.0.1:3306',
        user: 'root',
        password: 'Ghost1645',
        database: 'spotfinderdb',
        connectionLimit: 10
    });
    return connection;
}