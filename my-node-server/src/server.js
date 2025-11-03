const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");


const app = express();
const port = 8000;
const path = require("path");

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Explicit route for login page (for debugging)
app.post('/logins/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/logins/login.html'));
});

// connect to mySQL database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "41674473", //my sql password
  database: "usersdb", //my datatbase naame
});

// db connection error
let dbConnected = false;

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    console.log("Server will start without database. Fix credentials and restart.");
    dbConnected = false;
  } else {
    console.log("Connected to the MySQL database.");
    dbConnected = true;
  }
});

// Create signup route

app.post("/api/signup", (req, res) => {
  const { userName, email, phone, password } = req.body;

  if (!userName || !email || !phone || !password) {
    return res.status(400).send("All fields are required");
  }

  if (!dbConnected) {
    return res.status(503).send("Database not connected. Please check server logs.");
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).send("Server error");
    }

    // Insert user into database
    const sql =
      "INSERT INTO users (userName, email, phone, password) VALUES(?,?,?,?)";
    db.query(sql, [userName, email, phone, hash], (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ success: false, message: "Database error: " + err.message });
      }
      res.status(201).json({
        success: true,
        message: "User registered successfully!",
        redirect: "/logins/login.html"
      });
    });

});
});

// Create login route

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).send("Server error");
    }
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).send("Server error");
      } 
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      res.json({ success: true, message: "Login successful", redirect: "/dashboard" });
    });
  });
});

// start server 
app.listen(port, ()=>{
    console.log(`Server Running on Port Http://${port}`);
    
});
