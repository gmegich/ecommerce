const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Seller = require('../models/Seller');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 12;

const buildAuthResponse = (user, token, extra = {}) => ({
  success: true,
  message: extra.message || 'Success',
  data: {
    token,
    user: User.sanitize(user),
    ...extra.data,
  },
});

/**
 * POST /api/auth/register
 * Public registration for customers and sellers only.
 */
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    role = 'customer',
    address,
    city,
    county,
    businessName,
    businessDescription,
    businessLocation,
  } = req.body;

  if (!['customer', 'seller'].includes(role)) {
    throw new AppError('Invalid registration role', 400);
  }

  const existing = await User.findByEmail(email);
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || null,
    password: hashedPassword,
    role,
    address: address || null,
    city: city || null,
    county: county || null,
    account_status: 'active',
  });

  let sellerProfile = null;

  if (role === 'seller') {
    sellerProfile = await Seller.create({
      user_id: user.id,
      business_name: businessName.trim(),
      business_description: businessDescription || null,
      business_location: businessLocation || city || null,
      contact_information: phone || email,
      verification_status: 'pending',
    });
  }

  const token = generateToken(user);

  res.status(201).json(
    buildAuthResponse(user, token, {
      message:
        role === 'seller'
          ? 'Seller account created. Awaiting admin verification.'
          : 'Registration successful',
      data: sellerProfile ? { sellerProfile } : {},
    })
  );
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.account_status === 'suspended' || user.account_status === 'inactive') {
    throw new AppError('Your account is not active. Contact support.', 403);
  }

  const token = generateToken(user);
  const safeUser = User.sanitize(user);

  let sellerProfile = null;
  if (user.role === 'seller') {
    sellerProfile = await Seller.findByUserId(user.id);
  }

  res.json(
    buildAuthResponse(safeUser, token, {
      message: 'Login successful',
      data: sellerProfile ? { sellerProfile } : {},
    })
  );
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  let sellerProfile = null;

  if (req.user.role === 'seller') {
    sellerProfile = await Seller.findByUserId(req.user.id);
  }

  res.json({
    success: true,
    message: 'Current user retrieved',
    data: {
      user: req.user,
      sellerProfile,
    },
  });
});

/**
 * POST /api/auth/logout
 * Stateless JWT — client discards the token.
 */
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
};
