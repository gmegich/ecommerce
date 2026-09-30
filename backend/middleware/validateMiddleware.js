const { validationResult } = require('express-validator');
const { AppError } = require('./errorMiddleware');

/**
 * Run after express-validator chains; return 400 with first error.
 */
const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const first = result.array({ onlyFirstError: true })[0];
    return next(new AppError(first.msg || 'Validation failed', 400, result.array()));
  }

  return next();
};

module.exports = validate;
