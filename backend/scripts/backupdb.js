
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { drizzle } = require('drizzle-orm/node-postgres');
const { sql } = require('drizzle-orm');
const nodemailer = require('nodemailer');
const {db} = require("../config/db")

async function getAllTableNames() {
  const result = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  return result.rows.map((r) => r.table_name);
}

async function dumpDatabaseToJSON() {
  const tableNames = await getAllTableNames();

  const backup = {
    createdAt: new Date().toISOString(),
    database: process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).pathname.replace('/', '')
      : 'unknown',
    tables: {},
  };

  for (const tableName of tableNames) {
    const rows = await db.execute(
      sql`SELECT * FROM ${sql.identifier(tableName)};`
    );
    backup.tables[tableName] = rows.rows;
    console.log(`  ✓ dumped "${tableName}" (${rows.rows.length} rows)`);
  }

  return backup;
}



function writeBackupFile(backupObject) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `db-backup-${timestamp}.json`;
  const filePath = path.join(__dirname, fileName);

  fs.writeFileSync(filePath, JSON.stringify(backupObject, null, 2), 'utf8');

  return filePath;
}


async function emailBackup(filePath) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    cc: process.env.MAIL_CC,
    subject: `Database backup — ${new Date().toLocaleString()}`,
    text: 'Attached is the latest JSON database backup.',
    attachments: [
      {
        filename: path.basename(filePath),
        path: filePath,
        contentType: 'application/json',
      },
    ],
  });

  return info;
}

async function main() {
  try {
    console.log('Starting database backup...');
    const backup = await dumpDatabaseToJSON();

    console.log('Writing JSON file...');
    const filePath = writeBackupFile(backup);
    console.log(`  ✓ saved to ${filePath}`);

    console.log('Emailing backup...');
    const info = await emailBackup(filePath);
    console.log(`  ✓ email sent: ${info.messageId}`);

    // delete the local file after sending, so backups don't
    // pile up on disk. Comment this out if you want to keep local copies too.
    fs.unlinkSync(filePath);

    console.log('Backup complete.');
  } catch (err) {
    console.error('Backup failed:', err);
    process.exitCode = 1;
  } 
}

main();