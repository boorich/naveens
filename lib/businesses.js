/**
 * Business (tenant) records for multi-tenant mode.
 * Each business has a slug; payments under /p/:slug use that business's wallet and settings.
 */

import { getDb } from './db.js';

export function getBySlug(slug) {
  const database = getDb();
  if (!database) return null;
  const row = database.prepare(`
    SELECT
      slug,
      driver_wallet  AS wallet,
      driver_name    AS name,
      driver_city    AS city,
      driver_country AS country,
      lkr_per_usdc   AS lkrPerUsdc,
      service_name   AS serviceName,
      description,
      phone,
      whatsapp
    FROM businesses WHERE slug = ?
  `).get(slug);
  return row || null;
}

/**
 * Build payment config object from a business row (for paymentService).
 */
export function businessToPaymentConfig(business, baseConfig, slug) {
  if (!business) return null;
  const baseUrl = baseConfig.baseUrl || '';
  return {
    ...baseConfig,
    driverWallet: business.wallet,
    lkrPerUsdc: business.lkrPerUsdc,
    // Expose all tenant fields to the frontend via /config
    sellerName: business.name,
    serviceName: business.serviceName,
    city: business.city,
    country: business.country,
    description: business.description,
    phone: business.phone,
    whatsapp: business.whatsapp,
    resourceUrl: slug ? `${baseUrl}/api/p/${slug}/pay` : undefined,
  };
}

export function create(data) {
  const database = getDb();
  if (!database) throw new Error('Database not configured');
  const slug = (data.slug || '').toLowerCase().replace(/[^a-z0-9-_]/g, '');
  if (!slug) throw new Error('Invalid slug');
  database.prepare(`
    INSERT INTO businesses
      (slug, driver_wallet, driver_name, driver_city, driver_country, lkr_per_usdc, service_name, description, phone, whatsapp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    slug,
    data.wallet      || data.driverWallet  || data.driver_wallet  || '',
    data.name        || data.driverName    || data.driver_name    || 'Seller',
    data.city        || data.driverCity    || data.driver_city    || 'Sri Lanka',
    data.country     || data.driverCountry || data.driver_country || 'Sri Lanka',
    data.lkrPerUsdc  ?? data.lkr_per_usdc ?? 300,
    data.serviceName || data.service_name  || 'Service',
    data.description || '',
    data.phone       || '',
    data.whatsapp    || '',
  );
  return getBySlug(slug);
}

export function list() {
  const database = getDb();
  if (!database) return [];
  return database.prepare(`
    SELECT slug, driver_name AS name, service_name AS serviceName, driver_city AS city, lkr_per_usdc AS lkrPerUsdc
    FROM businesses ORDER BY slug
  `).all();
}
