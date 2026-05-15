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
    
    // Check if user is admin using centralized config
    if (!isAdminEmail(decodedToken.email)) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    req.user = decodedToken;
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

module.exports = { protectAdmin };

