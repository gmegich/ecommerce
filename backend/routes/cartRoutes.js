const express = require('express');
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  addCartItemRules,
  updateCartItemRules,
  itemIdParam,
} = require('../validators/cartValidators');

const router = express.Router();

router.use(protect);
router.use(authorize('customer', 'admin'));

router.get('/', getCart);
router.post('/items', addCartItemRules, validate, addItem);
router.put('/items/:itemId', updateCartItemRules, validate, updateItem);
router.delete('/items/:itemId', itemIdParam, validate, removeItem);
router.delete('/', clearCart);

module.exports = router;
