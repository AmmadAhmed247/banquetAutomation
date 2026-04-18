import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;

dotenv.config();
const app = express();

const pool = new Pool({
    user: 'postgres', // ✅ FIXED
    host: 'localhost',
    database: 'postgres',
    password: '2026istheyear',
    port: 5432
});

app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.send('DB Connected ✅');
  } catch (err) {
    console.error(err);
    res.send('DB NOT Connected ❌');
  }
});

app.listen(3000, () => {
    console.log('server is running....');
});