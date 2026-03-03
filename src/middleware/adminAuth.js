// Admin authentication middleware
// Checks if user has a valid JWT token and has admin role

const jwt = require('jsonwebtoken');
const supabase = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

module.exports = async function adminAuth(req, res, next) {
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
    
    // Check if user has admin or super_admin role
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // For regular admins, verify they are still approved in the database
    if (decoded.role === 'admin') {
      const { data: user, error } = await supabase
        .from('users')
        .select('is_approved')
        .eq('id', decoded.id)
        .single();

      if (error || !user || !user.is_approved) {
        return res.status(403).json({ 
          success: false, 
          message: 'Your admin account is not approved. Contact the Super Admin.' 
        });
      }
    }

    // User is authenticated admin or super_admin, proceed
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
