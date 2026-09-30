const { body, param, query } = require('express-validator');

const sendMessageRules = [
  body('receiverId').isUUID().withMessage('Valid receiverId is required'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 5000 })
    .withMessage('Message is too long'),
];

const conversationParam = [
  param('userId').isUUID().withMessage('Invalid user id'),
];

const messageIdParam = [param('id').isUUID().withMessage('Invalid message id')];

const listMessageRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  sendMessageRules,
  conversationParam,
  messageIdParam,
  listMessageRules,
};
