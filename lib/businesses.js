/**
 * Business (tenant) records for multi-tenant mode.
 * Each business has a slug; payments under /p/:slug use that business's wallet and settings.
 */

import { randomBytes } from 'crypto';
import { getDb } from './db.js';

export function generateManageToken() {
  return randomBytes(16).toString('hex');
}

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
      whatsapp,
      is_available   AS isAvailable,
      manage_token   AS manageToken
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
    sellerName: business.name,
    serviceName: business.serviceName,
    city: business.city,
    country: business.country,
    description: business.description,
    phone: business.phone,
    whatsapp: business.whatsapp,
    isAvailable: business.isAvailable !== 0,
    resourceUrl: slug ? `${baseUrl}/api/p/${slug}/pay` : undefined,
  };
}

export function create(data) {
  const database = getDb();
  if (!database) throw new Error('Database not configured');
  const slug = (data.slug || '').toLowerCase().replace(/[^a-z0-9-_]/g, '');
  if (!slug) throw new Error('Invalid slug');
  const token = data.manageToken || data.manage_token || generateManageToken();
  database.prepare(`
    INSERT INTO businesses
      (slug, driver_wallet, driver_name, driver_city, driver_country, lkr_per_usdc, service_name, description, phone, whatsapp, manage_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    token,
  );
  return getBySlug(slug);
}

export function setAvailability(slug, token, available) {
  const database = getDb();
  if (!database) throw new Error('Database not configured');
  const business = getBySlug(slug);
  if (!business) throw new Error('Not found');
  if (business.manageToken !== token) throw new Error('Invalid token');
  database.prepare(`UPDATE businesses SET is_available = ? WHERE slug = ?`)
    .run(available ? 1 : 0, slug);
  return getBySlug(slug);
}

export function recordTransaction(data) {
  const database = getDb();
  if (!database) return null;
  const result = database.prepare(`
    INSERT INTO transactions (slug, vendor_amount, fee_amount, vendor_tx, fee_tx, fee_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.slug,
    data.vendorAmount,
    data.feeAmount || 0,
    data.vendorTx || null,
    data.feeTx || null,
    data.feeStatus || 'none',
  );
  return result.lastInsertRowid;
}

export function updateTransactionFee(id, feeTx, feeStatus) {
  const database = getDb();
  if (!database) return;
  database.prepare(`UPDATE transactions SET fee_tx = ?, fee_status = ? WHERE id = ?`)
    .run(feeTx, feeStatus, id);
}

export function listTransactionsBySlug(slug) {
  const database = getDb();
  if (!database) return [];
  return database.prepare(`
    SELECT id, vendor_amount AS vendorAmount, fee_amount AS feeAmount,
           vendor_tx AS vendorTx, fee_tx AS feeTx,
           fee_status AS feeStatus, created_at AS createdAt
    FROM transactions WHERE slug = ? ORDER BY created_at DESC
  `).all(slug);
}

export function deleteBySlug(slug) {
  const database = getDb();
  if (!database) throw new Error('Database not configured');
  const business = getBySlug(slug);
  if (!business) throw new Error('Not found');
  database.prepare(`DELETE FROM transactions WHERE slug = ?`).run(slug);
  database.prepare(`DELETE FROM businesses WHERE slug = ?`).run(slug);
}

export function list() {
  const database = getDb();
  if (!database) return [];
  return database.prepare(`
    SELECT slug, driver_name AS name, service_name AS serviceName,
           driver_city AS city, driver_wallet AS wallet,
           lkr_per_usdc AS lkrPerUsdc, is_available AS isAvailable,
           created_at AS createdAt
    FROM businesses ORDER BY created_at DESC
  `).all();
}
