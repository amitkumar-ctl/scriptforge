const express  = require('express');
const passport = require('../auth/passport');
const { signAccessToken, createRefreshToken, rotateRefreshToken, revokeAllUserTokens, revokeFamily } = require('../auth/tokenService');
const { setTokenCookies, clearTokenCookies } = require('../auth/cookieHelper');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4001';

// ─── Shared OAuth success handler ─────────────────────────────────────
function handleOAuthSuccess(req, res) {
  const user = req.user;
  const accessToken  = signAccessToken(user);
  const { token: refreshToken, family } = createRefreshToken(user.id);

  setTokenCookies(res, accessToken, refreshToken);

  // Pass tokens to the client via URL fragment (avoids them appearing in server logs)
  // The frontend reads the fragment, stores accessToken in memory, discards the URL
  res.redirect(
    `${CLIENT_URL}/auth/callback#` +
    `access=${encodeURIComponent(accessToken)}` +
    `&refresh=${encodeURIComponent(refreshToken)}`
  );
}

function handleOAuthFailure(req, res) {
  res.redirect(`${CLIENT_URL}/login?error=oauth_failed`);
}

// ─── Google ───────────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login?error=oauth_failed` }),
  handleOAuthSuccess
);

// ─── GitHub ───────────────────────────────────────────────────────────
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${CLIENT_URL}/login?error=oauth_failed` }),
  handleOAuthSuccess
);

// ─── Facebook ─────────────────────────────────────────────────────────
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${CLIENT_URL}/login?error=oauth_failed` }),
  handleOAuthSuccess
);

// ─── Refresh token rotation ───────────────────────────────────────────
// POST /api/auth/refresh
// Accepts refresh token from cookie OR request body (for MFE fetch calls)
router.post('/refresh', (req, res, next) => {
  try {
    const oldToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!oldToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const { userId, newRefreshToken } = rotateRefreshToken(oldToken);
    const user        = require('../auth/userService').getUserById(userId);
    const accessToken = signAccessToken(user);

    setTokenCookies(res, accessToken, newRefreshToken.token);

    res.json({
      accessToken,
      refreshToken: newRefreshToken.token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Current user ─────────────────────────────────────────────────────
// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── Logout (current device) ──────────────────────────────────────────
// POST /api/auth/logout
router.post('/logout', requireAuth, (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      // Extract family from token without full verification (it may be expired)
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      if (decoded?.fam) revokeFamily(decoded.fam);
    }
  } catch { /* ignore */ }

  clearTokenCookies(res);
  res.json({ message: 'Logged out successfully' });
});

// ─── Logout all devices ───────────────────────────────────────────────
// POST /api/auth/logout-all
router.post('/logout-all', requireAuth, (req, res) => {
  revokeAllUserTokens(req.user.id);
  clearTokenCookies(res);
  res.json({ message: 'Logged out from all devices' });
});

module.exports = router;
