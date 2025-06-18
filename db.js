// db.js
import postgres from 'postgres'

const sql = postgres({ 
    host: process.env.HOST || 'pg-1307fe90-farhanalik771-7d78.e.aivencloud.com',
    port: process.env.PORT || 10393,
    database: process.env.DATABASE || 'defaultdb',
    username: process.env.USER_NAME || 'avnadmin',
    password: process.env.PSWD || '',
    ssl: { rejectUnauthorized: false },
    max: 10, // maximum number of connections in the pool
}) // will use psql environment variables

export default sql