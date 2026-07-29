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
    CREATE TABLE IF NOT EXISTS monthly_expenses (
      id serial PRIMARY KEY NOT NULL,
      category varchar(100) NOT NULL,
      label varchar(255) NOT NULL,
      amount numeric(12, 2) DEFAULT '0' NOT NULL,
      month integer NOT NULL,
      year integer NOT NULL,
      created_at timestamp DEFAULT now()
    );
  `);
  console.log("Table 'monthly_expenses' created successfully (or already existed).");

  await client.end();
  console.log("Migration completed and connection closed.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});