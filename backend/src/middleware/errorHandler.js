/**
 * Centralized Express error handler.
 * Catches errors forwarded via next(err).
 */
function errorHandler(err, req, res, _next) {
  console.error(`[Error] ${err.message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Anthropic SDK errors
  if (err.status && err.error) {
    return res.status(err.status).json({
      error: err.error?.error?.message || 'Anthropic API error',
      type: err.error?.error?.type,
    });
  }

  // Validation errors from express/cors
  if (err.message?.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
