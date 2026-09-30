const express = require('express');
const {
  listProducts,
  getProduct,
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createProductRules,
  updateProductRules,
  listProductRules,
  idParam,
} = require('../validators/productValidators');

const router = express.Router();

router.get('/', listProductRules, validate, listProducts);
router.get('/seller/mine', protect, authorize('seller'), listMyProducts);
router.get('/:id', idParam, validate, getProduct);

router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  createProductRules,
  validate,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  updateProductRules,
  validate,
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  idParam,
  validate,
  deleteProduct
);

module.exports = router;
