const { Client } = require("pg");
require("dotenv").config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to database successfully.");

  await client.query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS time_slot varchar(20) DEFAULT 'Night';
  `);
  console.log("Column 'time_slot' added successfully.");

  await client.query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS bank_name varchar(50);
  `);
  console.log("Column 'bank_name' added successfully.");

  await client.end();
  console.log("Migration completed and connection closed.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});