import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as paymentService from './lib/payment/service.js';
import { registerProvider } from './lib/payment/provider.js';
import { MockProvider } from './lib/payment/providers/mock.js';
import { createTestPayment } from './lib/payment/test-payer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4021;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Payment providers
registerProvider('mock', new MockProvider());

let coinbaseProviderLoaded = false;
async function ensureCoinbaseProvider() {
  if (coinbaseProviderLoaded) return;
  try {
    const { X402CoinbaseProvider } = await import('./lib/payment/providers/x402-coinbase.js');
    const p = new X402CoinbaseProvider();
    registerProvider('x402-coinbase', p);
    registerProvider('coinbase', p);
    coinbaseProviderLoaded = true;
  } catch (error) {
    console.warn('⚠️  Coinbase provider not available:', error.message);
  }
}
await ensureCoinbaseProvider();

// Base payment config (provider settings shared across all tenants)
const basePaymentConfig = {
  x402Mode:      process.env.X402_MODE === 'coinbase' ? 'x402-coinbase' : (process.env.X402_MODE || 'mock'),
  baseUrl:       BASE_URL,
  facilitatorUrl: process.env.FACILITATOR_URL,
  network:       process.env.NETWORK || 'eip155:84532',
};

// Shared pay handler
async function handlePay(req, res, config) {
  if (config.x402Mode === 'x402-coinbase' || config.x402Mode === 'coinbase') {
    await ensureCoinbaseProvider();
  }
  const { amount, label } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  const labelValue = label || 'payment';
  const paymentSignatureHeader = req.headers['payment-signature'] || req.headers['x-payment'];

  if (!paymentSignatureHeader) {
    const result = await paymentService.requestPayment(amount, labelValue, config);
    if (result.status === 'challenge') {
      const challengeBase64 = Buffer.from(JSON.stringify(result.challengeData)).toString('base64');
      res.status(402);
      res.set('PAYMENT-REQUIRED', challengeBase64);
      return res.json(result.challengeData);
    }
    return res.json({ success: true, transaction: result.proof.transaction, network: result.proof.network, amount });
  }

  try {
    const paymentData = JSON.parse(Buffer.from(paymentSignatureHeader, 'base64').toString('utf-8'));
    const challengeResult = await paymentService.requestPayment(amount, labelValue, config);
    if (challengeResult.status !== 'challenge') {
      return res.json({ success: true, transaction: challengeResult.proof.transaction, network: challengeResult.proof.network, amount });
    }
    const settlementResult = await paymentService.processPayment(
      amount, labelValue, challengeResult.challengeData, paymentData, config
    );
    if (settlementResult.status === 'settled') {
      res.set('PAYMENT-RESPONSE', Buffer.from(JSON.stringify(settlementResult.proof)).toString('base64'));
      return res.json({ success: true, transaction: settlementResult.proof.transaction, network: settlementResult.proof.network, amount });
    }
    return res.status(500).json({ error: 'Unexpected payment state' });
  } catch (paymentError) {
    console.error('Payment processing error:', paymentError);
    return res.status(402).json({ error: 'Payment Processing Error', message: paymentError.message || 'Failed to process payment' });
  }
}

// Multi-tenant routes
let multiTenantEnabled = false;
try {
  const { getDb } = await import('./lib/db.js');
  const { getBySlug, businessToPaymentConfig, create: createBusiness, list: listBusinesses } = await import('./lib/businesses.js');
  const { seedDefaultTenant } = await import('./lib/seed.js');

  if (process.env.DATABASE_PATH || process.env.MULTI_TENANT === '1') {
    getDb();
    seedDefaultTenant();
    multiTenantEnabled = true;

    // Per-tenant config + pay routes
    const slugRouter = express.Router({ mergeParams: true });

    slugRouter.get('/config', (req, res) => {
      const business = getBySlug(req.params.slug);
      if (!business) return res.status(404).json({ error: 'Not found' });
      const config = businessToPaymentConfig(business, basePaymentConfig, req.params.slug);
      res.json({
        sellerName:  config.sellerName,
        serviceName: config.serviceName,
        city:        config.city,
        country:     config.country,
        description: config.description,
        phone:       config.phone,
        whatsapp:    config.whatsapp,
        lkrPerUsdc:  config.lkrPerUsdc,
        driverWallet: config.driverWallet,
        network:     config.network,
      });
    });

    slugRouter.post('/pay', async (req, res) => {
      const business = getBySlug(req.params.slug);
      if (!business) return res.status(404).json({ error: 'Not found' });
      const config = businessToPaymentConfig(business, basePaymentConfig, req.params.slug);
      try {
        await handlePay(req, res, config);
      } catch (err) {
        console.error('Pay error:', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
      }
    });

    // Dev-only: server-side test payment for a tenant (requires TEST_PRIVATE_KEY)
    slugRouter.post('/test-pay', async (req, res) => {
      if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
      }
      const testPrivateKey = process.env.TEST_PRIVATE_KEY;
      if (!testPrivateKey) {
        return res.status(501).json({ error: 'Test mode disabled', message: 'TEST_PRIVATE_KEY not configured' });
      }
      const business = getBySlug(req.params.slug);
      if (!business) return res.status(404).json({ error: 'Not found' });
      const config = businessToPaymentConfig(business, basePaymentConfig, req.params.slug);
      if (config.x402Mode === 'x402-coinbase' || config.x402Mode === 'coinbase') {
        await ensureCoinbaseProvider();
      }
      try {
        const { amount, label } = req.body;
        if (typeof amount !== 'number' || amount <= 0) {
          return res.status(400).json({ error: 'Invalid amount' });
        }
        const labelValue = label || 'test_payment';
        const challengeResult = await paymentService.requestPayment(amount, labelValue, config);
        if (challengeResult.status !== 'challenge') {
          return res.json({ success: true, transaction: challengeResult.proof.transaction, network: challengeResult.proof.network, amount });
        }
        const paymentPayload = await createTestPayment(challengeResult.challengeData, testPrivateKey);
        const settlementResult = await paymentService.processPayment(amount, labelValue, challengeResult.challengeData, paymentPayload, config);
        if (settlementResult.status === 'settled') {
          return res.json({ success: true, transaction: settlementResult.proof.transaction, network: settlementResult.proof.network, amount });
        }
        return res.status(500).json({ error: 'Unexpected payment state' });
      } catch (error) {
        console.error('Test payment error:', error);
        res.status(500).json({ error: 'Test Payment Failed', message: error.message });
      }
    });

    app.use('/api/p/:slug', slugRouter);

    // Tenant storefront page
    app.get('/p/:slug', (req, res) => {
      if (getBySlug(req.params.slug)) {
        res.sendFile(join(__dirname, 'public', 'tenant.html'));
      } else {
        res.status(404).send('No storefront found for this link.');
      }
    });

    // Business registration (public when ADMIN_SECRET is not set)
    app.post('/api/businesses', (req, res) => {
      const secret = process.env.ADMIN_SECRET;
      if (secret && req.headers['x-admin-secret'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      try {
        const business = createBusiness(req.body);
        res.status(201).json({ slug: business.slug, name: business.name, url: `/p/${business.slug}` });
      } catch (err) {
        const isDuplicate = err.message && err.message.includes('UNIQUE constraint');
        res.status(isDuplicate ? 409 : 400).json({ error: isDuplicate ? 'Slug already taken' : 'Bad request', message: err.message });
      }
    });

    app.get('/api/businesses', (req, res) => {
      const secret = process.env.ADMIN_SECRET;
      if (secret && req.headers['x-admin-secret'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json(listBusinesses());
    });

    // Slug availability check
    app.get('/api/available/:slug', (req, res) => {
      const slug = req.params.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (!slug) return res.json({ available: false, reason: 'Invalid slug' });
      res.json({ available: !getBySlug(slug), slug });
    });
  }
} catch (err) {
  if (process.env.DATABASE_PATH || process.env.MULTI_TENANT === '1') {
    console.warn('Multi-tenant mode requested but DB not available:', err.message);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', multiTenant: multiTenantEnabled });
});

if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at ${BASE_URL}`);
    console.log(`💳 Payment mode: ${basePaymentConfig.x402Mode}`);
    if (multiTenantEnabled) console.log(`🏪 Multi-tenant mode active — register at ${BASE_URL}/`);
  });
}

export default app;
