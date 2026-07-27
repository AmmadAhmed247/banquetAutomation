const { Client } = require("pg");
require("dotenv").config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }   // ← add this
  });
  await client.connect();
  await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS advance_due_date timestamp;`);
  console.log("Column added successfully.");
  await client.end();
}

run().catch(console.error);