const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

async function clearAndImport() {
  const client = await pool.connect();
  
  try {
    // Start a transaction so deletion and insertion happen safely together
    await client.query('BEGIN');

    console.log('🗑️ Clearing existing data from table...');
    // TRUNCATE empties the table. RESTART IDENTITY resets auto-increment IDs (if applicable).
    // CASCADE is added in case other tables have foreign keys pointing to this table.
    await client.query('TRUNCATE TABLE your_table_name RESTART IDENTITY CASCADE;');

    // 1. Read and parse the local JSON file
    const rawData = fs.readFileSync('backup.json', 'utf8');
    const records = JSON.parse(rawData);

    if (!Array.isArray(records)) {
      throw new Error('JSON backup file must contain an array of objects.');
    }

    console.log(`📥 Found ${records.length} records. Importing...`);

    // 2. Loop through and insert records
    for (const record of records) {
      const query = `
        INSERT INTO your_table_name (column1, column2, created_at)
        VALUES ($1, $2, $3)
      `;
      
      const values = [record.field1, record.field2, record.date || new Date()];

      await client.query(query, values);
    }

    // Commit the transaction if everything succeeded
    await client.query('COMMIT');
    console.log('✅ Existing data wiped and new backup successfully imported!');
  } catch (error) {
    // If anything fails, rollback everything so you don't end up with an empty table
    await client.query('ROLLBACK');
    console.error('❌ Error during clear and import. Rolled back changes:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

clearAndImport();