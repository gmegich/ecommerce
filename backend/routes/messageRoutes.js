const express = require('express');
const {
  sendMessage,
  getInbox,
  getConversation,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  sendMessageRules,
  conversationParam,
  messageIdParam,
  listMessageRules,
} = require('../validators/messageValidators');

const router = express.Router();

router.use(protect);

router.post('/', sendMessageRules, validate, sendMessage);
router.get('/inbox', listMessageRules, validate, getInbox);
router.get(
  '/conversation/:userId',
  conversationParam,
  listMessageRules,
  validate,
  getConversation
);
router.put('/:id/read', messageIdParam, validate, markAsRead);

module.exports = router;
