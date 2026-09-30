const { body, param, query } = require('express-validator');

const createReviewRules = [
  body('productId').isUUID().withMessage('Valid productId is required'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
];

const updateReviewRules = [
  param('id').isUUID().withMessage('Invalid review id'),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
];

const productIdParam = [
  param('productId').isUUID().withMessage('Invalid product id'),
];

const idParam = [param('id').isUUID().withMessage('Invalid review id')];

const listReviewRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

module.exports = {
  createReviewRules,
  updateReviewRules,
  productIdParam,
  idParam,
  listReviewRules,
};
