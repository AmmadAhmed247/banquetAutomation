const { Client } = require("pg");
require("dotenv").config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to database successfully.");

  // ── Step 1: revert expenses table (in case is_addon/client_price/commission were already added) ──
  await client.query(`
    ALTER TABLE expenses
    DROP COLUMN IF EXISTS is_addon;
  `);
  console.log("Column 'is_addon' removed from expenses (if it existed).");

  await client.query(`
    ALTER TABLE expenses
    DROP COLUMN IF EXISTS client_price;
  `);
  console.log("Column 'client_price' removed from expenses (if it existed).");

  await client.query(`
    ALTER TABLE expenses
    DROP COLUMN IF EXISTS commission;
  `);
  console.log("Column 'commission' removed from expenses (if it existed).");

  // ── Step 2: create the separate addons table ──
  await client.query(`
    CREATE TABLE IF NOT EXISTS addons (
      id serial PRIMARY KEY NOT NULL,
      booking_id integer NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      service varchar(100) NOT NULL,
      client_price numeric(12, 2) DEFAULT '0' NOT NULL,
      vendor_cost numeric(12, 2) DEFAULT '0' NOT NULL,
      commission numeric(12, 2) DEFAULT '0' NOT NULL,
      created_at timestamp DEFAULT now()
    );
  `);
  console.log("Table 'addons' created successfully (or already existed).");

  await client.end();
  console.log("Migration completed and connection closed.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});