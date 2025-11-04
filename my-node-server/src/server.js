const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

// Import database connection
const db = require("./db");

// Import admin routes
const adminRouter = require("./routes/admin");

const app = express();
const port = 8000;

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Explicit routes for pages
app.get('/logins/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/logins/login.html'));
});

app.get('/dashboard/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/dashboard.html'));
});

// Database connection check
let dbConnected = true; // db.js handles connection

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

      res.status(200).json({ 
        success: true, 
        message: "Login successful", 
        redirect: "/dashboard/dashboard.html",
        userName: user.userName,
        email: user.email,
        phone: user.phone
      });
    });
  });
});

// Get user profile
app.get("/api/profile", (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching profile:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = results[0];
    // Don't send password to client
    delete user.password;
    
    res.json({ success: true, profile: user });
  });
});

// Update user profile
app.put("/api/profile", (req, res) => {
  const { 
    email, userName, phone, dateOfBirth, gender, maritalStatus,
    address, city, state, zipCode, country, memberSince, ministry, notes
  } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const sql = `
    UPDATE users SET 
      userName = ?,
      phone = ?,
      dateOfBirth = ?,
      gender = ?,
      maritalStatus = ?,
      address = ?,
      city = ?,
      state = ?,
      zipCode = ?,
      country = ?,
      memberSince = ?,
      ministry = ?,
      notes = ?
    WHERE email = ?
  `;

  db.query(sql, [
    userName, phone, dateOfBirth, gender, maritalStatus,
    address, city, state, zipCode, country, memberSince, ministry, notes,
    email
  ], (err, result) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ success: false, message: "Database error: " + err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated successfully" });
  });
});

// Events API Routes

// Get upcoming events
app.get("/api/events/upcoming", (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  const sql = `
    SELECT * FROM events 
    WHERE date >= CURDATE() 
    ORDER BY date ASC, time ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json(results);
  });
});

// Get past events
app.get("/api/events/past", (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  const sql = `
    SELECT * FROM events 
    WHERE date < CURDATE() 
    ORDER BY date DESC, time DESC
    LIMIT 20
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching past events:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json(results);
  });
});

// Get single event details
app.get("/api/events/:id", (req, res) => {
  const { id } = req.params;

  if (!dbConnected) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  const sql = "SELECT * FROM events WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching event:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json(results[0]);
  });
});

// RSVP for event
app.post("/api/events/rsvp", (req, res) => {
  const { eventId, email, userName } = req.body;

  if (!eventId || !email) {
    return res.status(400).json({ success: false, message: "Event ID and email are required" });
  }

  if (!dbConnected) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  // Check if already registered
  const checkSql = "SELECT * FROM event_rsvps WHERE eventId = ? AND email = ?";
  db.query(checkSql, [eventId, email], (err, results) => {
    if (err) {
      console.error("Error checking RSVP:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "Already registered for this event" });
    }

    // Insert RSVP
    const insertSql = "INSERT INTO event_rsvps (eventId, email, userName, rsvp_date) VALUES (?, ?, ?, NOW())";
    db.query(insertSql, [eventId, email, userName], (err, result) => {
      if (err) {
        console.error("Error creating RSVP:", err);
        return res.status(500).json({ success: false, message: "Server error" });
      }

      // Update attendee count
      const updateSql = "UPDATE events SET attendees = attendees + 1 WHERE id = ?";
      db.query(updateSql, [eventId], (err) => {
        if (err) {
          console.error("Error updating attendee count:", err);
        }
      });

      res.json({ success: true, message: "RSVP successful" });
    });
  });
});

// Cancel RSVP
app.delete("/api/events/rsvp", (req, res) => {
  const { eventId, email } = req.body;

  if (!eventId || !email) {
    return res.status(400).json({ success: false, message: "Event ID and email are required" });
  }

  if (!dbConnected) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  const deleteSql = "DELETE FROM event_rsvps WHERE eventId = ? AND email = ?";
  db.query(deleteSql, [eventId, email], (err, result) => {
    if (err) {
      console.error("Error cancelling RSVP:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "RSVP not found" });
    }

    // Update attendee count
    const updateSql = "UPDATE events SET attendees = GREATEST(attendees - 1, 0) WHERE id = ?";
    db.query(updateSql, [eventId], (err) => {
      if (err) {
        console.error("Error updating attendee count:", err);
      }
    });

    res.json({ success: true, message: "RSVP cancelled" });
  });
});

// Announcements API Routes

// Get all announcements
app.get("/api/announcements", (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  const sql = `
    SELECT * FROM announcements 
    ORDER BY date DESC, created_at DESC
    LIMIT 50
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching announcements:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json(results);
  });
});

// Mount admin routes - all admin endpoints now handled by admin router
app.use("/api/admin", adminRouter);

// Admin login route (not protected, allows admin authentication)
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND role = 'admin'";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching admin:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const admin = results[0];
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ success: false, message: "Server error" });
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid admin credentials" });
      }

      res.json({
        success: true,
        message: "Admin login successful",
        email: admin.email,
        userName: admin.userName,
        role: admin.role
      });
    });
  });
});

// start server 
app.listen(port, ()=>{
    console.log(`Server Running on Port Http://localhost:${port}`);
    
});
