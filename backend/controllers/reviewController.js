const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { notifyUser } = require('../services/notificationService');
const Seller = require('../models/Seller');

/**
 * Soft purchase check: prefer delivered order containing product,
 * otherwise allow any authenticated buyer.
 */
const hasPurchasedOrAllow = async (buyerId, productId) => {
  const buyerOrders = await Order.findByBuyer(buyerId, { page: 1, limit: 100 });

  const deliveredMatch = (buyerOrders.orders || []).some(
    (order) =>
      order.order_status === 'delivered' &&
      (order.items || []).some((item) => item.product_id === productId)
  );

  if (deliveredMatch) return { allowed: true, verifiedPurchase: true };

  // Soft: allow authenticated buyers even without delivered order
  return { allowed: true, verifiedPurchase: false };
};

/**
 * GET /api/reviews/product/:productId
 */
const listProductReviews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const product = await Product.findById(req.params.productId);
  if (!product) throw new AppError('Product not found', 404);

  const result = await Review.findByProduct(req.params.productId, { page, limit });

  res.json({
    success: true,
    message: 'Reviews retrieved',
    data: result,
  });
});

/**
 * POST /api/reviews
 */
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product || product.status === 'deleted') {
    throw new AppError('Product not found', 404);
  }

  const { allowed, verifiedPurchase } = await hasPurchasedOrAllow(req.user.id, productId);
  if (!allowed) {
    throw new AppError('You can only review products you have purchased', 403);
  }

  const existing = await Review.findByBuyerAndProduct(req.user.id, productId);
  if (existing) {
    throw new AppError('You have already reviewed this product', 409);
  }

  const review = await Review.create({
    product_id: productId,
    buyer_id: req.user.id,
    rating: Number(rating),
    comment: comment || null,
  });

  // Notify seller
  const seller = await Seller.findById(product.seller_id);
  if (seller?.user_id) {
    await notifyUser({
      userId: seller.user_id,
      title: 'New product review',
      message: `${req.user.name} rated "${product.name}" ${rating}/5.`,
      type: 'review',
    });
  }

  res.status(201).json({
    success: true,
    message: verifiedPurchase
      ? 'Review submitted'
      : 'Review submitted (purchase not verified — soft check)',
    data: { review, verifiedPurchase },
  });
});

/**
 * PUT /api/reviews/:id
 */
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  if (review.buyer_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only update your own reviews', 403);
  }

  const updates = {};
  if (req.body.rating !== undefined) updates.rating = Number(req.body.rating);
  if (req.body.comment !== undefined) updates.comment = req.body.comment || null;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const updated = await Review.updateById(req.params.id, updates);

  res.json({
    success: true,
    message: 'Review updated',
    data: { review: updated },
  });
});

/**
 * DELETE /api/reviews/:id
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  if (review.buyer_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only delete your own reviews', 403);
  }

  await Review.deleteById(req.params.id);

  res.json({
    success: true,
    message: 'Review deleted',
    data: null,
  });
});

/**
 * GET /api/reviews/:id
 */
const getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  res.json({
    success: true,
    message: 'Review retrieved',
    data: { review },
  });
});

module.exports = {
  listProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
};
