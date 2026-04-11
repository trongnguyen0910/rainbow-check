const { sendError } = require('../utils/response');

/**
 * Role-based access control middleware factory.
 * Usage: authorize('admin', 'hr')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 401, 'Unauthenticated.');
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `Access denied. Required roles: ${roles.join(', ')}.`);
    }
    next();
  };
};

module.exports = { authorize };
