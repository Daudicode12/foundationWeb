const db = require('../db');

// Submit a prayer request (member/public)
const submitPrayerRequest = (req, res) => {
  const { userId, userName, userEmail, title, request, isAnonymous } = req.body;

  if (!userName || !userEmail || !title || !request) {
    return res.status(400).json({ success: false, message: "All required fields must be filled" });
  }

  const sql = 'INSERT INTO prayer_requests (user_id, user_name, user_email, title, request, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [userId || null, userName, userEmail, title, request, isAnonymous || false], (err, result) => {
    if (err) {
      console.error("Error saving prayer request:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to submit your prayer request. Please try again later."
      });
    }

    res.json({
      success: true,
      message: "Your prayer request has been submitted. Our team will be praying for you.",
      prayerRequestId: result.insertId
    });
  });
};

// Get user's prayer requests (member)
const getUserPrayerRequests = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const sql = 'SELECT * FROM prayer_requests WHERE user_email = ? ORDER BY created_at DESC';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user prayer requests:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, prayerRequests: results });
  });
};

// Get all prayer requests (admin)
const listPrayerRequests = (req, res) => {
  const sql = `SELECT * FROM prayer_requests ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching prayer requests:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, prayerRequests: results });
  });
};

// Get single prayer request (admin)
const getPrayerRequest = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM prayer_requests WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching prayer request:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Prayer request not found' });
    }
    res.json({ success: true, prayerRequest: results[0] });
  });
};

// Mark prayer request as read (admin)
const markAsRead = (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE prayer_requests SET is_read = TRUE WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error updating prayer request:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Prayer request not found' });
    }
    res.json({ success: true, message: 'Prayer request marked as read' });
  });
};

// Update prayer request status (admin)
const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'praying', 'answered'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  
  const sql = 'UPDATE prayer_requests SET status = ?, is_read = TRUE WHERE id = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating prayer request status:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Prayer request not found' });
    }
    res.json({ success: true, message: 'Prayer request status updated' });
  });
};

// Delete prayer request (admin)
const deletePrayerRequest = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM prayer_requests WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting prayer request:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Prayer request not found' });
    }
    res.json({ success: true, message: 'Prayer request deleted successfully' });
  });
};

// Count unread prayer requests (admin)
const countUnread = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM prayer_requests WHERE is_read = FALSE';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error counting unread prayer requests:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, count: results[0].count });
  });
};

module.exports = {
  submitPrayerRequest,
  getUserPrayerRequests,
  listPrayerRequests,
  getPrayerRequest,
  markAsRead,
  updateStatus,
  deletePrayerRequest,
  countUnread
};
