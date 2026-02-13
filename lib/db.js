/**
 * Optional SQLite database for multi-tenant (community) mode.
 * When DATABASE_PATH is set, businesses can be registered and payments
 * are routed by slug (/p/:slug).
 */

import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db = null;

export function getDb(path = process.env.DATABASE_PATH) {
  if (!path) return null;
  if (db) return db;
  const resolved = path.startsWith('/') ? path : join(process.cwd(), path);
  db = new Database(resolved);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return db;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      slug TEXT PRIMARY KEY,
      driver_wallet TEXT NOT NULL,
      driver_name TEXT NOT NULL DEFAULT 'Driver',
      driver_city TEXT DEFAULT 'Sri Lanka',
      driver_country TEXT DEFAULT 'Sri Lanka',
      lkr_per_usdc REAL NOT NULL DEFAULT 300,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
