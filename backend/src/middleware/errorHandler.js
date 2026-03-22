function errorHandler(err, req, res, _next) {
  console.error(`[Error] ${err.message}`);

  // Determine status code
  const status = err.status || err.statusCode || 500;

  // Don't crash on expected auth errors — just return JSON
  if (status === 401) {
    return res.status(401).json({
      error: err.message || 'Unauthorized',
      code:  err.code || 'UNAUTHORIZED',
    });
  }

  if (status === 403) {
    return res.status(403).json({ error: err.message || 'Forbidden' });
  }

  if (status === 404) {
    return res.status(404).json({ error: err.message || 'Not found' });
  }

  // Log stack in dev only
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
}

module.exports = errorHandler;