const db = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all offerings
exports.listOfferings = (req, res) => {
  const sql = 'SELECT * FROM offerings ORDER BY date DESC, created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error fetching offerings');
    res.json({ success: true, data: results });
  });
};

// Count offerings
exports.countOfferings = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM offerings';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error counting offerings');
    res.json({ count: results[0].count });
  });
};

// Get total offerings amount
exports.getTotalAmount = (req, res) => {
  const sql = 'SELECT COALESCE(SUM(amount), 0) as total FROM offerings';
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error calculating total offerings');
    res.json({ success: true, total: results[0].total });
  });
};

// Get offerings summary by type
exports.getSummaryByType = (req, res) => {
  const sql = `
    SELECT 
      offering_type,
      COUNT(*) as count,
      SUM(amount) as total
    FROM offerings
    GROUP BY offering_type
    ORDER BY total DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error fetching offerings summary');
    res.json({ success: true, data: results });
  });
};

// Get offerings by date range
exports.getByDateRange = (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Start date and end date are required' });
  }
  
  const sql = 'SELECT * FROM offerings WHERE date BETWEEN ? AND ? ORDER BY date DESC';
  db.query(sql, [startDate, endDate], (err, results) => {
    if (err) return handleError(res, err, 'Error fetching offerings by date range');
    res.json({ success: true, data: results });
  });
};

// Create new offering
exports.createOffering = (req, res) => {
  const { member_name, email, amount, offering_type, payment_method, reference_number, date, notes, is_anonymous } = req.body;
  
  if (!member_name || !amount || !date) {
    return res.status(400).json({ success: false, message: 'Member name, amount, and date are required' });
  }

  const sql = `
    INSERT INTO offerings (member_name, email, amount, offering_type, payment_method, reference_number, date, notes, is_anonymous) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [
    member_name,
    email || null,
    amount,
    offering_type || 'offering',
    payment_method || 'cash',
    reference_number || null,
    date,
    notes || null,
    is_anonymous || false
  ], (err, result) => {
    if (err) return handleError(res, err, 'Error creating offering');
    res.status(201).json({ success: true, message: 'Offering recorded successfully', id: result.insertId });
  });
};

// Get single offering
exports.getOffering = (req, res) => {
  const sql = 'SELECT * FROM offerings WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return handleError(res, err, 'Error fetching offering');
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Offering not found' });
    }
    res.json({ success: true, data: results[0] });
  });
};

// Update offering
exports.updateOffering = (req, res) => {
  const { member_name, email, amount, offering_type, payment_method, reference_number, date, notes, is_anonymous } = req.body;
  
  if (!member_name || !amount || !date) {
    return res.status(400).json({ success: false, message: 'Member name, amount, and date are required' });
  }
  
  const sql = `
    UPDATE offerings 
    SET member_name = ?, email = ?, amount = ?, offering_type = ?, payment_method = ?, 
        reference_number = ?, date = ?, notes = ?, is_anonymous = ?
    WHERE id = ?
  `;
  
  db.query(sql, [
    member_name,
    email || null,
    amount,
    offering_type || 'offering',
    payment_method || 'cash',
    reference_number || null,
    date,
    notes || null,
    is_anonymous || false,
    req.params.id
  ], (err, result) => {
    if (err) return handleError(res, err, 'Error updating offering');
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Offering not found' });
    }
    res.json({ success: true, message: 'Offering updated successfully' });
  });
};

// Delete offering
exports.deleteOffering = (req, res) => {
  const sql = 'DELETE FROM offerings WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return handleError(res, err, 'Error deleting offering');
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Offering not found' });
    }
    res.json({ success: true, message: 'Offering deleted successfully' });
  });
};

// Get monthly summary
exports.getMonthlySummary = (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(date, '%Y-%m') as month,
      COUNT(*) as count,
      SUM(amount) as total
    FROM offerings
    GROUP BY DATE_FORMAT(date, '%Y-%m')
    ORDER BY month DESC
    LIMIT 12
  `;
  db.query(sql, (err, results) => {
    if (err) return handleError(res, err, 'Error fetching monthly summary');
    res.json({ success: true, data: results });
  });
};
