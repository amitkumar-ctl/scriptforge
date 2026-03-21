const isProd = process.env.NODE_ENV === 'production';

const REFRESH_EXPIRES_MS = (() => {
  const exp = process.env.JWT_REFRESH_EXPIRES || '7d';
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const m = exp.match(/^(\d+)([smhd])$/);
  return m ? parseInt(m[1]) * units[m[2]] : 7 * 86400000;
})();

/**
 * Set both access token (short-lived) and refresh token (long-lived) as
 * httpOnly, Secure (in prod), SameSite=Lax cookies.
 *
 * httpOnly   → JS cannot read them (XSS protection)
 * Secure     → HTTPS only in production
 * SameSite   → CSRF protection
 */
function setTokenCookies(res, accessToken, refreshToken) {
  const base = {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path:     '/',
  };

  // Access token cookie — expires when browser closes (session cookie)
  // The JS side stores it in memory; the cookie is the backup for page refreshes
  res.cookie('accessToken', accessToken, {
    ...base,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...base,
    maxAge: REFRESH_EXPIRES_MS,
    path:   '/api/auth', // only sent to auth endpoints
  });
}

/**
 * Clear both token cookies on logout.
 */
function clearTokenCookies(res) {
  res.clearCookie('accessToken',  { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth' });
}

module.exports = { setTokenCookies, clearTokenCookies };
