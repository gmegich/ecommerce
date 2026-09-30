const { AppError } = require('./errorMiddleware');

/**
 * Restrict a route to one or more roles.
 * Usage: authorize('admin') or authorize('seller', 'admin')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authorized. Please log in.', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(`Access denied for role "${req.user.role}".`, 403)
    );
  }

  return next();
};

module.exports = {
  authorize,
};
