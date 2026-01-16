import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as x402Adapter from './lib/x402/adapter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4021;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Config for x402 adapter
const x402Config = {
  x402Mode: process.env.X402_MODE || 'mock',
  baseUrl: BASE_URL,
  driverWallet: process.env.DRIVER_USDC_WALLET || '0x0000000000000000000000000000000000000000',
  lkrPerUsdc: parseFloat(process.env.LKR_PER_USDC || '300'),
  facilitatorUrl: process.env.FACILITATOR_URL,
  network: process.env.NETWORK || 'eip155:84532',
};

// API endpoint to get config (non-sensitive values for client)
app.get('/api/config', (req, res) => {
  res.json({
    lkrPerUsdc: x402Config.lkrPerUsdc,
    driverName: process.env.DRIVER_NAME || 'Driver',
    driverCity: process.env.DRIVER_CITY || 'Sri Lanka',
    driverCountry: process.env.DRIVER_COUNTRY || 'Sri Lanka',
  });
});

// x402 Payment endpoint
app.post('/api/pay', async (req, res) => {
  try {
    const { amount, label } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const labelValue = label || 'ride_payment';

    // Check if payment is already provided (PAYMENT-SIGNATURE header)
    const paymentSignatureHeader = req.headers['payment-signature'] || req.headers['x-payment'];
    
    if (!paymentSignatureHeader) {
      // No payment provided - return 402 with PAYMENT-REQUIRED header
      const paymentRequirements = await x402Adapter.createPaymentChallenge(
        amount,
        labelValue,
        x402Config
      );

      // Encode payment requirements as base64 for PAYMENT-REQUIRED header
      const requirementsJson = JSON.stringify(paymentRequirements);
      const requirementsBase64 = Buffer.from(requirementsJson).toString('base64');

      res.status(402);
      res.set('PAYMENT-REQUIRED', requirementsBase64);
      return res.json({
        error: 'Payment Required',
        message: 'This endpoint requires payment',
      });
    }

    // Payment provided - verify and settle
    try {
      const paymentPayload = JSON.parse(
        Buffer.from(paymentSignatureHeader, 'base64').toString('utf-8')
      );

      // Build payment requirements to verify against
      const paymentRequirements = await x402Adapter.createPaymentChallenge(
        amount,
        labelValue,
        x402Config
      );
      const requirements = paymentRequirements.accepts[0];

      // Verify payment
      const verifyResult = await x402Adapter.verifyPayment(
        paymentPayload,
        requirements,
        x402Config
      );

      if (!verifyResult.isValid) {
        return res.status(402).json({
          error: 'Invalid Payment',
          reason: verifyResult.invalidReason || 'Payment verification failed',
        });
      }

      // Settle payment
      const settlement = await x402Adapter.settlePayment(
        paymentPayload,
        requirements,
        x402Config
      );

      // Encode settlement response as base64 for PAYMENT-RESPONSE header
      const settlementJson = JSON.stringify(settlement);
      const settlementBase64 = Buffer.from(settlementJson).toString('base64');

      res.status(200);
      res.set('PAYMENT-RESPONSE', settlementBase64);
      return res.json({
        success: true,
        transaction: settlement.transaction,
        network: settlement.network,
        amount: amount,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at ${BASE_URL}`);
  console.log(`📱 Payment mode: ${x402Config.x402Mode}`);
});
