// this is where the events are going to be managed
 const db = require('../db')
const upcomingEvents = (req,res)=>{
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
    res.json({ success: true, events: results });
  });
}