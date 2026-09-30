const { body, param, query } = require('express-validator');

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const createOrderRules = [
  body('deliveryAddress')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required')
    .isLength({ max: 500 }),
  body('deliveryCity').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('deliveryCounty').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('deliveryPhone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 9, max: 30 })
    .withMessage('Delivery phone looks invalid'),
  body('notes').optional({ checkFalsy: true }).trim(),
];

const updateOrderStatusRules = [
  param('id').isUUID().withMessage('Invalid order id'),
  body('orderStatus')
    .notEmpty()
    .withMessage('orderStatus is required')
    .isIn(ORDER_STATUSES)
    .withMessage('Invalid order status'),
  body('deliveryStatus')
    .optional()
    .isIn(['not_shipped', 'shipped', 'out_for_delivery', 'delivered', 'returned']),
];

const idParam = [param('id').isUUID().withMessage('Invalid order id')];

const listOrderRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('orderStatus').optional().isIn(ORDER_STATUSES),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled']),
];

module.exports = {
  ORDER_STATUSES,
  createOrderRules,
  updateOrderStatusRules,
  idParam,
  listOrderRules,
};
