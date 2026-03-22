const express   = require('express');
const passport  = require('../auth/passport');
const jwt       = require('jsonwebtoken');
const {
  signAccessToken, createRefreshToken, rotateRefreshToken,
  revokeAllUserTokens, revokeFamily,
} = require('../auth/tokenService');
const { setTokenCookies, clearTokenCookies } = require('../auth/cookieHelper');
const requireAuth = require('../middleware/requireAuth');

const router     = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4001';

// ─── Shared OAuth success handler ─────────────────────────────────────
async function handleOAuthSuccess(req, res, next) {
  try {
    const user = req.user;
    const accessToken              = signAccessToken(user);
    const { token: refreshToken }  = await createRefreshToken(user._id || user.id);

    setTokenCookies(res, accessToken, refreshToken);

    res.redirect(
      `${CLIENT_URL}/auth/callback#` +
      `access=${encodeURIComponent(accessToken)}` +
      `&refresh=${encodeURIComponent(refreshToken)}`
    );
  } catch (err) { next(err); }
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


// ─── Refresh token rotation ───────────────────────────────────────────
router.post('/refresh', async (req, res, next) => {
  try {
    const oldToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!oldToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const { userId, newRefreshToken } = await rotateRefreshToken(oldToken);
    const user        = await require('../auth/userService').getUserById(userId);
    const accessToken = signAccessToken(user);

    setTokenCookies(res, accessToken, newRefreshToken.token);

    res.json({
      accessToken,
      refreshToken: newRefreshToken.token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) { next(err); }
});

// ─── Current user ─────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── Logout (current device) ──────────────────────────────────────────
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.fam) await revokeFamily(decoded.fam);
    }
    clearTokenCookies(res);
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
});

// ─── Logout all devices ───────────────────────────────────────────────
router.post('/logout-all', requireAuth, async (req, res, next) => {
  try {
    await revokeAllUserTokens(req.user.id);
    clearTokenCookies(res);
    res.json({ message: 'Logged out from all devices' });
  } catch (err) { next(err); }
});

module.exports = router;