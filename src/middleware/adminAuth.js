// Admin authentication middleware
// Checks if user has a valid JWT token and has admin role

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

module.exports = function adminAuth(req, res, next) {
  // First try to get token from httpOnly cookie, then fallback to Authorization header
  let token = req.cookies?.adminToken;
  
  // Fallback to Authorization header for backwards compatibility
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin authentication required' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // User is authenticated admin, proceed
    req.adminEmail = decoded.email;
    req.adminId = decoded.id;
    req.adminRole = decoded.role;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};
