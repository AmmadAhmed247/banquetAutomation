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
    CREATE TABLE IF NOT EXISTS daily_expenses (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      label TEXT NOT NULL,
      category TEXT NOT NULL,
      amount NUMERIC NOT NULL
    );
  `);
  console.log("Table 'daily_expenses' created successfully with columns: id, date, label, category, amount.");

  await client.end();
  console.log("Migration completed and connection closed.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});