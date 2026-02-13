import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as paymentService from './lib/payment/service.js';
import { registerProvider, getProvider } from './lib/payment/provider.js';
import { MockProvider } from './lib/payment/providers/mock.js';
// Lazy import coinbase provider - only load if needed (x402 packages may not be available)
import { createTestPayment } from './lib/payment/test-payer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4021;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Initialize payment providers
registerProvider('mock', new MockProvider());

// Lazy load coinbase provider (only if x402 packages are available)
let coinbaseProviderLoaded = false;
async function ensureCoinbaseProvider() {
  if (coinbaseProviderLoaded) {
    return;
  }
  
  try {
    const { X402CoinbaseProvider } = await import('./lib/payment/providers/x402-coinbase.js');
    const coinbaseProvider = new X402CoinbaseProvider();
    registerProvider('x402-coinbase', coinbaseProvider);
    registerProvider('coinbase', coinbaseProvider); // Legacy name mapping
    coinbaseProviderLoaded = true;
  } catch (error) {
    console.warn('⚠️  Coinbase provider not available (x402 packages may not be installed):', error.message);
    console.warn('   Using mock provider only. Set X402_MODE=mock or install x402 packages.');
    coinbaseProviderLoaded = false;
  }
}

// Try to load coinbase provider immediately (will fail gracefully if packages not available)
await ensureCoinbaseProvider();

// Config for payment service (single-tenant / self-hosted)
const paymentConfig = {
  x402Mode: process.env.X402_MODE === 'coinbase' ? 'x402-coinbase' : (process.env.X402_MODE || 'mock'),
  baseUrl: BASE_URL,
  driverWallet: process.env.DRIVER_USDC_WALLET || '0x0000000000000000000000000000000000000000',
  lkrPerUsdc: parseFloat(process.env.LKR_PER_USDC || '300'),
  facilitatorUrl: process.env.FACILITATOR_URL,
  network: process.env.NETWORK || 'eip155:84532',
};

function sendConfig(res, config) {
  res.json({
    lkrPerUsdc: config.lkrPerUsdc,
    driverName: config.driverName ?? process.env.DRIVER_NAME ?? 'Driver',
    driverCity: config.driverCity ?? process.env.DRIVER_CITY ?? 'Sri Lanka',
    driverCountry: config.driverCountry ?? process.env.DRIVER_COUNTRY ?? 'Sri Lanka',
    driverWallet: config.driverWallet,
    network: config.network,
  });
}

// API endpoint to get config (non-sensitive values for client)
app.get('/api/config', (req, res) => {
  sendConfig(res, paymentConfig);
});

// Shared pay handler: runs payment flow with the given config
async function handlePay(req, res, config) {
  if (config.x402Mode === 'x402-coinbase' || config.x402Mode === 'coinbase') {
    await ensureCoinbaseProvider();
  }
  const { amount, label } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  const labelValue = label || 'ride_payment';
  const paymentSignatureHeader = req.headers['payment-signature'] || req.headers['x-payment'];

  if (!paymentSignatureHeader) {
    const result = await paymentService.requestPayment(amount, labelValue, config);
    if (result.status === 'challenge') {
      const challengeBase64 = Buffer.from(JSON.stringify(result.challengeData)).toString('base64');
      res.status(402);
      res.set('PAYMENT-REQUIRED', challengeBase64);
      return res.json(result.challengeData);
    }
    return res.json({
      success: true,
      transaction: result.proof.transaction,
      network: result.proof.network,
      amount,
    });
  }

  try {
    const paymentData = JSON.parse(Buffer.from(paymentSignatureHeader, 'base64').toString('utf-8'));
    const challengeResult = await paymentService.requestPayment(amount, labelValue, config);
    if (challengeResult.status !== 'challenge') {
      return res.json({
        success: true,
        transaction: challengeResult.proof.transaction,
        network: challengeResult.proof.network,
        amount,
      });
    }
    const settlementResult = await paymentService.processPayment(
      amount, labelValue, challengeResult.challengeData, paymentData, config
    );
    if (settlementResult.status === 'settled') {
      res.set('PAYMENT-RESPONSE', Buffer.from(JSON.stringify(settlementResult.proof)).toString('base64'));
      return res.json({
        success: true,
        transaction: settlementResult.proof.transaction,
        network: settlementResult.proof.network,
        amount,
      });
    }
    return res.status(500).json({ error: 'Unexpected payment state' });
  } catch (paymentError) {
    console.error('Payment processing error:', paymentError);
    return res.status(402).json({
      error: 'Payment Processing Error',
      message: paymentError.message || 'Failed to process payment',
    });
  }
}

// Payment endpoint
app.post('/api/pay', async (req, res) => {
  try {
    await handlePay(req, res, paymentConfig);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Test payment endpoint - server acts as payer for testing (only single-tenant)
app.post('/api/test-pay', async (req, res) => {
  if (paymentConfig.x402Mode === 'x402-coinbase' || paymentConfig.x402Mode === 'coinbase') {
    await ensureCoinbaseProvider();
  }
  const testPrivateKey = process.env.TEST_PRIVATE_KEY;
  if (!testPrivateKey) {
    return res.status(501).json({ error: 'Test mode disabled', message: 'TEST_PRIVATE_KEY not configured' });
  }
  try {
    const { amount, label } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const labelValue = label || 'test_ride_payment';
    const challengeResult = await paymentService.requestPayment(amount, labelValue, paymentConfig);
    if (challengeResult.status !== 'challenge') {
      return res.json({
        success: true,
        transaction: challengeResult.proof.transaction,
        network: challengeResult.proof.network,
        amount,
      });
    }
    const paymentPayload = await createTestPayment(challengeResult.challengeData, testPrivateKey);
    const settlementResult = await paymentService.processPayment(
      amount, labelValue, challengeResult.challengeData, paymentPayload, paymentConfig
    );
    if (settlementResult.status === 'settled') {
      return res.json({
        success: true,
        transaction: settlementResult.proof.transaction,
        network: settlementResult.proof.network,
        amount,
      });
    }
    return res.status(500).json({ error: 'Unexpected payment state' });
  } catch (error) {
    console.error('Test payment error:', error);
    res.status(500).json({
      error: 'Test Payment Failed',
      message: error.message || 'Failed to process test payment',
      details: error.toString(),
    });
  }
});

// ----- Multi-tenant (community) mode: /p/:slug and /api/p/:slug/*
let multiTenantEnabled = false;
try {
  const { getDb } = await import('./lib/db.js');
  const { getBySlug, businessToPaymentConfig, create: createBusiness, list: listBusinesses } = await import('./lib/businesses.js');
  if (process.env.DATABASE_PATH || process.env.MULTI_TENANT === '1') {
    getDb();
    multiTenantEnabled = true;

    const slugRouter = express.Router({ mergeParams: true });
    slugRouter.get('/config', (req, res) => {
      const slug = req.params.slug;
      const business = getBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: 'Not found', message: 'No business for this slug' });
      }
      const config = businessToPaymentConfig(business, paymentConfig, slug);
      sendConfig(res, config);
    });
    slugRouter.post('/pay', async (req, res) => {
      const slug = req.params.slug;
      const business = getBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: 'Not found', message: 'No business for this slug' });
      }
      const config = businessToPaymentConfig(business, paymentConfig, slug);
      try {
        await handlePay(req, res, config);
      } catch (err) {
        console.error('API error (slug pay):', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
      }
    });
    app.use('/api/p/:slug', slugRouter);

    // Payment page for a business: same UI, API base is /api/p/:slug
    app.get('/p/:slug', (req, res) => {
      if (getBySlug(req.params.slug)) {
        res.sendFile(join(__dirname, 'public', 'index.html'));
      } else {
        res.status(404).send('Not found');
      }
    });

    // Register a new business (optional; protect with ADMIN_SECRET in production)
    app.post('/api/businesses', (req, res) => {
      const secret = process.env.ADMIN_SECRET;
      if (secret && req.headers['x-admin-secret'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      try {
        const business = createBusiness(req.body);
        res.status(201).json({ slug: business.slug, driverName: business.driverName });
      } catch (err) {
        res.status(400).json({ error: 'Bad request', message: err.message });
      }
    });
    app.get('/api/businesses', (req, res) => {
      const secret = process.env.ADMIN_SECRET;
      if (secret && req.headers['x-admin-secret'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json(listBusinesses());
    });
  }
} catch (err) {
  if (process.env.DATABASE_PATH || process.env.MULTI_TENANT === '1') {
    console.warn('Multi-tenant mode requested but DB not available:', err.message);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', multiTenant: multiTenantEnabled });
});

// Start server (only if not running on Vercel)
// Vercel uses serverless functions, so we don't need to listen on a port
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at ${BASE_URL}`);
    console.log(`📱 Payment mode: ${paymentConfig.x402Mode}`);
  });
}

// Export for Vercel serverless functions
export default app;
