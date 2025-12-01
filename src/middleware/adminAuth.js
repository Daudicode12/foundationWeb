// Simple admin authentication middleware
// Checks if user is logged in and has admin role

const db = require('../db');

module.exports = function adminAuth(req, res, next) {
  // Get email from request body or query (simple auth for now)
  // In production, use JWT tokens or sessions
  const adminEmail = req.body?.adminEmail || req.query?.adminEmail;
  
  if (!adminEmail) {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin authentication required' 
    });
  }

  // Verify user is admin
  const sql = 'SELECT role FROM users WHERE email = ?';
  db.query(sql, [adminEmail], (err, results) => {
    if (err) {
      console.error('Error checking admin status:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    }

    if (results.length === 0 || results[0].role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // User is admin, proceed
    req.adminEmail = adminEmail;
    next();
  });
};

// Note: For production, implement JWT-based authentication:
// 
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

module.exports = function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
