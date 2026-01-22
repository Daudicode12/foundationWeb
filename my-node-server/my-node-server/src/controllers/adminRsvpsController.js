const db = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all RSVPs with event details
exports.listRSVPs = (req, res) => {
  const sql = `
    SELECT 
      er.eventId,
      er.email,
      er.userName,
      er.rsvp_date,
      e.title as eventTitle,
      e.date as eventDate,
      e.time as eventTime
    FROM event_rsvps er
    LEFT JOIN events e ON er.eventId = e.id
    ORDER BY er.rsvp_date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error fetching RSVPs');
    res.json({ success: true, data: results });
  });
};

// Count RSVPs
exports.countRSVPs = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM event_rsvps';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error counting RSVPs');
    res.json({ count: results[0].count });
  });
};

// Get RSVPs for a specific event
exports.getEventRSVPs = (req, res) => {
  const sql = `
    SELECT 
      er.eventId,
      er.email,
      er.userName,
      er.rsvp_date
    FROM event_rsvps er
    WHERE er.eventId = ?
    ORDER BY er.rsvp_date DESC
  `;
  
  db.query(sql, [req.params.eventId], (err, results) => {
    if (err) return handleError(res, err, 'Error fetching event RSVPs');
    res.json({ success: true, data: results });
  });
};
