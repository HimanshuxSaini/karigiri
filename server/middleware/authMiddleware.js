const admin = require('firebase-admin');
const { isAdminEmail } = require('../config/constants');

const protectAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Lazy load User model to avoid circular dependency if any
    const User = require('../models/User');
    const user = await User.findOne({ email: decodedToken.email });

    const isHardcodedAdmin = isAdminEmail(decodedToken.email);
    const isDbAdmin = user && user.role === 'admin';

    // Check if user is admin (DB or fallback)
    if (!isDbAdmin && !isHardcodedAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    // Inject permissions into request. Hardcoded admins act as superadmins.
    req.user = {
      ...decodedToken,
      dbUser: user,
      permissions: isHardcodedAdmin ? ['superadmin'] : (user?.permissions || [])
    };
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ 
      message: 'Not authorized, token failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Middleware Error (protect):', error.message);
    res.status(401).json({ 
      message: 'Not authorized, token failed', 
      error: error.message
    });
  }
};

const protectSuperAdmin = async (req, res, next) => {
  // First run protectAdmin to inject dbUser and permissions
  protectAdmin(req, res, () => {
    if (req.user && req.user.permissions && req.user.permissions.includes('superadmin')) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }
  });
};

module.exports = { protect, protectAdmin, protectSuperAdmin };
