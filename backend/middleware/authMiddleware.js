const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Require a valid Bearer JWT and attach req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Not authorized. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-only-insecure-secret');
  } catch (err) {
    throw new AppError('Invalid or expired token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('User no longer exists.', 401);
  }

  if (user.account_status === 'suspended' || user.account_status === 'inactive') {
    throw new AppError('Your account is not active. Contact support.', 403);
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
