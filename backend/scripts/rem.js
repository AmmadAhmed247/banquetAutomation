const { Client } = require("pg");
require("dotenv").config();

async function runAddonsReceivedMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to database successfully.");

  // Add received tracking columns to addons if missing
  await client.query(`
    ALTER TABLE addons ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash';
    ALTER TABLE addons ADD COLUMN IF NOT EXISTS bank_name VARCHAR(50);
  `);
  console.log("Columns 'payment_method' and 'bank_name' verified on 'addons'.");

  await client.end();
  console.log("Addons received migration completed and connection closed.");
}

runAddonsReceivedMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});