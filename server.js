import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as paymentService from './lib/payment/service.js';
import { registerProvider, getProvider } from './lib/payment/provider.js';
import { MockProvider } from './lib/payment/providers/mock.js';
import { X402CoinbaseProvider } from './lib/payment/providers/x402-coinbase.js';
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
registerProvider('x402-coinbase', new X402CoinbaseProvider());
// Legacy name mapping for backward compatibility (coinbase → x402-coinbase)
const coinbaseProvider = getProvider('x402-coinbase');
registerProvider('coinbase', coinbaseProvider);

// Config for payment service
const paymentConfig = {
  x402Mode: process.env.X402_MODE === 'coinbase' ? 'x402-coinbase' : (process.env.X402_MODE || 'mock'),
  baseUrl: BASE_URL,
  driverWallet: process.env.DRIVER_USDC_WALLET || '0x0000000000000000000000000000000000000000',
  lkrPerUsdc: parseFloat(process.env.LKR_PER_USDC || '300'),
  facilitatorUrl: process.env.FACILITATOR_URL,
  network: process.env.NETWORK || 'eip155:84532',
};

// API endpoint to get config (non-sensitive values for client)
app.get('/api/config', (req, res) => {
  res.json({
    lkrPerUsdc: paymentConfig.lkrPerUsdc,
    driverName: process.env.DRIVER_NAME || 'Driver',
    driverCity: process.env.DRIVER_CITY || 'Sri Lanka',
    driverCountry: process.env.DRIVER_COUNTRY || 'Sri Lanka',
    driverWallet: paymentConfig.driverWallet, // Needed for on-chain verification
    network: paymentConfig.network, // Needed for on-chain verification
  });
});

// Payment endpoint
app.post('/api/pay', async (req, res) => {
  try {
    const { amount, label } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const labelValue = label || 'ride_payment';

    // Check if payment is already provided (PAYMENT-SIGNATURE header)
    // This header is protocol-specific, but we need to check for it to support external clients
    const paymentSignatureHeader = req.headers['payment-signature'] || req.headers['x-payment'];
    
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
      const paymentData = JSON.parse(
        Buffer.from(paymentSignatureHeader, 'base64').toString('utf-8')
      );

      // Get challenge data to process payment
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
      const settlementResult = await paymentService.processPayment(
        amount,
        labelValue,
        challengeResult.challengeData,
        paymentData,
        paymentConfig
      );

      if (settlementResult.status === 'settled') {
        // Return settlement (protocol compatibility)
        const settlementJson = JSON.stringify(settlementResult.proof);
        const settlementBase64 = Buffer.from(settlementJson).toString('base64');
        res.status(200);
        res.set('PAYMENT-RESPONSE', settlementBase64);
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
    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      return res.status(402).json({
        error: 'Payment Processing Error',
        message: paymentError.message || 'Failed to process payment',
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
