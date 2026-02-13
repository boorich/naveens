/**
 * Business (tenant) records for multi-tenant mode.
 * Each business has a slug; payments under /p/:slug use that business's wallet and settings.
 */

import { getDb } from './db.js';

export function getBySlug(slug) {
  const database = getDb();
  if (!database) return null;
  const row = database.prepare(
    'SELECT slug, driver_wallet AS driverWallet, driver_name AS driverName, driver_city AS driverCity, driver_country AS driverCountry, lkr_per_usdc AS lkrPerUsdc FROM businesses WHERE slug = ?'
  ).get(slug);
  return row || null;
}

/**
 * Build payment config object from a business row (for paymentService).
 * @param {Object} business - Row from getBySlug
 * @param {Object} baseConfig - Server paymentConfig (baseUrl, network, x402Mode, etc.)
 * @param {string} slug - Business slug (so resourceUrl points to /api/p/:slug/pay)
 */
export function businessToPaymentConfig(business, baseConfig, slug) {
  if (!business) return null;
  const baseUrl = baseConfig.baseUrl || '';
  return {
    ...baseConfig,
    driverWallet: business.driverWallet,
    lkrPerUsdc: business.lkrPerUsdc,
    driverName: business.driverName,
    driverCity: business.driverCity,
    driverCountry: business.driverCountry,
    resourceUrl: slug ? `${baseUrl}/api/p/${slug}/pay` : undefined,
  };
}

export function create(business) {
  const database = getDb();
  if (!database) throw new Error('Database not configured');
  const slug = (business.slug || '').toLowerCase().replace(/[^a-z0-9-_]/g, '');
  if (!slug) throw new Error('Invalid slug');
  database.prepare(
    `INSERT INTO businesses (slug, driver_wallet, driver_name, driver_city, driver_country, lkr_per_usdc)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    slug,
    business.driverWallet || business.driver_wallet,
    business.driverName || business.driver_name || 'Driver',
    business.driverCity || business.driver_city || 'Sri Lanka',
    business.driverCountry || business.driver_country || 'Sri Lanka',
    business.lkrPerUsdc ?? business.lkr_per_usdc ?? 300
  );
  return getBySlug(slug);
}

export function list() {
  const database = getDb();
  if (!database) return [];
  const rows = database.prepare(
    'SELECT slug, driver_wallet AS driverWallet, driver_name AS driverName, lkr_per_usdc AS lkrPerUsdc FROM businesses ORDER BY slug'
  ).all();
  return rows;
}
