/**
 * x402 Coinbase Payment Provider
 * Wraps lib/x402/coinbase.js to implement PaymentProvider interface
 * Hides x402 protocol details from app layer
 */

import { PaymentProvider } from '../provider.js';
import axios from 'axios';

// Lazy load coinbase module - try bundled version first, fallback to source
let coinbaseX402 = null;
let coinbaseModulePromise = null;

async function getCoinbaseModule() {
  if (coinbaseX402) {
    return coinbaseX402;
  }
  
  if (!coinbaseModulePromise) {
    coinbaseModulePromise = (async () => {
      try {
        // Try bundled version first (for Vercel/deployment where packages aren't available)
        coinbaseX402 = await import('../../x402/coinbase.bundle.js');
      } catch (error) {
        // Fallback to source (for local development with linked packages)
        try {
          coinbaseX402 = await import('../../x402/coinbase.js');
        } catch (sourceError) {
          throw new Error(`Failed to load coinbase provider: ${error.message}. Make sure x402 packages are linked or bundle is built.`);
        }
      }
      return coinbaseX402;
    })();
  }
  
  return await coinbaseModulePromise;
}

export class X402CoinbaseProvider extends PaymentProvider {
  /**
   * Create a payment challenge
   */
  async createChallenge(amountInUSDC, label, config) {
    const coinbaseModule = await getCoinbaseModule();
    const challenge = await coinbaseModule.createPaymentChallenge(amountInUSDC, label, config);
    return {
      status: 'challenge',
      challengeData: challenge,
    };
  }

  /**
   * Process a payment (verify + settle)
   * Uses axios directly to avoid Node.js undici Content-Length mismatch bug
   * that affects the bundle's internal fetch calls on certain Node.js 22.x builds.
   */
  async processPayment(challengeData, paymentData, config) {
    const requirements = challengeData.accepts?.[0];
    if (!requirements) {
      throw new Error('Invalid challenge data: missing requirements');
    }

    const facilitatorUrl = config.facilitatorUrl;
    if (!facilitatorUrl) {
      throw new Error('FACILITATOR_URL must be configured');
    }

    // Serialize safely (handles BigInt values)
    const toJsonSafe = (obj) => JSON.parse(
      JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
    );

    const body = {
      x402Version: paymentData.x402Version ?? 2,
      paymentPayload: toJsonSafe(paymentData),
      paymentRequirements: toJsonSafe(requirements),
    };

    // Verify via axios (bypasses undici fetch entirely)
    const verifyRes = await axios.post(`${facilitatorUrl}/verify`, body, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    const verifyData = verifyRes.data;
    if (!verifyData.isValid) {
      throw new Error(verifyData.invalidReason || 'Payment verification failed');
    }

    // Settle via axios
    const settleRes = await axios.post(`${facilitatorUrl}/settle`, body, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    const settleData = settleRes.data;
    if (!settleData.success) {
      throw new Error(settleData.errorReason || `Settlement failed (${settleRes.status})`);
    }

    return {
      transaction: settleData.transaction,
      network: config.network,
      payer: paymentData.payload?.from || null,
    };
  }
}
