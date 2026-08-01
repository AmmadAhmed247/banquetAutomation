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
    ADD COLUMN IF NOT EXISTS r_no varchar(50) UNIQUE;
  `);
  console.log("Column 'r_no' added successfully (unique constraint applied).");

  await client.end();
  console.log("Migration completed and connection closed.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});