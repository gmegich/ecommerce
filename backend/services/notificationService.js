const Notification = require('../models/Notification');
const Seller = require('../models/Seller');

/**
 * Create a single notification for a user.
 */
const notifyUser = async ({ userId, title, message, type = 'system' }) => {
  if (!userId) return null;

  return Notification.create({
    user_id: userId,
    title,
    message,
    type,
  });
};

/**
 * Notify buyer (and optionally seller) when an order status changes.
 */
const notifyOrderStatusChange = async (order, previousStatus = null) => {
  if (!order) return;

  const status = order.order_status;
  const orderLabel = order.order_number || order.id;

  const buyerTitle = 'Order update';
  const buyerMessage = previousStatus
    ? `Your order ${orderLabel} changed from ${previousStatus} to ${status}.`
    : `Your order ${orderLabel} is now ${status}.`;

  await notifyUser({
    userId: order.buyer_id,
    title: buyerTitle,
    message: buyerMessage,
    type: 'order',
  });

  let sellerUserId = null;
  if (order.seller_id) {
    const seller = await Seller.findById(order.seller_id);
    sellerUserId = seller?.user_id || seller?.users?.id || null;
  }

  if (sellerUserId) {
    await notifyUser({
      userId: sellerUserId,
      title: 'Order status updated',
      message: `Order ${orderLabel} is now ${status}.`,
      type: 'order',
    });
  }
};

/**
 * Notify on successful payment.
 */
const notifyPaymentSuccess = async ({ userId, orderNumber, amount }) => {
  return notifyUser({
    userId,
    title: 'Payment received',
    message: `Payment of KES ${amount} for order ${orderNumber} was successful.`,
    type: 'payment',
  });
};

/**
 * Notify on new message.
 */
const notifyNewMessage = async ({ receiverId, senderName }) => {
  return notifyUser({
    userId: receiverId,
    title: 'New message',
    message: `${senderName || 'Someone'} sent you a message.`,
    type: 'message',
  });
};

module.exports = {
  notifyUser,
  notifyOrderStatusChange,
  notifyPaymentSuccess,
  notifyNewMessage,
};
