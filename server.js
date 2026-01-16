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
      

      // Transform v2 format to legacy format for x402-axios compatibility
      // x402-axios expects: network="base-sepolia" (not "eip155:84532"), maxAmountRequired (not amount),
      // and resource/description/mimeType at requirement level (not in root resource object)
      const legacyRequirements = {
        x402Version: paymentRequirements.x402Version || 2,
        error: paymentRequirements.error || "Payment required",
        accepts: paymentRequirements.accepts.map(req => {
          // Map network from eip155:84532 to base-sepolia
          let network = req.network;
          if (network === 'eip155:84532') {
            network = 'base-sepolia';
          }
          
          return {
            scheme: req.scheme,
            network: network,
            maxAmountRequired: req.amount || req.maxAmountRequired, // x402-axios uses maxAmountRequired
            asset: req.asset,
            payTo: req.payTo,
            maxTimeoutSeconds: req.maxTimeoutSeconds,
            // Legacy format requires these at requirement level
            resource: paymentRequirements.resource?.url || `${x402Config.baseUrl}/api/pay`,
            description: paymentRequirements.resource?.description || labelValue,
            mimeType: paymentRequirements.resource?.mimeType || "application/json",
            // Preserve extra fields if present
            ...(req.extra && { extra: req.extra })
          };
        })
      };

      // x402-axios expects payment requirements in BOTH the header AND the response body
      res.status(402);
      res.set('PAYMENT-REQUIRED', requirementsBase64); // Keep original in header for v2 clients
      // Return legacy format in body - x402-axios reads from error.response.data
      return res.json(legacyRequirements);
    }

    // Payment provided - verify and settle
    try {
      const paymentPayload = JSON.parse(
        Buffer.from(paymentSignatureHeader, 'base64').toString('utf-8')
      );


      // Build payment requirements to verify against (keep in v2 format - facilitator expects this)
      const paymentRequirements = await x402Adapter.createPaymentChallenge(
        amount,
        labelValue,
        x402Config
      );
      const requirements = paymentRequirements.accepts[0];
      
      // Note: Payment payload from x402-axios uses legacy format (network="base-sepolia"),
      // but requirements should stay in v2 format (network="eip155:84532") for facilitator verification

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

// Test payment endpoint - builds v2 payment manually (bypassing x402-axios legacy format)
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

    const baseUrl = BASE_URL || `http://localhost:${PORT}`;
    const payUrl = `${baseUrl}/api/pay`;
    
    // Step 1: Get payment requirements from our own endpoint
    const axios = (await import('axios')).default;
    const initialResponse = await axios.post(payUrl, { amount, label: label || 'test_ride_payment' }, {
      validateStatus: () => true // Don't throw on 402
    });
    
    if (initialResponse.status !== 402) {
      // Payment already succeeded somehow, or error
      return res.status(initialResponse.status).json(initialResponse.data);
    }
    
    // Step 2: Decode payment requirements from PAYMENT-REQUIRED header
    const paymentRequiredHeader = initialResponse.headers['payment-required'];
    if (!paymentRequiredHeader) {
      throw new Error('Missing PAYMENT-REQUIRED header in 402 response');
    }
    
    const paymentRequirements = JSON.parse(Buffer.from(paymentRequiredHeader, 'base64').toString('utf-8'));
    
    // Step 3: Build v2 payment using @x402/core/client and @x402/evm/exact/client
    const { x402Client } = await import('@x402/core/client');
    const { ExactEvmScheme } = await import('@x402/evm/exact/client');
    const { encodePaymentSignatureHeader } = await import('@x402/core/http');
    const { privateKeyToAccount } = await import('viem/accounts');
    
    const account = privateKeyToAccount(testPrivateKey);
    const clientSigner = {
      address: account.address,
      signTypedData: async (message) => {
        return await account.signTypedData(message);
      }
    };
    
    const client = new x402Client();
    client.register('eip155:84532', new ExactEvmScheme(clientSigner));
    const paymentPayload = await client.createPaymentPayload(paymentRequirements);
    const paymentHeaderValue = encodePaymentSignatureHeader(paymentPayload);
    
    // Step 4: Retry request with payment header
    const paymentResponse = await axios.post(
      payUrl,
      { amount, label: label || 'test_ride_payment' },
      {
        headers: {
          'PAYMENT-SIGNATURE': paymentHeaderValue,
          'Access-Control-Expose-Headers': 'PAYMENT-RESPONSE'
        },
        validateStatus: () => true
      }
    );

    if (paymentResponse.status >= 200 && paymentResponse.status < 300) {
      res.status(paymentResponse.status).json(paymentResponse.data);
    } else {
      const errorData = paymentResponse.data || { error: 'Payment failed', message: `Status: ${paymentResponse.status}` };
      res.status(paymentResponse.status).json(errorData);
    }
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at ${BASE_URL}`);
  console.log(`📱 Payment mode: ${x402Config.x402Mode}`);
});
