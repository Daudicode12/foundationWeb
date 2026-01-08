const db = require('../db');

// Get all announcements (public)
const getAllAnnouncements = (req, res) => {
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
};

module.exports = {
  getAllAnnouncements
};
