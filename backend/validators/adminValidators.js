const { body, param, query } = require('express-validator');

const createComplaintRules = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 }),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('reportedUserId').optional({ checkFalsy: true }).isUUID(),
  body('productId').optional({ checkFalsy: true }).isUUID(),
];

const updateComplaintRules = [
  param('id').isUUID().withMessage('Invalid complaint id'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Invalid status'),
  body('adminNotes').optional({ checkFalsy: true }).trim(),
];

const idParam = [param('id').isUUID().withMessage('Invalid id')];

const paginationRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const updateUserStatusRules = [
  param('id').isUUID().withMessage('Invalid user id'),
  body('accountStatus')
    .notEmpty()
    .withMessage('accountStatus is required')
    .isIn(['active', 'inactive', 'suspended', 'pending']),
];

const sellerActionRules = [param('id').isUUID().withMessage('Invalid seller id')];

module.exports = {
  createComplaintRules,
  updateComplaintRules,
  idParam,
  paginationRules,
  updateUserStatusRules,
  sellerActionRules,
};
