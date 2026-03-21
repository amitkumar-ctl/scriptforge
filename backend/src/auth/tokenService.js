const jwt  = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db   = require('../db/database');

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES  || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env');
}

// ─── Helpers ─────────────────────────────────────────────────────────
function msFromExpiry(expiry) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);
  return parseInt(match[1]) * units[match[2]];
}

// ─── Access token ─────────────────────────────────────────────────────
function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, avatar: user.avatar, email: user.email },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES, algorithm: 'HS256' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] });
}

// ─── Refresh token ────────────────────────────────────────────────────
/**
 * Create a new refresh token for a user.
 * @param {string} userId
 * @param {string|null} family  - pass existing family for rotation, null for new session
 */
function createRefreshToken(userId, family = null) {
  const tokenId   = uuidv4();
  const tokenFamily = family || uuidv4();
  const expiresAt = new Date(Date.now() + msFromExpiry(REFRESH_EXPIRES)).toISOString();

  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, family, expires_at, revoked)
    VALUES (?, ?, ?, ?, 0)
  `).run(tokenId, userId, tokenFamily, expiresAt);

  const token = jwt.sign(
    { sub: userId, jti: tokenId, fam: tokenFamily },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES, algorithm: 'HS256' }
  );

  return { token, tokenId, family: tokenFamily, expiresAt };
}

/**
 * Rotate a refresh token.
 * - Verifies JWT signature and expiry
 * - Detects token reuse (already revoked → revoke entire family)
 * - Marks old token revoked, issues new token in same family
 * Returns { userId, newRefreshToken, newFamily } or throws.
 */
function rotateRefreshToken(oldToken) {
  let payload;
  try {
    payload = jwt.verify(oldToken, REFRESH_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    throw Object.assign(new Error('Invalid or expired refresh token'), { status: 401 });
  }

  const { sub: userId, jti: tokenId, fam: family } = payload;

  const stored = db.prepare('SELECT * FROM refresh_tokens WHERE id = ?').get(tokenId);

  if (!stored) {
    throw Object.assign(new Error('Refresh token not found'), { status: 401 });
  }

  // Reuse detected — someone tried to use an already-consumed token
  // Revoke the entire family to force re-login
  if (stored.revoked) {
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE family = ?').run(family);
    throw Object.assign(
      new Error('Refresh token reuse detected. All sessions invalidated.'),
      { status: 401 }
    );
  }

  if (new Date(stored.expires_at) < new Date()) {
    throw Object.assign(new Error('Refresh token expired'), { status: 401 });
  }

  // Revoke old token
  db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?').run(tokenId);

  // Issue new token in the same family
  const newToken = createRefreshToken(userId, family);

  return { userId, newRefreshToken: newToken };
}

/**
 * Revoke all refresh tokens for a user (logout all devices).
 */
function revokeAllUserTokens(userId) {
  db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(userId);
}

/**
 * Revoke a single refresh token family (logout current device).
 */
function revokeFamily(family) {
  db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE family = ?').run(family);
}

/**
 * Periodic cleanup — delete expired tokens older than 30 days.
 */
function cleanupExpiredTokens() {
  const result = db.prepare(`
    DELETE FROM refresh_tokens
    WHERE expires_at < datetime('now', '-30 days')
  `).run();
  if (result.changes > 0) {
    console.log(`[TokenCleanup] Removed ${result.changes} expired tokens`);
  }
}

// Run cleanup once at startup and every 24h
cleanupExpiredTokens();
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);

module.exports = {
  signAccessToken,
  verifyAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeAllUserTokens,
  revokeFamily,
};
