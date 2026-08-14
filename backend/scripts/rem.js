const { Client } = require("pg");
require("dotenv").config();

async function runPaymentsMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to database successfully.");

  // Create payments table if missing
  await client.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      amount NUMERIC(12, 2) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'Advance',
      payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash',
      bank_name VARCHAR(50),
      note VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);
  console.log("Table 'payments' created/verified successfully.");

  // Ensure individual columns exist if table was already created
  await client.query(`
    ALTER TABLE payments ADD COLUMN IF NOT EXISTS bank_name VARCHAR(50);
    ALTER TABLE payments ADD COLUMN IF NOT EXISTS note VARCHAR(255);
    ALTER TABLE payments ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Advance';
    ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'Cash';
  `);
  console.log("Columns verified for 'payments'.");

  await client.end();
  console.log("Payments migration completed and connection closed.");
}

runPaymentsMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});