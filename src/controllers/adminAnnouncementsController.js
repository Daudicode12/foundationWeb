const db = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all announcements
exports.listAnnouncements = (req, res) => {
  const sql = 'SELECT * FROM announcements ORDER BY date DESC, created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error fetching announcements');
    res.json({ success: true, data: results });
  });
};

// Count announcements
exports.countAnnouncements = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM announcements';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error counting announcements');
    res.json({ count: results[0].count });
  });
};

// Create new announcement
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

// Get single announcement
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

// Update announcement
exports.updateAnnouncement = (req, res) => {
  const { title, content, priority, author, date } = req.body;
  
  if (!title || !content || !author || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const sql = `
    UPDATE announcements 
    SET title = ?, content = ?, priority = ?, author = ?, date = ?
    WHERE id = ?
  `;
  
  db.query(sql, [title, content, priority || 'general', author, date, req.params.id], (err, result) => {
    if (err) return handleError(res, err, 'Error updating announcement');
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement updated successfully' });
  });
};

// Delete announcement
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
