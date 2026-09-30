const { AppError } = require('../middleware/errorMiddleware');

/**
 * Convert a Supabase client error into an AppError.
 */
const handleSupabaseError = (error, fallbackMessage = 'Database operation failed') => {
  if (!error) return null;

  const message = error.message || fallbackMessage;
  const code = error.code;

  if (code === '23505') {
    return new AppError('A record with this value already exists', 409, message);
  }

  if (code === '23503') {
    return new AppError('Related record not found', 400, message);
  }

  if (code === '23514') {
    return new AppError('Validation failed for one or more fields', 400, message);
  }

  if (code === 'PGRST116') {
    return new AppError('Record not found', 404, message);
  }

  return new AppError(fallbackMessage, 500, message);
};

/**
 * Throw if Supabase returned an error.
 */
const throwIfError = (error, fallbackMessage) => {
  const appError = handleSupabaseError(error, fallbackMessage);
  if (appError) throw appError;
};

/**
 * Remove sensitive fields before sending user data to clients.
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

/**
 * Map a list of rows through sanitizeUser.
 */
const sanitizeUsers = (users = []) => users.map(sanitizeUser);

module.exports = {
  handleSupabaseError,
  throwIfError,
  sanitizeUser,
  sanitizeUsers,
};
