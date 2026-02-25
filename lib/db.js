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
      driver_name TEXT NOT NULL DEFAULT 'Seller',
      driver_city TEXT DEFAULT 'Sri Lanka',
      driver_country TEXT DEFAULT 'Sri Lanka',
      lkr_per_usdc REAL NOT NULL DEFAULT 300,
      service_name TEXT NOT NULL DEFAULT 'Service',
      description TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
  `);
  // Add new columns to existing databases that predate this schema
  const cols = database.pragma('table_info(businesses)').map(c => c.name);
  if (!cols.includes('service_name')) database.exec(`ALTER TABLE businesses ADD COLUMN service_name TEXT NOT NULL DEFAULT 'Service'`);
  if (!cols.includes('description'))  database.exec(`ALTER TABLE businesses ADD COLUMN description TEXT DEFAULT ''`);
  if (!cols.includes('phone'))        database.exec(`ALTER TABLE businesses ADD COLUMN phone TEXT DEFAULT ''`);
  if (!cols.includes('whatsapp'))     database.exec(`ALTER TABLE businesses ADD COLUMN whatsapp TEXT DEFAULT ''`);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
