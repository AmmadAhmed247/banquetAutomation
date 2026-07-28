const { Client } = require("pg");
require("dotenv").config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reminder_sent boolean DEFAULT false;`);
  console.log("Column 'booking_reminder_sent' added successfully.");

  await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS resource_reminder_sent boolean DEFAULT false;`);
  console.log("Column 'resource_reminder_sent' added successfully.");

  await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_advance_reminder_at timestamp;`);
  console.log("Column 'last_advance_reminder_at' added successfully.");

  await client.end();
}

run().catch(console.error);