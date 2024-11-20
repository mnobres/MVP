// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Cria uma conexão com o banco de dados MySQL usando Promises
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Conectado ao banco de dados MySQL');
module.exports = connection;

