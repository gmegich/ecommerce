const { body, param, query } = require('express-validator');

const createProductRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 }),
  body('description').optional({ values: 'falsy' }).trim(),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .bail()
    .customSanitizer((value) => Number(value))
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('stockQuantity')
    .optional({ values: 'falsy' })
    .customSanitizer((value) =>
      value === '' || value === null || value === undefined ? 0 : Number(value)
    )
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('stock_quantity')
    .optional({ values: 'falsy' })
    .customSanitizer((value) =>
      value === '' || value === null || value === undefined ? 0 : Number(value)
    )
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('categoryId')
    .optional({ values: 'falsy' })
    .isUUID()
    .withMessage('Invalid category id'),
  body('category_id')
    .optional({ values: 'falsy' })
    .isUUID()
    .withMessage('Invalid category id'),
  body('location').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('images')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    })
    .isArray()
    .withMessage('Images must be an array of URLs'),
  body('images.*').optional().isString().withMessage('Each image must be a string URL'),
  body('status')
    .optional({ values: 'falsy' })
    .isIn(['active', 'inactive', 'draft', 'deleted'])
    .withMessage('Invalid status'),
  body('sellerId')
    .optional({ values: 'falsy' })
    .isUUID()
    .withMessage('Invalid seller id'),
];

const updateProductRules = [
  param('id').isUUID().withMessage('Invalid product id'),
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ values: 'falsy' }).trim(),
  body('price')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => Number(value))
    .isFloat({ min: 0 })
    .withMessage('Price must be non-negative'),
  body('stockQuantity')
    .optional({ values: 'null' })
    .customSanitizer((value) => Number(value))
    .isInt({ min: 0 }),
  body('stock_quantity')
    .optional({ values: 'null' })
    .customSanitizer((value) => Number(value))
    .isInt({ min: 0 }),
  body('categoryId').optional({ values: 'falsy' }).isUUID(),
  body('category_id').optional({ values: 'falsy' }).isUUID(),
  body('location').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('images').optional({ values: 'falsy' }).isArray(),
  body('images.*').optional().isString(),
  body('status')
    .optional({ values: 'falsy' })
    .isIn(['active', 'inactive', 'draft', 'deleted']),
];

const listProductRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sort')
    .optional()
    .isIn(['newest', 'price_asc', 'price_desc', 'rating']),
  query('availability').optional().isIn(['in_stock', 'out_of_stock']),
  query('categoryId').optional().isUUID(),
  query('sellerId').optional().isUUID(),
];

const idParam = [param('id').isUUID().withMessage('Invalid product id')];

module.exports = {
  createProductRules,
  updateProductRules,
  listProductRules,
  idParam,
};
