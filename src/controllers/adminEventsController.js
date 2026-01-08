const db = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all events
exports.listEvents = (req, res) => {
  const sql = 'SELECT * FROM events ORDER BY date ASC, time ASC';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error fetching events');
    res.json({ success: true, data: results });
  });
};

// Count events
exports.countEvents = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM events';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error counting events');
    res.json({ count: results[0].count });
  });
};

// Create new event
exports.createEvent = (req, res) => {
  const { title, description, additionalInfo, category, date, time, location, image } = req.body;
  
  if (!title || !description || !category || !date || !time || !location) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO events (title, description, additionalInfo, category, date, time, location, image, attendees) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `;
  
  db.query(sql, [title, description, additionalInfo || null, category, date, time, location, image || null], (err, result) => {
    if (err) return handleError(res, err, 'Error creating event');
    res.status(201).json({ success: true, message: 'Event created successfully', id: result.insertId });
  });
};

// Get single event
exports.getEvent = (req, res) => {
  const sql = 'SELECT * FROM events WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return handleError(res, err, 'Error fetching event');
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: results[0] });
  });
};

// Update event
exports.updateEvent = (req, res) => {
  const { title, description, additionalInfo, category, date, time, location, image } = req.body;
  
  const sql = `
    UPDATE events 
    SET title = ?, description = ?, additionalInfo = ?, category = ?, date = ?, time = ?, location = ?, image = ?
    WHERE id = ?
  `;
  
  db.query(sql, [title, description, additionalInfo, category, date, time, location, image, req.params.id], (err, result) => {
    if (err) return handleError(res, err, 'Error updating event');
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event updated successfully' });
  });
};

// Delete event
exports.deleteEvent = (req, res) => {
  const sql = 'DELETE FROM events WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return handleError(res, err, 'Error deleting event');
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  });
};
