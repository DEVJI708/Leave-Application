// =============================================
// middleware/authMiddleware.js
// Authentication & Authorization Middleware (English)
// =============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ---- Middleware 1: Token Verification ----
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User account not found. Please log in again.' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired session token. Please log in again.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required. Please log in.' });
  }
};

// ---- Middleware 2: Role Authorization ----
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied! This resource is restricted to: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { protect, checkRole };
