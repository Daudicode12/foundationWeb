const db = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// Create a new offering (member submission)
exports.createOffering = (req, res) => {
  const { member_name, email, phone, amount, offering_type, payment_method, reference_number, date, notes, is_anonymous } = req.body;

  // Validation
  if (!member_name || !amount || !offering_type || !date) {
    return res.status(400).json({ 
      success: false, 
      message: 'Member name, amount, offering type, and date are required' 
    });
  }

  if (!email && !phone) {
    return res.status(400).json({ 
      success: false, 
      message: 'Either email or phone number is required' 
    });
  }

  const sql = `
    INSERT INTO offerings (member_name, email, phone, amount, offering_type, payment_method, reference_number, date, notes, is_anonymous)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    member_name,
    email || null,
    phone || null,
    amount,
    offering_type,
    payment_method || 'cash',
    reference_number || null,
    date,
    notes || null,
    is_anonymous || false
  ];

  db.query(sql, values, (err, result) => {
    if (err) return handleError(res, err, 'Error creating offering');
    res.status(201).json({ 
      success: true, 
      message: 'Offering recorded successfully',
      offeringId: result.insertId 
    });
  });
};

// Get user's offerings by email
exports.getMyOfferings = (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const sql = `
    SELECT * FROM offerings 
    WHERE email = ? AND is_anonymous = FALSE
    ORDER BY date DESC, created_at DESC
  `;
  
  db.query(sql, [email], (err, results) => {
    if (err) return handleError(res, err, 'Error fetching your offerings');
    res.json({ success: true, data: results });
  });
};

// Get user's offerings by phone
exports.getMyOfferingsByPhone = (req, res) => {
  const { phone } = req.query;
  
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  const sql = `
    SELECT * FROM offerings 
    WHERE phone = ? AND is_anonymous = FALSE
    ORDER BY date DESC, created_at DESC
  `;
  
  db.query(sql, [phone], (err, results) => {
    if (err) return handleError(res, err, 'Error fetching your offerings');
    res.json({ success: true, data: results });
  });
};

// Get user's total offerings
exports.getMyOfferingsTotal = (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const sql = `
    SELECT 
      SUM(amount) as total,
      COUNT(*) as count
    FROM offerings 
    WHERE email = ? AND is_anonymous = FALSE
  `;
  
  db.query(sql, [email], (err, results) => {
    if (err) return handleError(res, err, 'Error calculating your total offerings');
    res.json({ 
      success: true, 
      total: results[0].total || 0,
      count: results[0].count || 0
    });
  });
};

// Get user's offerings summary by type
exports.getMyOfferingsSummary = (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const sql = `
    SELECT 
      offering_type,
      SUM(amount) as total,
      COUNT(*) as count
    FROM offerings 
    WHERE email = ? AND is_anonymous = FALSE
    GROUP BY offering_type
    ORDER BY total DESC
  `;
  
  db.query(sql, [email], (err, results) => {
    if (err) return handleError(res, err, 'Error fetching your offerings summary');
    res.json({ success: true, data: results });
  });
};
