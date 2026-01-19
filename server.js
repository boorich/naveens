import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { verifyMessage } from 'viem';
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

// Load config.json (editable cash register config)
const CONFIG_PATH = join(__dirname, 'config.json');
let storeConfig = null;

function loadStoreConfig() {
  try {
    if (existsSync(CONFIG_PATH)) {
      const configData = readFileSync(CONFIG_PATH, 'utf-8');
      storeConfig = JSON.parse(configData);
      return storeConfig;
    }
  } catch (error) {
    console.warn('Could not load config.json:', error);
  }
  return null;
}

function saveStoreConfig(config) {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    storeConfig = config;
    return true;
  } catch (error) {
    console.error('Could not save config.json:', error);
    return false;
  }
}

// Load initial config
loadStoreConfig();

// Middleware
app.use(express.json());

// Serve cashdesk page at root (generic config-driven cash register)
// MUST come before express.static so it takes precedence over index.html
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index-cashdesk.html'));
});

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

// Config for payment service
// Config for payment service
const paymentConfig = {
  x402Mode: process.env.X402_MODE === 'coinbase' ? 'x402-coinbase' : (process.env.X402_MODE || 'mock'),
  baseUrl: BASE_URL,
  driverWallet: (() => {
    // Use owner from config.json if available, otherwise fallback to env
    const cfg = loadStoreConfig();
    return cfg?.owner || process.env.DRIVER_USDC_WALLET || process.env.OWNER_WALLET || '0x0000000000000000000000000000000000000000';
  })(),
  lkrPerUsdc: parseFloat(process.env.LKR_PER_USDC || '300'),
  facilitatorUrl: process.env.FACILITATOR_URL,
  network: process.env.NETWORK || 'eip155:84532',
};

// API endpoint to get store config (editable cash register config)
app.get('/api/store-config', (req, res) => {
  const config = loadStoreConfig();
  if (!config) {
    return res.status(404).json({ error: 'Store config not found' });
  }
  
  // Return config (owner address is public - needed for signature verification)
  res.json(config);
});

// API endpoint to get payment config (legacy/backward compat)
app.get('/api/config', (req, res) => {
  const storeCfg = loadStoreConfig();
  const ownerWallet = storeCfg?.owner || paymentConfig.driverWallet;
  
  res.json({
    lkrPerUsdc: paymentConfig.lkrPerUsdc,
    driverName: process.env.DRIVER_NAME || 'Driver',
    driverCity: process.env.DRIVER_CITY || 'Sri Lanka',
    driverCountry: process.env.DRIVER_COUNTRY || 'Sri Lanka',
    driverWallet: ownerWallet, // Use owner from config.json or fallback to env
    network: paymentConfig.network,
  });
});

// API endpoint to verify ownership and get edit session
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { message, signature } = req.body;
    
    if (!message || !signature) {
      return res.status(400).json({ error: 'Message and signature required' });
    }
    
    const config = loadStoreConfig();
    if (!config || !config.owner) {
      return res.status(500).json({ error: 'Store config not configured - no owner set' });
    }
    
    // Check if owner is the zero address (not a valid owner)
    if (config.owner === '0x0000000000000000000000000000000000000000' || !config.owner.startsWith('0x')) {
      return res.status(400).json({ 
        error: 'Owner not set. Pay $1 USDC to claim ownership first. The payment transaction will set your address as owner on-chain.' 
      });
    }
    
    // Verify signature against owner address
    // The owner address was set from the $1 payment transaction (on-chain proof)
    // Now we just verify the signature matches that proven owner address
    try {
      const isValid = await verifyMessage({
        address: config.owner, // This is the address from the $1 payment transaction
        message: message,
        signature: signature,
      });
      
      if (!isValid) {
        return res.status(401).json({ 
          error: 'Invalid signature. The signature must match the owner address. Make sure you\'re using the private key that corresponds to the address that paid the $1 ownership fee.' 
        });
      }
      
      // Generate session token (simple timestamp-based for now)
      const sessionToken = Buffer.from(`${Date.now()}-${config.owner}`).toString('base64');
      
      res.json({
        success: true,
        sessionToken,
        expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
      });
    } catch (verifyError) {
      console.error('Signature verification error:', verifyError);
      return res.status(400).json({ error: 'Signature verification failed' });
    }
  } catch (error) {
    console.error('Auth verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to update store config (requires authenticated session)
app.post('/api/store-config/update', async (req, res) => {
  try {
    const { sessionToken, config: newConfig } = req.body;
    
    if (!sessionToken || !newConfig) {
      return res.status(400).json({ error: 'Session token and config required' });
    }
    
    // Verify session (simple check - in production use proper session management)
    const currentConfig = loadStoreConfig();
    if (!currentConfig || !currentConfig.owner) {
      return res.status(500).json({ error: 'Store config not configured' });
    }
    
    // Decode and verify session token
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      const [timestamp, owner] = decoded.split('-');
      const expiresAt = parseInt(timestamp) + (60 * 60 * 1000);
      
      if (Date.now() > expiresAt) {
        return res.status(401).json({ error: 'Session expired' });
      }
      
      if (owner !== currentConfig.owner) {
        return res.status(401).json({ error: 'Invalid session' });
      }
    } catch (sessionError) {
      return res.status(401).json({ error: 'Invalid session token' });
    }
    
    // Validate and merge config
    const updatedConfig = {
      ...currentConfig,
      ...newConfig,
      owner: currentConfig.owner, // Don't allow changing owner
    };
    
    // Save updated config
    if (saveStoreConfig(updatedConfig)) {
      res.json({
        success: true,
        config: updatedConfig,
      });
    } else {
      res.status(500).json({ error: 'Failed to save config' });
    }
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payment endpoint
app.post('/api/pay', async (req, res) => {
  try {
    // Ensure coinbase provider is loaded if needed
    if (paymentConfig.x402Mode === 'x402-coinbase' || paymentConfig.x402Mode === 'coinbase') {
      await ensureCoinbaseProvider();
    }
    
    const { amount, label } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const labelValue = label || 'ride_payment';

    // Check if payment is already provided (PAYMENT-SIGNATURE header)
    // This header is protocol-specific, but we need to check for it to support external clients
    // Express lowercases headers, so 'PAYMENT-SIGNATURE' becomes 'payment-signature'
    const paymentSignatureHeader = req.headers['payment-signature'] || 
                                   req.headers['x-payment'] ||
                                   req.headers['x-payment-signature'];
    
    if (paymentSignatureHeader) {
      console.log('Payment signature header received, length:', paymentSignatureHeader.length);
    }
    
    if (!paymentSignatureHeader) {
      // No payment provided - return challenge
      const result = await paymentService.requestPayment(amount, labelValue, paymentConfig);
      
      if (result.status === 'challenge') {
        // Return 402 with challenge data (protocol compatibility)
        const challengeJson = JSON.stringify(result.challengeData);
        const challengeBase64 = Buffer.from(challengeJson).toString('base64');
        res.status(402);
        res.set('PAYMENT-REQUIRED', challengeBase64);
        return res.json(result.challengeData);
      }
      
      // Already settled somehow (unusual, but handle it)
      return res.json({
        success: true,
        transaction: result.proof.transaction,
        network: result.proof.network,
        amount: amount,
      });
    }

    // Payment provided - process it
    try {
      // Decode payment payload from header (protocol-specific, but needed for external clients)
      let paymentData;
      try {
        paymentData = JSON.parse(
          Buffer.from(paymentSignatureHeader, 'base64').toString('utf-8')
        );
        console.log('Payment data decoded, keys:', Object.keys(paymentData || {}));
      } catch (parseError) {
        console.error('Failed to parse payment signature header:', parseError);
        return res.status(400).json({
          error: 'Invalid payment signature format',
          message: parseError.message,
        });
      }

      // Get challenge data to process payment
      console.log('Requesting payment challenge for amount:', amount, 'label:', labelValue);
      const challengeResult = await paymentService.requestPayment(amount, labelValue, paymentConfig);
      if (challengeResult.status !== 'challenge') {
        return res.json({
          success: true,
          transaction: challengeResult.proof.transaction,
          network: challengeResult.proof.network,
          amount: amount,
        });
      }

      // Process payment (verify + settle)
      console.log('Processing payment with challenge and payment data...');
      const settlementResult = await paymentService.processPayment(
        amount,
        labelValue,
        challengeResult.challengeData,
        paymentData,
        paymentConfig
      );
      console.log('Settlement result:', {
        status: settlementResult.status,
        hasProof: !!settlementResult.proof,
        transaction: settlementResult.proof?.transaction,
        payer: settlementResult.proof?.payer,
      });

      if (settlementResult.status === 'settled') {
        // First payment opt-in: If no owner is set, the first payer becomes the owner
        // Do this FIRST even if transaction is missing - payment was settled!
        const config = loadStoreConfig();
        const hasNoOwner = !config.owner || 
                          config.owner === '0x0000000000000000000000000000000000000000';
        
        if (hasNoOwner && settlementResult.proof?.payer) {
          // First payment - set payer as owner (opt-in)
          const ownerAddress = settlementResult.proof.payer;
          console.log(`🎉 First payment opt-in: ${ownerAddress} is now the owner`);
          const updatedConfig = {
            ...config,
            owner: ownerAddress,
          };
          const saved = saveStoreConfig(updatedConfig);
          if (saved) {
            console.log('✅ Owner set in config.json from first payment:', ownerAddress);
            // Verify it was saved
            const verifyConfig = loadStoreConfig();
            if (verifyConfig?.owner === ownerAddress) {
              console.log('✅ Verified: Owner saved correctly');
            } else {
              console.error('❌ WARNING: Owner save verification failed! Expected:', ownerAddress, 'Got:', verifyConfig?.owner);
            }
          } else {
            console.error('❌ Failed to save owner to config.json!');
          }
        }
        
        // Check if we have a transaction hash - but don't fail if missing
        // Payment was settled, owner was set - that's what matters
        if (!settlementResult.proof || !settlementResult.proof.transaction) {
          console.warn('⚠️  Payment settled but no transaction hash - payment succeeded, owner set if applicable');
          // Still return success since payment was processed
          return res.json({
            success: true,
            transaction: null, // Missing transaction hash
            network: settlementResult.proof?.network || 'eip155:84532',
            amount: amount,
            ownerOptIn: hasNoOwner && settlementResult.proof?.payer ? true : undefined,
            warning: 'Payment settled but transaction hash not available - check blockchain explorer or try again',
          });
        }
        
        // Return settlement (protocol compatibility)
        const settlementJson = JSON.stringify(settlementResult.proof);
        const settlementBase64 = Buffer.from(settlementJson).toString('base64');
        res.status(200);
        res.set('PAYMENT-RESPONSE', settlementBase64);
        return res.json({
          success: true,
          transaction: settlementResult.proof.transaction,
          network: settlementResult.proof.network || 'eip155:84532',
          amount: amount,
          ownerOptIn: hasNoOwner && settlementResult.proof.payer ? true : undefined,
        });
      }

      // Should not reach here
      console.error('Payment processing returned unexpected status:', settlementResult.status);
      return res.status(500).json({
        error: 'Unexpected payment state',
        status: settlementResult.status,
      });
    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      console.error('Payment error stack:', paymentError.stack);
      return res.status(402).json({
        error: 'Payment Processing Error',
        message: paymentError.message || 'Failed to process payment',
        details: paymentError.toString(),
      });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// Test payment endpoint - server acts as payer for testing
// Only works if TEST_PRIVATE_KEY is set
app.post('/api/test-pay', async (req, res) => {
  // Ensure coinbase provider is loaded if needed
  if (paymentConfig.x402Mode === 'x402-coinbase' || paymentConfig.x402Mode === 'coinbase') {
    await ensureCoinbaseProvider();
  }
  
  const testPrivateKey = process.env.TEST_PRIVATE_KEY;
  
  if (!testPrivateKey) {
    return res.status(501).json({ 
      error: 'Test mode disabled',
      message: 'TEST_PRIVATE_KEY not configured'
    });
  }

  try {
    const { amount, label } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const labelValue = label || 'test_ride_payment';

    // Get challenge from payment service (direct call, not HTTP)
    const challengeResult = await paymentService.requestPayment(amount, labelValue, paymentConfig);
    
    if (challengeResult.status !== 'challenge') {
      // Already settled somehow
      return res.json({
        success: true,
        transaction: challengeResult.proof.transaction,
        network: challengeResult.proof.network,
        amount: amount,
      });
    }

    // Create test payment using test payer utility
    const paymentPayload = await createTestPayment(challengeResult.challengeData, testPrivateKey);
    
    // Process payment through service (verify + settle)
    const settlementResult = await paymentService.processPayment(
      amount,
      labelValue,
      challengeResult.challengeData,
      paymentPayload,
      paymentConfig
    );

    if (settlementResult.status === 'settled') {
      return res.json({
        success: true,
        transaction: settlementResult.proof.transaction,
        network: settlementResult.proof.network,
        amount: amount,
      });
    }

    // Should not reach here
    return res.status(500).json({
      error: 'Unexpected payment state',
    });
  } catch (error) {
    console.error('Test payment error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({
      error: 'Test Payment Failed',
      message: error.message || 'Failed to process test payment',
      details: error.toString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
