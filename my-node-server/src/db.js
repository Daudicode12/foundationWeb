const mysql = require("mysql2");

// Create MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "Daudi",
  password: "Daudi123!",
  database: "usersdb",
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
