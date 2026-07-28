const { Client } = require("pg");
require("dotenv").config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS advance_amount numeric(12,2) NOT NULL DEFAULT '0';`);
  console.log("Column added successfully.");
  await client.end();
}

run().catch(console.error);