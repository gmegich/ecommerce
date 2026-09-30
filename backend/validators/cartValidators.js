const { body, param } = require('express-validator');

const addCartItemRules = [
  body('productId').isUUID().withMessage('Valid productId is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

const updateCartItemRules = [
  param('itemId').isUUID().withMessage('Invalid cart item id'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

const itemIdParam = [param('itemId').isUUID().withMessage('Invalid cart item id')];

module.exports = {
  addCartItemRules,
  updateCartItemRules,
  itemIdParam,
};
