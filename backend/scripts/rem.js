import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function runPaymentsTableMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to database successfully.");

    // 1. Create the payments table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        flow VARCHAR(10) NOT NULL DEFAULT 'IN',
        amount NUMERIC(12, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash',
        bank_name VARCHAR(50),
        who VARCHAR(150),
        note VARCHAR(255),
        booking_id INTEGER REFERENCES booking(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Verified / Created 'payments' table.");

    // 2. If the table already existed with the old schema, ensure new columns are added safely
    await client.query(`
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS flow VARCHAR(10) NOT NULL DEFAULT 'IN';
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Booking Advance';
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS who VARCHAR(150);
      ALTER TABLE payments ALTER COLUMN booking_id DROP NOT NULL;
    `);
    console.log("Updated 'payments' table columns successfully.");

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

runPaymentsTableMigration();