const { verifyAccessToken } = require('../auth/tokenService');
const { getUserById }       = require('../auth/userService');

/**
 * requireAuth middleware
 *
 * Checks for a valid JWT access token in:
 *   1. Authorization: Bearer <token>  (used by MFE fetch calls)
 *   2. accessToken httpOnly cookie    (fallback for same-origin requests)
 *
 * Attaches req.user = { id, name, email, avatar } on success.
 */
function requireAuth(req, res, next) {
  let token = null;

  // 1. Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // 2. Cookie fallback
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = verifyAccessToken(token);
    // Attach minimal user info — avoid extra DB hit on every request
    req.user = {
      id:     payload.sub,
      name:   payload.name,
      email:  payload.email,
      avatar: payload.avatar,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid access token' });
  }
}

module.exports = requireAuth;
