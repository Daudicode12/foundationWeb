const db = require('../db');

// Submit contact message (public)
const submitContact = (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All required fields must be filled" });
  }

  console.log("Contact form submission:", { name, email, phone, subject, message });

  const sql = 'INSERT INTO contacts(name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, phone || null, subject, message], (err, result) => {
    if (err) {
      console.error("Error saving contact message:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to save your message. Please try again later."
      });
    }

    res.json({
      success: true,
      message: "Thank you for contacting us! We will get back to you soon.",
      contactId: result.insertId
    });
  });
};

// Get all contact messages (admin)
const listContacts = (req, res) => {
  const sql = 'SELECT * FROM contacts ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching contact messages:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, contacts: results });
  });
};

// Get single contact message (admin)
const getContact = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM contacts WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching contact message:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.json({ success: true, contact: results[0] });
  });
};

// Mark contact message as read (admin)
const markAsRead = (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE contacts SET is_read = TRUE WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error updating contact message:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.json({ success: true, message: 'Message marked as read' });
  });
};

// Delete contact message (admin)
const deleteContact = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM contacts WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting contact message:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.json({ success: true, message: 'Contact message deleted successfully' });
  });
};

// Count unread messages (admin)
const countUnread = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM contacts WHERE is_read = FALSE';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error counting unread messages:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, count: results[0].count });
  });
};

module.exports = {
  submitContact,
  listContacts,
  getContact,
  markAsRead,
  deleteContact,
  countUnread
};
