const express = require('express');
const {
  createOrder,
  listOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createOrderRules,
  updateOrderStatusRules,
  idParam,
  listOrderRules,
} = require('../validators/orderValidators');

const router = express.Router();

router.use(protect);

router.post('/', authorize('customer'), createOrderRules, validate, createOrder);
router.get('/', listOrderRules, validate, listOrders);
router.get('/:id', idParam, validate, getOrder);
router.put('/:id/cancel', idParam, validate, cancelOrder);
router.put(
  '/:id/status',
  authorize('seller', 'admin'),
  updateOrderStatusRules,
  validate,
  updateOrderStatus
);

module.exports = router;
