/**
 * Global Error Handler Middleware
 * 
 * Responsibility:
 * Intercepts errors passed to next(error) across all Express routes.
 * Formats standardized error responses for client applications.
 */

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.stack || err.message}`);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
