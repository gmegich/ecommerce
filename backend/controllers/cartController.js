const Cart = require('../models/Cart');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/cart
 */
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.getOrCreateByUserId(req.user.id);

  res.json({
    success: true,
    message: 'Cart retrieved',
    data: { cart },
  });
});

/**
 * POST /api/cart/items
 */
const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const cart = await Cart.addItem(req.user.id, {
    productId,
    quantity: Number(quantity),
  });

  res.status(201).json({
    success: true,
    message: 'Item added to cart',
    data: { cart },
  });
});

/**
 * PUT /api/cart/items/:itemId
 */
const updateItem = asyncHandler(async (req, res) => {
  const cart = await Cart.updateItem(
    req.user.id,
    req.params.itemId,
    Number(req.body.quantity)
  );

  res.json({
    success: true,
    message: 'Cart item updated',
    data: { cart },
  });
});

/**
 * DELETE /api/cart/items/:itemId
 */
const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.removeItem(req.user.id, req.params.itemId);

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: { cart },
  });
});

/**
 * DELETE /api/cart
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.clear(req.user.id);
  if (!cart) throw new AppError('Cart not found', 404);

  res.json({
    success: true,
    message: 'Cart cleared',
    data: { cart },
  });
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
