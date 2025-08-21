const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 21003,

  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
   ssl: {
     ca: fs.readFileSync(path.join(__dirname, 'certs/ca.pem')),
    rejectUnauthorized: false // or false for testing, but true is safer
  }
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    throw err;
  }
  console.log('✅ MySQL connected');
});

module.exports = db;
