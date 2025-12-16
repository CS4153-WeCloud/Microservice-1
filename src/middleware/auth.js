const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided. Please include a Bearer token in the Authorization header.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database to ensure they still exist and are active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'Token is valid but user no longer exists.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account inactive',
        message: 'Your account is not active. Please contact support.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please authenticate first.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.status === 'active') {
        req.user = user;
        req.token = decoded;
      }
    }
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
}

module.exports = {
  authenticate,
  requireRole,
  optionalAuth
};

