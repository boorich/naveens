/**
 * Optional SQLite database for multi-tenant (community) mode.
 * When DATABASE_PATH is set, businesses can be registered and payments
 * are routed by slug (/p/:slug).
 */

import Database from 'better-sqlite3';
import { randomBytes } from 'crypto';
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
      is_available INTEGER NOT NULL DEFAULT 1,
      manage_token TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      vendor_amount REAL NOT NULL,
      fee_amount REAL NOT NULL DEFAULT 0,
      vendor_tx TEXT,
      fee_tx TEXT,
      fee_status TEXT NOT NULL DEFAULT 'none',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_slug ON transactions(slug);
  `);
  // Add new columns to existing databases that predate this schema
  const cols = database.pragma('table_info(businesses)').map(c => c.name);
  if (!cols.includes('service_name'))  database.exec(`ALTER TABLE businesses ADD COLUMN service_name TEXT NOT NULL DEFAULT 'Service'`);
  if (!cols.includes('description'))   database.exec(`ALTER TABLE businesses ADD COLUMN description TEXT DEFAULT ''`);
  if (!cols.includes('phone'))         database.exec(`ALTER TABLE businesses ADD COLUMN phone TEXT DEFAULT ''`);
  if (!cols.includes('whatsapp'))      database.exec(`ALTER TABLE businesses ADD COLUMN whatsapp TEXT DEFAULT ''`);
  if (!cols.includes('is_available'))  database.exec(`ALTER TABLE businesses ADD COLUMN is_available INTEGER NOT NULL DEFAULT 1`);
  if (!cols.includes('manage_token'))  database.exec(`ALTER TABLE businesses ADD COLUMN manage_token TEXT NOT NULL DEFAULT ''`);

  // Backfill any rows that have an empty manage_token
  const empty = database.prepare(`SELECT slug FROM businesses WHERE manage_token = '' OR manage_token IS NULL`).all();
  const update = database.prepare(`UPDATE businesses SET manage_token = ? WHERE slug = ?`);
  for (const row of empty) {
    update.run(randomBytes(16).toString('hex'), row.slug);
  }
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
