const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Seller = require('../models/Seller');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const generateOrderNumber = require('../utils/generateOrderNumber');
const { notifyOrderStatusChange, notifyUser } = require('../services/notificationService');

const STATUS_FLOW = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
];

const deliveryStatusForOrder = (orderStatus) => {
  switch (orderStatus) {
    case 'shipped':
      return 'shipped';
    case 'out_for_delivery':
      return 'out_for_delivery';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
      return undefined;
    default:
      return 'not_shipped';
  }
};

const canTransition = (from, to) => {
  if (to === 'cancelled') {
    return ['pending', 'confirmed'].includes(from);
  }
  const fromIdx = STATUS_FLOW.indexOf(from);
  const toIdx = STATUS_FLOW.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx === fromIdx + 1 || toIdx === fromIdx;
};

/**
 * POST /api/orders — create from cart (one order per seller group)
 */
const createOrder = asyncHandler(async (req, res) => {
  const {
    deliveryAddress,
    deliveryCity,
    deliveryCounty,
    deliveryPhone,
    notes,
  } = req.body;

  const cart = await Cart.findByUserId(req.user.id);
  if (!cart || !cart.items?.length) {
    throw new AppError('Your cart is empty', 400);
  }

  // Group items by seller
  const groups = new Map();
  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.status !== 'active') {
      throw new AppError(`Product "${item.product_id}" is not available`, 400);
    }
    if (product.stock_quantity < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    const sellerId = product.seller_id;
    if (!groups.has(sellerId)) groups.set(sellerId, []);
    groups.get(sellerId).push(item);
  }

  const createdOrders = [];

  for (const [sellerId, items] of groups.entries()) {
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0
    );

    const orderPayload = {
      order_number: generateOrderNumber(),
      buyer_id: req.user.id,
      seller_id: sellerId,
      total_amount: Number(totalAmount.toFixed(2)),
      delivery_address: deliveryAddress.trim(),
      delivery_city: deliveryCity || req.user.city || null,
      delivery_county: deliveryCounty || req.user.county || null,
      delivery_phone: deliveryPhone || req.user.phone || null,
      payment_status: 'pending',
      order_status: 'pending',
      delivery_status: 'not_shipped',
      notes: notes || null,
    };

    const orderItems = items.map((item) => ({
      product_id: item.product_id,
      seller_id: sellerId,
      product_name: item.product.name,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    }));

    // Reduce stock
    for (const item of items) {
      const fresh = await Product.findById(item.product_id);
      if (!fresh || fresh.stock_quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product?.name || 'product'}`, 400);
      }
      await Product.updateStock(item.product_id, fresh.stock_quantity - item.quantity);
    }

    const order = await Order.create({ order: orderPayload, items: orderItems });

    await Payment.create({
      order_id: order.id,
      user_id: req.user.id,
      amount: order.total_amount,
      payment_method: 'mpesa',
      payment_status: 'pending',
      phone_number: deliveryPhone || req.user.phone || null,
    });

    // Notify seller
    const seller = await Seller.findById(sellerId);
    if (seller?.user_id) {
      await notifyUser({
        userId: seller.user_id,
        title: 'New order received',
        message: `You have a new order ${order.order_number}.`,
        type: 'order',
      });
    }

    await notifyUser({
      userId: req.user.id,
      title: 'Order placed',
      message: `Order ${order.order_number} was placed successfully. Complete payment to confirm.`,
      type: 'order',
    });

    createdOrders.push(order);
  }

  await Cart.clear(req.user.id);

  res.status(201).json({
    success: true,
    message:
      createdOrders.length > 1
        ? `${createdOrders.length} orders created (one per seller)`
        : 'Order created successfully',
    data: { orders: createdOrders },
  });
});

/**
 * GET /api/orders — role-aware list
 */
const listOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { orderStatus, paymentStatus } = req.query;

  let result;

  if (req.user.role === 'admin') {
    result = await Order.findAll({ page, limit, orderStatus, paymentStatus });
  } else if (req.user.role === 'seller') {
    const seller = await Seller.findByUserId(req.user.id);
    if (!seller) throw new AppError('Seller profile not found', 404);
    result = await Order.findBySeller(seller.id, { page, limit, orderStatus });
  } else {
    result = await Order.findByBuyer(req.user.id, { page, limit });
  }

  res.json({
    success: true,
    message: 'Orders retrieved',
    data: result,
  });
});

/**
 * GET /api/orders/:id
 */
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  if (req.user.role === 'customer' && order.buyer_id !== req.user.id) {
    throw new AppError('Access denied', 403);
  }

  if (req.user.role === 'seller') {
    const seller = await Seller.findByUserId(req.user.id);
    if (!seller || order.seller_id !== seller.id) {
      throw new AppError('Access denied', 403);
    }
  }

  res.json({
    success: true,
    message: 'Order retrieved',
    data: { order },
  });
});

/**
 * PUT /api/orders/:id/cancel
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  const isBuyer = order.buyer_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isAdmin) {
    throw new AppError('Only the buyer or admin can cancel this order', 403);
  }

  if (!['pending', 'confirmed'].includes(order.order_status)) {
    throw new AppError('This order can no longer be cancelled', 400);
  }

  // Restore stock
  for (const item of order.items || []) {
    if (!item.product_id) continue;
    const product = await Product.findById(item.product_id);
    if (product) {
      await Product.updateStock(product.id, product.stock_quantity + item.quantity);
    }
  }

  const previous = order.order_status;
  const updated = await Order.updateStatus(order.id, {
    orderStatus: 'cancelled',
    paymentStatus: order.payment_status === 'paid' ? 'refunded' : 'cancelled',
  });

  await notifyOrderStatusChange(updated, previous);

  res.json({
    success: true,
    message: 'Order cancelled',
    data: { order: updated },
  });
});

/**
 * PUT /api/orders/:id/status — seller / admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  if (req.user.role === 'seller') {
    const seller = await Seller.findByUserId(req.user.id);
    if (!seller || order.seller_id !== seller.id) {
      throw new AppError('You can only update your own orders', 403);
    }
  } else if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }

  const { orderStatus, deliveryStatus } = req.body;

  if (order.order_status === 'cancelled' || order.order_status === 'delivered') {
    throw new AppError(`Cannot update a ${order.order_status} order`, 400);
  }

  if (!canTransition(order.order_status, orderStatus) && req.user.role !== 'admin') {
    throw new AppError(
      `Invalid status transition from ${order.order_status} to ${orderStatus}`,
      400
    );
  }

  const previous = order.order_status;
  const nextDelivery =
    deliveryStatus || deliveryStatusForOrder(orderStatus);

  const updated = await Order.updateStatus(order.id, {
    orderStatus,
    deliveryStatus: nextDelivery,
  });

  await notifyOrderStatusChange(updated, previous);

  res.json({
    success: true,
    message: 'Order status updated',
    data: { order: updated },
  });
});

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
};
