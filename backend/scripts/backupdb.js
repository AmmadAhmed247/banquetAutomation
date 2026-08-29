require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { drizzle } = require('drizzle-orm/node-postgres');
const { sql } = require('drizzle-orm');
const nodemailer = require('nodemailer');
const { db } = require("../config/db")
const cron = require("node-cron")

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
  // Written outside scripts/ so nodemon's watcher doesn't see the file
  // appear and restart the server mid-send.
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `db-backup-${timestamp}.json`;
  const filePath = path.join(backupDir, fileName);

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

async function runDatabaseBackup() {
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
  }
}

function StartDbBackUp() {
  // "0 2 * * *" = daily at 2 AM. Change to "* * * * *" temporarily if
  // you want to test it firing every minute.
  cron.schedule("0 9 * * *", async () => {
    console.log("===Running Database Backup====")
    await runDatabaseBackup();
    console.log("===Database Backup Complete===")
  })

  console.log("Database Cronjob Working!")
}

module.exports = {
  StartDbBackUp,
  runDatabaseBackup,
}