const db = require('../db');

// Get user profile
const getProfile = (req, res) => {
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
    delete user.password;

    res.json({ success: true, profile: user });
  });
};

// Update user profile
const updateProfile = (req, res) => {
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
};

module.exports = {
  getProfile,
  updateProfile
};
