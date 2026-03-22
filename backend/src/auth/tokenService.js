const jwt  = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../db/models/RefreshToken');

const ACCESS_SECRET   = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES  || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env');
}

function msFromExpiry(expiry) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);
  return parseInt(match[1]) * units[match[2]];
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id || user.id, name: user.name, avatar: user.avatar, email: user.email },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES, algorithm: 'HS256' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] });
}

async function createRefreshToken(userId, family = null) {
  const tokenId     = uuidv4();
  const tokenFamily = family || uuidv4();
  const expiresAt   = new Date(Date.now() + msFromExpiry(REFRESH_EXPIRES));

  await RefreshToken.create({
    _id:      tokenId,
    userId,
    family:   tokenFamily,
    expiresAt,
  });

  const token = jwt.sign(
    { sub: userId, jti: tokenId, fam: tokenFamily },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES, algorithm: 'HS256' }
  );

  return { token, tokenId, family: tokenFamily, expiresAt };
}

async function rotateRefreshToken(oldToken) {
  let payload;
  try {
    payload = jwt.verify(oldToken, REFRESH_SECRET, { algorithms: ['HS256'] });
  } catch (e) {
    const err = new Error('Invalid or expired refresh token');
    err.status = 401;
    err.code   = 'TOKEN_EXPIRED';
    throw err;
  }

  const { sub: userId, jti: tokenId, fam: family } = payload;
  const stored = await RefreshToken.findById(tokenId);

  if (!stored) {
    const err = new Error('Refresh token not found');
    err.status = 401;
    err.code   = 'TOKEN_EXPIRED';
    throw err;
  }

  if (stored.revoked) {
    await RefreshToken.updateMany({ family }, { revoked: true });
    const err = new Error('Refresh token reuse detected. All sessions invalidated.');
    err.status = 401;
    err.code   = 'TOKEN_REUSE';
    throw err;
  }

  if (stored.expiresAt < new Date()) {
    const err = new Error('Refresh token expired');
    err.status = 401;
    err.code   = 'TOKEN_EXPIRED';
    throw err;
  }

  await RefreshToken.findByIdAndUpdate(tokenId, { revoked: true });
  const newToken = await createRefreshToken(userId, family);
  return { userId, newRefreshToken: newToken };
}

async function revokeAllUserTokens(userId) {
  await RefreshToken.updateMany({ userId }, { revoked: true });
}

async function revokeFamily(family) {
  await RefreshToken.updateMany({ family }, { revoked: true });
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeAllUserTokens,
  revokeFamily,
};