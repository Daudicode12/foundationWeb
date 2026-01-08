// Admin authentication middleware
// Checks if user has a valid JWT token and has admin role

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

module.exports = function adminAuth(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin authentication required' 
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
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
// const jwt = require('jsonwebtoken');
// const secret = process.env.JWT_SECRET;
// 
// module.exports = function adminAuth(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).json({ success: false, message: 'No token provided' });
//   }
// 
//   const token = authHeader.split(' ')[1]; // Bearer <token>
//   try {
//     const decoded = jwt.verify(token, secret);
//     if (decoded.role !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Admin access required' });
//     }
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: 'Invalid token' });
//   }
// };
