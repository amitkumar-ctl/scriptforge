const passport        = require('passport');
const GoogleStrategy  = require('passport-google-oauth20').Strategy;
const GitHubStrategy  = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { findOrCreateUser } = require('./userService');

const BASE_URL = process.env.CLIENT_URL ? `http://localhost:${process.env.PORT || 4000}` : 'http://localhost:4000';

// ─── Google ───────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${BASE_URL}/api/auth/google/callback`,
      scope:        ['profile', 'email'],
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const user = findOrCreateUser({
          provider:   'google',
          providerId: profile.id,
          email:      profile.emails?.[0]?.value || null,
          name:       profile.displayName,
          avatar:     profile.photos?.[0]?.value || null,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  ));
  console.log('[Auth] ✅ Google OAuth strategy registered');
} else {
  console.warn('[Auth] ⚠️  Google OAuth skipped — GOOGLE_CLIENT_ID/SECRET not set');
}

// ─── GitHub ───────────────────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy(
    {
      clientID:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  `${BASE_URL}/api/auth/github/callback`,
      scope:        ['user:email'],
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const user = findOrCreateUser({
          provider:   'github',
          providerId: String(profile.id),
          email:      profile.emails?.[0]?.value || null,
          name:       profile.displayName || profile.username,
          avatar:     profile.photos?.[0]?.value || null,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  ));
  console.log('[Auth] ✅ GitHub OAuth strategy registered');
} else {
  console.warn('[Auth] ⚠️  GitHub OAuth skipped — GITHUB_CLIENT_ID/SECRET not set');
}


module.exports = passport;
