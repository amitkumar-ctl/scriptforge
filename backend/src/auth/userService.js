const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

/**
 * Find an existing user by provider + provider_id, or create a new one.
 * Called from every Passport strategy after successful OAuth.
 */
function findOrCreateUser({ provider, providerId, email, name, avatar }) {
  const existing = db.prepare(
    'SELECT * FROM users WHERE provider = ? AND provider_id = ?'
  ).get(provider, providerId);

  if (existing) {
    // Update profile info in case name/avatar changed on the provider
    db.prepare(`
      UPDATE users SET name = ?, avatar = ?, email = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, avatar, email, existing.id);

    return { ...existing, name, avatar, email };
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO users (id, provider, provider_id, email, name, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, provider, providerId, email, name, avatar);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

module.exports = { findOrCreateUser, getUserById };
