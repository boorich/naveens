import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import QRCode from 'qrcode';

// Workaround: the pre-built x402 bundle manually sets Content-Length headers
// with string.length rather than Buffer.byteLength. Node 18+ undici strictly
// validates this and throws UND_ERR_REQ_CONTENT_LENGTH_MISMATCH.
// Strip manual Content-Length and let undici calculate the correct value.
if (typeof globalThis.fetch !== 'undefined') {
  const _nativeFetch = globalThis.fetch;
  globalThis.fetch = (url, init = {}) => {
    if (init?.body && typeof init.body === 'string') {
      // undici on Node 22 miscalculates Content-Length for string bodies
      // (uses string.length instead of Buffer.byteLength). Converting to
      // Buffer gives undici an exact byte count, eliminating the mismatch.
      const buf = Buffer.from(init.body, 'utf8');
      const h = new Headers(init.headers || {});
      h.delete('content-length');
      init = { ...init, headers: h, body: buf };
    } else if (init?.headers) {
      const h = new Headers(init.headers);
      h.delete('content-length');
      init = { ...init, headers: h };
    }
    return _nativeFetch(url, init);
  };
}
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
  x402Mode:         process.env.X402_MODE === 'coinbase' ? 'x402-coinbase' : (process.env.X402_MODE || 'mock'),
  baseUrl:          BASE_URL,
  facilitatorUrl:   process.env.FACILITATOR_URL,
  network:          process.env.NETWORK || 'eip155:84532',
  platformFeeBps:   parseInt(process.env.PLATFORM_FEE_BPS  || '100', 10),
  platformFeeWallet: process.env.PLATFORM_FEE_WALLET || '',
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
  const {
    getBySlug, businessToPaymentConfig,
    create: createBusiness, list: listBusinesses,
    setAvailability, recordTransaction, updateTransactionFee,
    deleteBySlug, listTransactionsBySlug,
    listProducts, createProduct, deleteProduct,
  } = await import('./lib/businesses.js');
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
        sellerName:        config.sellerName,
        serviceName:       config.serviceName,
        city:              config.city,
        country:           config.country,
        description:       config.description,
        phone:             config.phone,
        whatsapp:          config.whatsapp,
        lkrPerUsdc:        config.lkrPerUsdc,
        driverWallet:      config.driverWallet,
        network:           config.network,
        isAvailable:       config.isAvailable,
        platformFeeBps:    config.platformFeeBps,
        platformFeeWallet: config.platformFeeWallet,
      });
    });

    slugRouter.patch('/availability', (req, res) => {
      const { available, token } = req.body;
      if (typeof available !== 'boolean' || !token) {
        return res.status(400).json({ error: 'available (bool) and token required' });
      }
      try {
        const updated = setAvailability(req.params.slug, token, available);
        res.json({ slug: updated.slug, isAvailable: updated.isAvailable !== 0 });
      } catch (err) {
        const status = err.message === 'Invalid token' ? 403 : err.message === 'Not found' ? 404 : 400;
        res.status(status).json({ error: err.message });
      }
    });

    slugRouter.post('/record-transaction', (req, res) => {
      const { vendorAmount, feeAmount, vendorTx, feeTx, feeStatus } = req.body;
      if (!vendorAmount) return res.status(400).json({ error: 'vendorAmount required' });
      const id = recordTransaction({
        slug: req.params.slug, vendorAmount, feeAmount, vendorTx, feeTx, feeStatus,
      });
      res.json({ id });
    });

    slugRouter.patch('/record-transaction/:id/fee', (req, res) => {
      const { feeTx, feeStatus } = req.body;
      updateTransactionFee(parseInt(req.params.id, 10), feeTx, feeStatus || 'settled');
      res.json({ ok: true });
    });

    // Merchant self-service: view own transactions using manage token
    slugRouter.get('/my-transactions', (req, res) => {
      const token    = req.headers['x-manage-token'] || req.query.token;
      const business = getBySlug(req.params.slug);
      if (!business) return res.status(404).json({ error: 'Not found' });
      if (!token || token !== business.manageToken) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      res.json(listTransactionsBySlug(req.params.slug));
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

    // ── Register products (vendor-only, manage-token-gated) ──────────────────
    slugRouter.get('/products', (req, res) => {
      const token    = req.headers['x-manage-token'] || req.query.token;
      const business = getBySlug(req.params.slug);
      if (!business) return res.status(404).json({ error: 'Not found' });
      if (!token || token !== business.manageToken) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      res.json(listProducts(req.params.slug));
    });

    slugRouter.post('/products', (req, res) => {
      const token    = req.headers['x-manage-token'] || req.query.token;
      const business = getBySlug(req.params.slug);
      if (!business) return res.status(404).json({ error: 'Not found' });
      if (!token || token !== business.manageToken) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      const { name, lkrPrice } = req.body;
      if (!name || !lkrPrice || lkrPrice <= 0) {
        return res.status(400).json({ error: 'name and lkrPrice required' });
      }
      const product = createProduct(req.params.slug, name, parseInt(lkrPrice, 10));
      res.status(201).json(product);
    });

    slugRouter.delete('/products/:id', (req, res) => {
      const token    = req.headers['x-manage-token'] || req.query.token;
      const business = getBySlug(req.params.slug);
      if (!business) return res.status(404).json({ error: 'Not found' });
      if (!token || token !== business.manageToken) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      deleteProduct(parseInt(req.params.id, 10), req.params.slug);
      res.json({ ok: true });
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

    // QR code for tenant page — ?lkr=X encodes a payment-request URL
    app.get('/api/p/:slug/qr', async (req, res) => {
      const business = getBySlug(req.params.slug);
      if (!business) return res.status(404).json({ error: 'Not found' });
      const lkr      = req.query.lkr ? parseInt(req.query.lkr, 10) : null;
      const cartParam = req.query.cart ? `&cart=${encodeURIComponent(req.query.cart)}` : '';
      const url  = lkr && lkr > 0
        ? `${BASE_URL}/p/${req.params.slug}?lkr=${lkr}${cartParam}`
        : `${BASE_URL}/p/${req.params.slug}`;
      try {
        const buf = await QRCode.toBuffer(url, { type: 'png', width: 512, margin: 2 });
        res.set('Content-Type', 'image/png');
        if (!lkr) res.set('Content-Disposition', `attachment; filename="${req.params.slug}-qr.png"`);
        res.send(buf);
      } catch (err) {
        res.status(500).json({ error: 'QR generation failed' });
      }
    });

    // Platform fee endpoint — accepts payment to PLATFORM_FEE_WALLET
    app.post('/api/platform/fee', async (req, res) => {
      const feeWallet = process.env.PLATFORM_FEE_WALLET;
      if (!feeWallet) return res.status(503).json({ error: 'Platform fee not configured' });
      const feeConfig = {
        ...basePaymentConfig,
        driverWallet: feeWallet,
        resourceUrl:  `${BASE_URL}/api/platform/fee`,
      };
      try {
        await handlePay(req, res, feeConfig);
      } catch (err) {
        res.status(500).json({ error: 'Fee payment failed', message: err.message });
      }
    });

    // Business registration (public when ADMIN_SECRET is not set)
    app.post('/api/businesses', (req, res) => {
      // Public endpoint — anyone can register a storefront.
      // ADMIN_SECRET protects admin-only operations (list, delete, admin page), not registration.
      try {
        const business = createBusiness(req.body);
        res.status(201).json({
          slug:        business.slug,
          name:        business.name,
          url:         `/p/${business.slug}`,
          manageToken: business.manageToken,
        });
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

    app.get('/api/businesses/:slug/transactions', (req, res) => {
      const secret = process.env.ADMIN_SECRET;
      if (secret && req.headers['x-admin-secret'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json(listTransactionsBySlug(req.params.slug));
    });

    app.delete('/api/businesses/:slug', (req, res) => {
      const secret = process.env.ADMIN_SECRET;
      if (secret && req.headers['x-admin-secret'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      try {
        deleteBySlug(req.params.slug);
        res.json({ deleted: req.params.slug });
      } catch (err) {
        const status = err.message === 'Not found' ? 404 : 400;
        res.status(status).json({ error: err.message });
      }
    });

    // Slug availability check
    app.get('/api/available/:slug', (req, res) => {
      const slug = req.params.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (!slug) return res.json({ available: false, reason: 'Invalid slug' });
      res.json({ available: !getBySlug(slug), slug });
    });

    // Admin page (protected by ADMIN_SECRET query param or header)
    app.get('/admin', (req, res) => {
      const secret = process.env.ADMIN_SECRET;
      const provided = req.query.secret || req.headers['x-admin-secret'];
      if (secret && provided !== secret) {
        return res.status(401).send('<h2>Unauthorized — pass ?secret=YOUR_ADMIN_SECRET</h2>');
      }
      const businesses = listBusinesses();
      const rows = businesses.map(b => `
        <tr>
          <td><a href="/p/${b.slug}" target="_blank">${b.slug}</a></td>
          <td>${b.name}</td>
          <td>${b.serviceName || ''}</td>
          <td>${b.city || ''}</td>
          <td title="${b.wallet}">${b.wallet ? b.wallet.slice(0, 8) + '…' + b.wallet.slice(-6) : ''}</td>
          <td style="text-align:center">${b.isAvailable ? '✅' : '⛔'}</td>
          <td>${(b.createdAt || '').slice(0, 10)}</td>
          <td><code style="font-size:0.75rem;word-break:break-all;user-select:all;">${b.manageToken || ''}</code></td>
          <td style="white-space:nowrap;">
            <a href="/api/p/${b.slug}/qr" target="_blank" title="Download QR" style="margin-right:12px;">⬇ QR</a>
            <button class="txs-btn" data-slug="${b.slug}" title="View transactions" style="margin-right:8px;">📋 Txs</button>
            <button class="delete-btn" data-slug="${b.slug}" title="Delete storefront">🗑 Delete</button>
          </td>
        </tr>`).join('');
      res.set('Content-Type', 'text/html');
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Naveen's — Admin</title>
  <style>
    :root { --green:#1a3d2b; --gold:#c9a84c; --bg:#f5f2eb; --red:#b91c1c; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Inter,sans-serif; background:var(--bg); color:#222; padding:2rem; }
    h1 { font-family:'Playfair Display',serif; color:var(--green); margin-bottom:1.5rem; }
    table { width:100%; border-collapse:collapse; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    th { background:var(--green); color:#fff; padding:.75rem 1rem; text-align:left; font-size:.8rem; text-transform:uppercase; letter-spacing:.05em; }
    td { padding:.75rem 1rem; border-bottom:1px solid #eee; font-size:.9rem; vertical-align:middle; }
    tr:last-child td { border-bottom:none; }
    tr:hover td { background:#faf8f3; }
    a { color:var(--green); text-decoration:none; }
    a:hover { text-decoration:underline; }
    .count { color:#666; font-size:.9rem; margin-bottom:1rem; }

    .txs-btn {
      background:none; border:1px solid #a5b4fc; color:#3730a3;
      border-radius:4px; padding:4px 10px; font-size:.8rem; cursor:pointer;
      font-family:Inter,sans-serif; transition:background .15s;
    }
    .txs-btn:hover { background:#eef2ff; }

    .delete-btn {
      background:none; border:1px solid #fca5a5; color:var(--red);
      border-radius:4px; padding:4px 10px; font-size:.8rem; cursor:pointer;
      font-family:Inter,sans-serif; transition:background .15s;
    }
    .delete-btn:hover { background:#fee2e2; }

    /* Transactions modal */
    #txs-overlay {
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,.55); z-index:100;
      align-items:center; justify-content:center; padding:20px;
    }
    #txs-overlay.open { display:flex; }
    #txs-modal {
      background:#fff; border-radius:10px; padding:28px 24px;
      max-width:780px; width:100%; box-shadow:0 8px 32px rgba(0,0,0,.18);
      max-height:80vh; display:flex; flex-direction:column;
    }
    #txs-modal-header {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:16px; flex-shrink:0;
    }
    #txs-modal-header h2 { font-size:1.1rem; color:var(--green); }
    #txs-close-btn {
      background:none; border:none; font-size:1.4rem; cursor:pointer;
      color:#666; line-height:1; padding:2px 6px; border-radius:4px;
    }
    #txs-close-btn:hover { background:#f3f4f6; }
    #txs-body { overflow-y:auto; flex:1; }
    #txs-body table { width:100%; border-collapse:collapse; font-size:.85rem; }
    #txs-body th {
      background:var(--green); color:#fff; padding:8px 10px;
      text-align:left; font-size:.75rem; text-transform:uppercase;
      letter-spacing:.04em; position:sticky; top:0;
    }
    #txs-body td { padding:8px 10px; border-bottom:1px solid #eee; vertical-align:middle; }
    #txs-body tr:last-child td { border-bottom:none; }
    #txs-body tr:hover td { background:#faf8f3; }
    #txs-body a { color:var(--green); font-family:monospace; font-size:.8rem; }
    .fee-settled { color:#166534; font-weight:600; }
    .fee-pending { color:#92400e; }
    .fee-none    { color:#9ca3af; }
    #txs-empty { text-align:center; padding:32px; color:#9ca3af; font-size:.9rem; }
    #txs-loading { text-align:center; padding:32px; color:#9ca3af; }

    /* Modal overlay */
    #del-overlay {
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,.55); z-index:100;
      align-items:center; justify-content:center; padding:20px;
    }
    #del-overlay.open { display:flex; }
    #del-modal {
      background:#fff; border-radius:10px; padding:28px 24px;
      max-width:420px; width:100%; box-shadow:0 8px 32px rgba(0,0,0,.18);
    }
    #del-modal h2 { font-size:1.1rem; color:var(--red); margin-bottom:8px; }
    #del-modal p { font-size:.9rem; color:#555; margin-bottom:16px; line-height:1.5; }
    #del-modal code {
      background:#f3f4f6; border-radius:4px; padding:2px 6px;
      font-size:.9rem; color:#111; font-weight:600;
    }
    #del-confirm-input {
      width:100%; padding:10px 12px; border:1.5px solid #d1d5db;
      border-radius:6px; font-size:.95rem; font-family:monospace;
      margin-bottom:16px; outline:none; transition:border-color .15s;
    }
    #del-confirm-input:focus { border-color:var(--red); }
    .del-actions { display:flex; gap:10px; justify-content:flex-end; }
    #del-confirm-btn {
      background:var(--red); color:#fff; border:none; border-radius:6px;
      padding:9px 20px; font-size:.9rem; font-weight:600; cursor:pointer;
      font-family:Inter,sans-serif; opacity:.4; pointer-events:none; transition:opacity .15s;
    }
    #del-confirm-btn.ready { opacity:1; pointer-events:auto; }
    #del-cancel-btn {
      background:#f3f4f6; color:#333; border:none; border-radius:6px;
      padding:9px 20px; font-size:.9rem; cursor:pointer; font-family:Inter,sans-serif;
    }
    #del-cancel-btn:hover { background:#e5e7eb; }
    #del-error { color:var(--red); font-size:.85rem; margin-top:8px; display:none; }
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <h1>Naveen's — Storefront Admin</h1>
  <p class="count">${businesses.length} registered storefront${businesses.length !== 1 ? 's' : ''}</p>
  <table>
    <thead>
      <tr>
        <th>Slug</th><th>Name</th><th>Service</th><th>City</th>
        <th>Wallet</th><th>Available</th><th>Created</th><th>Manage Token</th><th>Actions</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <!-- Transactions modal -->
  <div id="txs-overlay">
    <div id="txs-modal">
      <div id="txs-modal-header">
        <h2 id="txs-modal-title">Transactions</h2>
        <button id="txs-close-btn" title="Close">×</button>
      </div>
      <div id="txs-body">
        <div id="txs-loading">Loading…</div>
      </div>
    </div>
  </div>

  <!-- Delete confirmation modal -->
  <div id="del-overlay">
    <div id="del-modal">
      <h2>Delete storefront</h2>
      <p>This will permanently remove the storefront and all its transactions. To confirm, type the slug <code id="del-slug-label"></code> below.</p>
      <input id="del-confirm-input" type="text" placeholder="Type the slug to confirm" autocomplete="off" spellcheck="false">
      <div id="del-error"></div>
      <div class="del-actions">
        <button id="del-cancel-btn">Cancel</button>
        <button id="del-confirm-btn">Delete permanently</button>
      </div>
    </div>
  </div>

  <script>
    // ── Transactions modal ──────────────────────────────────────────────────
    const txsOverlay  = document.getElementById('txs-overlay');
    const txsTitle    = document.getElementById('txs-modal-title');
    const txsBody     = document.getElementById('txs-body');
    const txsCloseBtn = document.getElementById('txs-close-btn');
    const adminSecret = new URLSearchParams(window.location.search).get('secret') || '';

    document.querySelectorAll('.txs-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const slug = btn.dataset.slug;
        txsTitle.textContent = slug + ' — Transactions';
        txsBody.innerHTML = '<div id="txs-loading">Loading…</div>';
        txsOverlay.classList.add('open');

        try {
          const res = await fetch('/api/businesses/' + encodeURIComponent(slug) + '/transactions',
            adminSecret ? { headers: { 'x-admin-secret': adminSecret } } : {}
          );
          const txs = await res.json();

          if (!txs.length) {
            txsBody.innerHTML = '<div id="txs-empty">No transactions yet for this storefront.</div>';
            return;
          }

          const network = 'eip155:84532'; // read from page context if needed
          const scanBase = 'https://sepolia.basescan.org/tx/';

          const trs = txs.map(tx => {
            const feeClass = tx.feeStatus === 'settled' ? 'fee-settled'
                           : tx.feeStatus === 'pending' ? 'fee-pending' : 'fee-none';
            const vendorLink = tx.vendorTx
              ? '<a href="' + scanBase + tx.vendorTx + '" target="_blank" rel="noopener">'
                + tx.vendorTx.slice(0,10) + '…' + tx.vendorTx.slice(-6) + ' ↗</a>'
              : '—';
            const feeLink = tx.feeTx
              ? '<a href="' + scanBase + tx.feeTx + '" target="_blank" rel="noopener">'
                + tx.feeTx.slice(0,10) + '…' + tx.feeTx.slice(-6) + ' ↗</a>'
              : '—';
            return '<tr>'
              + '<td>' + tx.id + '</td>'
              + '<td>' + (tx.vendorAmount || 0).toFixed(4) + ' USDC</td>'
              + '<td>' + (tx.feeAmount || 0).toFixed(4) + ' USDC</td>'
              + '<td>' + vendorLink + '</td>'
              + '<td>' + feeLink + '</td>'
              + '<td class="' + feeClass + '">' + tx.feeStatus + '</td>'
              + '<td>' + (tx.createdAt || '').slice(0, 16).replace('T', ' ') + '</td>'
              + '</tr>';
          }).join('');

          txsBody.innerHTML = '<table>'
            + '<thead><tr>'
            + '<th>#</th><th>Vendor</th><th>Fee</th>'
            + '<th>Vendor Tx</th><th>Fee Tx</th>'
            + '<th>Fee status</th><th>Date (UTC)</th>'
            + '</tr></thead>'
            + '<tbody>' + trs + '</tbody>'
            + '</table>';
        } catch (err) {
          txsBody.innerHTML = '<div id="txs-empty">Failed to load transactions: ' + err.message + '</div>';
        }
      });
    });

    txsCloseBtn.addEventListener('click', () => txsOverlay.classList.remove('open'));
    txsOverlay.addEventListener('click', (e) => { if (e.target === txsOverlay) txsOverlay.classList.remove('open'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') txsOverlay.classList.remove('open'); });

    // ── Delete modal ────────────────────────────────────────────────────────
    const overlay    = document.getElementById('del-overlay');
    const slugLabel  = document.getElementById('del-slug-label');
    const input      = document.getElementById('del-confirm-input');
    const confirmBtn = document.getElementById('del-confirm-btn');
    const cancelBtn  = document.getElementById('del-cancel-btn');
    const errorEl    = document.getElementById('del-error');
    let targetSlug   = null;

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        targetSlug = btn.dataset.slug;
        slugLabel.textContent = targetSlug;
        input.value = '';
        errorEl.style.display = 'none';
        confirmBtn.classList.remove('ready');
        overlay.classList.add('open');
        setTimeout(() => input.focus(), 60);
      });
    });

    input.addEventListener('input', () => {
      confirmBtn.classList.toggle('ready', input.value === targetSlug);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value === targetSlug) doDelete();
      if (e.key === 'Escape') close();
    });

    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    confirmBtn.addEventListener('click', doDelete);

    function close() {
      overlay.classList.remove('open');
      targetSlug = null;
    }

    async function doDelete() {
      if (input.value !== targetSlug) return;
      confirmBtn.textContent = 'Deleting…';
      confirmBtn.classList.remove('ready');
      errorEl.style.display = 'none';
      try {
        const secret = new URLSearchParams(window.location.search).get('secret') || '';
        const res = await fetch('/api/businesses/' + encodeURIComponent(targetSlug), {
          method: 'DELETE',
          headers: secret ? { 'x-admin-secret': secret } : {},
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Delete failed');
        }
        // Remove the row from the table without a full reload
        document.querySelectorAll('.delete-btn').forEach(btn => {
          if (btn.dataset.slug === targetSlug) {
            btn.closest('tr').remove();
          }
        });
        const countEl = document.querySelector('.count');
        if (countEl) {
          const n = document.querySelectorAll('tbody tr').length;
          countEl.textContent = n + ' registered storefront' + (n !== 1 ? 's' : '');
        }
        close();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        confirmBtn.textContent = 'Delete permanently';
        confirmBtn.classList.add('ready');
      }
    }
  </script>
</body>
</html>`);
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
