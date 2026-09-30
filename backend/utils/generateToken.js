const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for an authenticated user.
 */
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret === 'change_this_to_a_long_random_secret') {
    console.warn(
      '[Auth] JWT_SECRET is weak or missing. Set a strong secret in backend/.env'
    );
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    secret || 'dev-only-insecure-secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;
