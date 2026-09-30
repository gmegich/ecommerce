/**
 * Centralized Express error handler
 * Controllers should call next(err) or throw AppError instances.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, error = null) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;
  }
}

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: err.isOperational
      ? err.error || undefined
      : process.env.NODE_ENV === 'production'
        ? undefined
        : err.stack,
  });
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
};
