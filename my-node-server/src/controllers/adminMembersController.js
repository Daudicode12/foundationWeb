const db = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all members
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

// Count members
exports.countMembers = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM users';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error counting members');
    res.json({ count: results[0].count });
  });
};

// Get single member
exports.getMember = (req, res) => {
  const sql = `
    SELECT 
      id, 
      userName as name, 
      email, 
      phone, 
      created_at,
      role
    FROM users 
    WHERE id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return handleError(res, err, 'Error fetching member');
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, data: results[0] });
  });
};

// Update member role
exports.updateMemberRole = (req, res) => {
  const { role } = req.body;
  
  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  
  const sql = 'UPDATE users SET role = ? WHERE id = ?';
  db.query(sql, [role, req.params.id], (err, result) => {
    if (err) return handleError(res, err, 'Error updating member role');
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member role updated successfully' });
  });
};

// Delete member
exports.deleteMember = (req, res) => {
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return handleError(res, err, 'Error deleting member');
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member deleted successfully' });
  });
};
