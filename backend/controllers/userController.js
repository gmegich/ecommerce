const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/users/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved',
    data: { user: req.user },
  });
});

/**
 * PUT /api/users/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'address', 'city', 'county', 'profileImage'];
  const updates = {};

  allowed.forEach((key) => {
    if (req.body[key] !== undefined) {
      const column = key === 'profileImage' ? 'profile_image' : key;
      updates[column] = req.body[key] || null;
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid profile fields provided', 400);
  }

  const user = await User.updateById(req.user.id, updates);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

/**
 * PUT /api/users/password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByIdWithPassword(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    throw new AppError('Current password is incorrect', 400);
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await User.updateById(req.user.id, { password: hashed });

  res.json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
