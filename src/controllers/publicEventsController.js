const db = require('../db');

// Get all events
const getAllEvents = (req, res) => {
  const sql = `SELECT * FROM events ORDER BY date DESC, time DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, events: results });
  });
};

// Get upcoming events
const getUpcomingEvents = (req, res) => {
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
};

// Get past events
const getPastEvents = (req, res) => {
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
    res.json({ success: true, events: results });
  });
};

// Get single event
const getEventById = (req, res) => {
  const { id } = req.params;

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
};

// RSVP for event
const rsvpEvent = (req, res) => {
  const { eventId, email, userName } = req.body;

  if (!eventId || !email) {
    return res.status(400).json({ success: false, message: "Event ID and email are required" });
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
};

// Cancel RSVP
const cancelRsvp = (req, res) => {
  const { eventId, email } = req.body;

  if (!eventId || !email) {
    return res.status(400).json({ success: false, message: "Event ID and email are required" });
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
};

module.exports = {
  getAllEvents,
  getUpcomingEvents,
  getPastEvents,
  getEventById,
  rsvpEvent,
  cancelRsvp
};
