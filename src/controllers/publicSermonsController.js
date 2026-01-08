const db = require('../db');

// Get all sermons
const getAllSermons = (req, res) => {
  const sql = `
    SELECT * FROM sermons 
    ORDER BY date DESC, time DESC
    LIMIT 50
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching sermons:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, data: results });
  });
};

// Get upcoming sermons
const getUpcomingSermons = (req, res) => {
  const sql = `
    SELECT * FROM sermons 
    WHERE date >= CURDATE() 
    ORDER BY date ASC, time ASC
    LIMIT 10
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching upcoming sermons:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, data: results });
  });
};

// Get single sermon
const getSermonById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM sermons WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching sermon:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Sermon not found" });
    }

    res.json({ success: true, data: results[0] });
  });
};

// Get sermons by day type
const getSermonsByDayType = (req, res) => {
  const { dayType } = req.params;

  const sql = `
    SELECT * FROM sermons 
    WHERE day_type = ?
    ORDER BY date DESC, time DESC
    LIMIT 20
  `;

  db.query(sql, [dayType], (err, results) => {
    if (err) {
      console.error("Error fetching sermons by day type:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, data: results });
  });
};

module.exports = {
  getAllSermons,
  getUpcomingSermons,
  getSermonById,
  getSermonsByDayType
};
