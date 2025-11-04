const db = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// ============= EVENTS CONTROLLERS =============

exports.listEvents = (req, res) => {
  const sql = 'SELECT * FROM events ORDER BY date ASC, time ASC';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error fetching events');
    res.json({ success: true, data: results });
  });
};

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

// ============= ANNOUNCEMENTS CONTROLLERS =============

exports.listAnnouncements = (req, res) => {
  const sql = 'SELECT * FROM announcements ORDER BY date DESC, created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error fetching announcements');
    res.json({ success: true, data: results });
  });
};

exports.createAnnouncement = (req, res) => {
  const { title, content, priority, author, date } = req.body;
  
  if (!title || !content || !author || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO announcements (title, content, priority, author, date) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [title, content, priority || 'general', author, date], (err, result) => {
    if (err) return handleError(res, err, 'Error creating announcement');
    res.status(201).json({ success: true, message: 'Announcement created successfully', id: result.insertId });
  });
};

exports.getAnnouncement = (req, res) => {
  const sql = 'SELECT * FROM announcements WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return handleError(res, err, 'Error fetching announcement');
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, data: results[0] });
  });
};

exports.updateAnnouncement = (req, res) => {
  const { title, content, priority, author, date } = req.body;
  
  const sql = `
    UPDATE announcements 
    SET title = ?, content = ?, priority = ?, author = ?, date = ?
    WHERE id = ?
  `;
  
  db.query(sql, [title, content, priority, author, date, req.params.id], (err, result) => {
    if (err) return handleError(res, err, 'Error updating announcement');
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement updated successfully' });
  });
};

exports.deleteAnnouncement = (req, res) => {
  const sql = 'DELETE FROM announcements WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return handleError(res, err, 'Error deleting announcement');
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted successfully' });
  });
};

// ============= DASHBOARD STATS =============

exports.getDashboardStats = (req, res) => {
  const queries = {
    totalEvents: 'SELECT COUNT(*) as count FROM events',
    upcomingEvents: 'SELECT COUNT(*) as count FROM events WHERE date >= CURDATE()',
    totalAnnouncements: 'SELECT COUNT(*) as count FROM announcements',
    totalRSVPs: 'SELECT COUNT(*) as count FROM event_rsvps'
  };

  let stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    db.query(sql, (err, results) => {
      if (!err && results.length > 0) {
        stats[key] = results[0].count;
      } else {
        stats[key] = 0;
      }
      completed++;
      
      if (completed === total) {
        res.json({ success: true, stats });
      }
    });
  });
};

// ============= RSVPs CONTROLLERS =============

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

exports.listMembers = (req, res) => {
  const sql = `
    SELECT 
      id, 
      userName as name, 
      email, 
      phone, 
      created_at,
      role
    FROM users 
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error fetching members');
    res.json({ success: true, data: results });
  });
};
