const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const mpesaService = require('../services/mpesaService');

/**
 * POST /api/payments/mpesa/stk
 */
const initiateMpesaStk = asyncHandler(async (req, res) => {
  const { orderId, phoneNumber } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (order.buyer_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only pay for your own orders', 403);
  }

  if (order.payment_status === 'paid') {
    throw new AppError('This order is already paid', 400);
  }

  if (order.order_status === 'cancelled') {
    throw new AppError('Cannot pay for a cancelled order', 400);
  }

  let payment;
  const existing = await Payment.findByOrderId(orderId);
  const pending = (existing || []).find((p) =>
    ['pending', 'processing', 'failed'].includes(p.payment_status)
  );

  if (pending && pending.payment_status !== 'paid') {
    payment = pending;
  } else {
    payment = await Payment.create({
      order_id: order.id,
      user_id: req.user.id,
      amount: order.total_amount,
      payment_method: mpesaService.isMockMode() ? 'mock' : 'mpesa',
      payment_status: 'pending',
      phone_number: phoneNumber,
    });
  }

  try {
    const stkResult = await mpesaService.initiateStkPush({
      payment,
      phoneNumber,
    });

    const refreshed = await Payment.findById(payment.id);

    res.json({
      success: true,
      message: mpesaService.isMockMode()
        ? 'Mock STK initiated — payment will auto-succeed shortly'
        : 'STK Push initiated. Complete the prompt on your phone.',
      data: {
        payment: refreshed,
        stk: stkResult,
        mockMode: mpesaService.isMockMode(),
      },
    });
  } catch (err) {
    throw new AppError(err.message || 'Failed to initiate M-Pesa payment', 502);
  }
});

/**
 * POST /api/payments/mpesa/callback — public (Daraja)
 */
const mpesaCallback = asyncHandler(async (req, res) => {
  const result = await mpesaService.handleStkCallback(req.body);

  // Always acknowledge to Safaricom
  res.json({
    ResultCode: 0,
    ResultDesc: 'Accepted',
    data: result,
  });
});

/**
 * GET /api/payments/:id
 */
const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new AppError('Payment not found', 404);

  if (
    payment.user_id !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    message: 'Payment retrieved',
    data: { payment },
  });
});

/**
 * GET /api/payments/order/:orderId
 */
const getPaymentsByOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (order.buyer_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }

  const payments = await Payment.findByOrderId(req.params.orderId);

  res.json({
    success: true,
    message: 'Payments retrieved',
    data: { payments },
  });
});

module.exports = {
  initiateMpesaStk,
  mpesaCallback,
  getPayment,
  getPaymentsByOrder,
};
