const express = require('express');
const {
  initiateMpesaStk,
  mpesaCallback,
  getPayment,
  getPaymentsByOrder,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  stkPushRules,
  paymentIdParam,
} = require('../validators/paymentValidators');
const { param } = require('express-validator');

const router = express.Router();

// Public Daraja callback
router.post('/mpesa/callback', mpesaCallback);

router.post('/mpesa/stk', protect, stkPushRules, validate, initiateMpesaStk);
router.get(
  '/order/:orderId',
  protect,
  [param('orderId').isUUID().withMessage('Invalid order id')],
  validate,
  getPaymentsByOrder
);
router.get('/:id', protect, paymentIdParam, validate, getPayment);

module.exports = router;
