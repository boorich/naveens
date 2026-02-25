/**
 * Seeds the default example tenant (Naveen) on first boot.
 * Only inserts if the slug does not already exist.
 * Values fall back to env vars so the self-hosted demo still works.
 */

import { getBySlug, create } from './businesses.js';

export function seedDefaultTenant() {
  if (getBySlug('naveen')) return; // already exists

  const wallet = process.env.DRIVER_USDC_WALLET || '0x0000000000000000000000000000000000000000';
  create({
    slug:        'naveen',
    wallet,
    name:        process.env.DRIVER_NAME    || 'Naveen',
    city:        process.env.DRIVER_CITY    || 'Batticaloa',
    country:     process.env.DRIVER_COUNTRY || 'Sri Lanka',
    lkrPerUsdc:  parseFloat(process.env.LKR_PER_USDC || '300'),
    serviceName: 'TukTuk Service',
    description: 'Settle your ride in USDC. Naveen receives it directly.',
    phone:       process.env.DRIVER_PHONE    || '',
    whatsapp:    process.env.DRIVER_WHATSAPP || '',
  });

  console.log('🌱 Seeded default tenant: /p/naveen');
}
