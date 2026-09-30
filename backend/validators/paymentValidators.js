const { body, param } = require('express-validator');

const stkPushRules = [
  body('orderId').isUUID().withMessage('Valid orderId is required'),
  body('phoneNumber')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 9, max: 30 })
    .withMessage('phoneNumber looks invalid'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 9, max: 30 })
    .withMessage('phone looks invalid'),
  body().custom((_, { req }) => {
    if (!req.body.phoneNumber && !req.body.phone) {
      throw new Error('phoneNumber is required');
    }
    if (!req.body.phoneNumber && req.body.phone) {
      req.body.phoneNumber = req.body.phone;
    }
    return true;
  }),
];

const paymentIdParam = [param('id').isUUID().withMessage('Invalid payment id')];

module.exports = {
  stkPushRules,
  paymentIdParam,
};
