// Super Admin authentication middleware
// Checks if user has a valid JWT token and has super_admin role

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

module.exports = function superAdminAuth(req, res, next) {
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
      message: 'Authentication required' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user has super_admin role
    if (decoded.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Super Admin access required' 
      });
    }

    // User is authenticated super admin, proceed
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
