const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const schema = require("../model/schema");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Force SSL if your cloud provider requires it, or fall back to checking NODE_ENV
    // ssl: {
    //     rejectUnauthorized: false
    // }
});

const db = drizzle(pool, { schema });

async function testDb() {
    try {
        const client = await pool.connect();
        await client.query("select 1");
        console.log("Db is connected successfully!");
        client.release();
    } catch (error) {
        console.error("connection failed ... ", error.message);
    }
}

testDb();

module.exports = { db };