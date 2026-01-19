/**
 * x402 Coinbase Payment Provider
 * Wraps lib/x402/coinbase.js to implement PaymentProvider interface
 * Hides x402 protocol details from app layer
 */

import { PaymentProvider } from '../provider.js';

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
   * Hides verification step from app layer
   */
  async processPayment(challengeData, paymentData, config) {
    // Extract requirements from challenge
    const requirements = challengeData.accepts?.[0];
    if (!requirements) {
      throw new Error('Invalid challenge data: missing requirements');
    }

    const coinbaseModule = await getCoinbaseModule();

    // Verify payment (internal step - app layer doesn't need to know)
    const verifyResult = await coinbaseModule.verifyPayment(paymentData, requirements, config);
    if (!verifyResult.isValid) {
      throw new Error(verifyResult.invalidReason || 'Payment verification failed');
    }

    // Settle payment
    const settlement = await coinbaseModule.settlePayment(paymentData, requirements, config);

    return {
      transaction: settlement.transaction,
      network: settlement.network,
      payer: settlement.payer || null,
    };
  }
}
