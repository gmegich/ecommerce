const { body, param, query } = require('express-validator');

const createCategoryRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  body('description').optional({ checkFalsy: true }).trim(),
  body('image').optional({ checkFalsy: true }).trim().isURL().withMessage('Image must be a URL'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft', 'deleted'])
    .withMessage('Invalid status'),
];

const updateCategoryRules = [
  param('id').isUUID().withMessage('Invalid category id'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional({ checkFalsy: true }).trim(),
  body('image').optional({ checkFalsy: true }).trim().isURL().withMessage('Image must be a URL'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft', 'deleted'])
    .withMessage('Invalid status'),
];

const idParam = [param('id').isUUID().withMessage('Invalid id')];

module.exports = {
  createCategoryRules,
  updateCategoryRules,
  idParam,
};
