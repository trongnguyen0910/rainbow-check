const jwt = require('jsonwebtoken');
const db = require('../data/mockData');
const { sendError } = require('../utils/response');

/**
 * JWT authentication middleware.
 * Verifies the Bearer token and attaches `req.user` with the user record.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return sendError(res, 401, 'Invalid token. User not found.');
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid token.');
  }
};

module.exports = { authenticate };
