const express = require('express');
const {
  listNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { param } = require('express-validator');

const router = express.Router();

router.use(protect);

router.get('/', listNotifications);
router.put('/read-all', markAllAsRead);
router.put(
  '/:id/read',
  [param('id').isUUID().withMessage('Invalid notification id')],
  validate,
  markAsRead
);

module.exports = router;
