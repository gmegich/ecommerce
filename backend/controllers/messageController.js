const Message = require('../models/Message');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { notifyNewMessage } = require('../services/notificationService');

/**
 * POST /api/messages
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, message } = req.body;

  if (receiverId === req.user.id) {
    throw new AppError('You cannot message yourself', 400);
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) throw new AppError('Receiver not found', 404);

  const created = await Message.create({
    sender_id: req.user.id,
    receiver_id: receiverId,
    message: message.trim(),
  });

  await notifyNewMessage({
    receiverId,
    senderName: req.user.name,
  });

  res.status(201).json({
    success: true,
    message: 'Message sent',
    data: { message: created },
  });
});

/**
 * GET /api/messages/inbox
 */
const getInbox = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;

  const result = await Message.findInbox(req.user.id, { page, limit });

  res.json({
    success: true,
    message: 'Inbox retrieved',
    data: result,
  });
});

/**
 * GET /api/messages/conversation/:userId
 */
const getConversation = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const otherUserId = req.params.userId;

  const other = await User.findById(otherUserId);
  if (!other) throw new AppError('User not found', 404);

  const result = await Message.findConversation(req.user.id, otherUserId, {
    page,
    limit,
  });

  await Message.markConversationAsRead(req.user.id, otherUserId);

  res.json({
    success: true,
    message: 'Conversation retrieved',
    data: {
      ...result,
      participant: {
        id: other.id,
        name: other.name,
        profile_image: other.profile_image,
        role: other.role,
      },
    },
  });
});

/**
 * PUT /api/messages/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const updated = await Message.markAsRead(req.params.id, req.user.id);

  res.json({
    success: true,
    message: 'Message marked as read',
    data: { message: updated },
  });
});

module.exports = {
  sendMessage,
  getInbox,
  getConversation,
  markAsRead,
};
