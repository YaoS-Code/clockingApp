const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Log the configuration (temporarily for debugging)
console.log('Database Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Successfully connected to database');
  connection.release();
});

const promisePool = pool.promise();

module.exports = promisePool;