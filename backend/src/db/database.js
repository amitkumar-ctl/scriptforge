const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR  = path.resolve(__dirname, '../../../data');
const DB_PATH = path.join(DB_DIR, 'scriptforge.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    provider      TEXT NOT NULL,
    provider_id   TEXT NOT NULL,
    email         TEXT,
    name          TEXT,
    avatar        TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(provider, provider_id)
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family        TEXT NOT NULL,
    expires_at    TEXT NOT NULL,
    revoked       INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scripts (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform      TEXT NOT NULL,
    topic         TEXT NOT NULL,
    config        TEXT NOT NULL,
    result        TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user   ON refresh_tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family);
  CREATE INDEX IF NOT EXISTS idx_scripts_user          ON scripts(user_id);
`);

module.exports = db;
