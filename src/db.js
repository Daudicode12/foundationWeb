const mysql = require("mysql2");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    console.log("Database connection failed. Fix credentials and restart.");
  } else {
    console.log("Connected to the MySQL database.");
  }
});

module.exports = db;
