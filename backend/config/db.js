const { drizzle } = require("drizzle-orm/node-postgres")
const { Pool } = require("pg")
const schema = require("../model/schema")
const dotenv = require("dotenv")

dotenv.config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const db = drizzle(pool, { schema })



async function testDb(){
    try {
        const client=await pool.connect();
        await client.query("select 1");
        console.log(`Db is connected ... `);
        client.release();
        
    } catch (error) {
        console.error('connection failed ... ',error.message);
        
    }
}
testDb();


module.exports = { db }