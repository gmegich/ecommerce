const express = require('express');
const {
  listProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createReviewRules,
  updateReviewRules,
  productIdParam,
  idParam,
  listReviewRules,
} = require('../validators/reviewValidators');

const router = express.Router();

router.get(
  '/product/:productId',
  productIdParam,
  listReviewRules,
  validate,
  listProductReviews
);
router.get('/:id', idParam, validate, getReview);

router.post(
  '/',
  protect,
  authorize('customer', 'admin'),
  createReviewRules,
  validate,
  createReview
);
router.put('/:id', protect, updateReviewRules, validate, updateReview);
router.delete('/:id', protect, idParam, validate, deleteReview);

module.exports = router;
