import { Pool } from "pg"

//TODO: might have to pass the port
export function connect() {
    const connection = new Pool({
        host: 'localhost',
        user: 'postgres',
        password: 'Ghost2109Alpha',
        database: 'SpotFinder',
    });
    return connection;
}