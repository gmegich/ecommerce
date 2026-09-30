const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/notifications
 */
const listNotifications = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const unreadOnly = req.query.unreadOnly === 'true';

  const result = await Notification.findByUser(req.user.id, {
    page,
    limit,
    unreadOnly,
  });

  const unreadCount = await Notification.countUnread(req.user.id);

  res.json({
    success: true,
    message: 'Notifications retrieved',
    data: {
      ...result,
      unreadCount,
    },
  });
});

/**
 * PUT /api/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.markAsRead(req.params.id, req.user.id);

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  });
});

/**
 * PUT /api/notifications/read-all
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.markAllAsRead(req.user.id);

  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: null,
  });
});

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
};
