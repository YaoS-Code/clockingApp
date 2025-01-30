require('dotenv').config();
const mysql = require('mysql2');

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

console.log('Attempting to connect with config:', {
  ...config,
  password: '****' // Don't log the actual password
});

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Successfully connected to database');
  
  // Test query
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
    } else {
      console.log('Tables in database:', results);
    }
    connection.end();
  });
});