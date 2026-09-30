const { body } = require('express-validator');

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Name must be between 2 and 120 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 9, max: 30 })
    .withMessage('Phone number looks invalid'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['customer', 'seller'])
    .withMessage('Role must be customer or seller'),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('city').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('county').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('businessName')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Business name is required for sellers')
    .isLength({ max: 160 }),
  body('businessDescription').optional({ checkFalsy: true }).trim(),
  body('businessLocation').optional({ checkFalsy: true }).trim().isLength({ max: 160 }),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Name must be between 2 and 120 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 9, max: 30 })
    .withMessage('Phone number looks invalid'),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('city').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('county').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('profileImage').optional({ checkFalsy: true }).trim().isURL().withMessage('Profile image must be a URL'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
};
