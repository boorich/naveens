/**
 * x402 Coinbase Payment Provider
 * Wraps lib/x402/coinbase.js to implement PaymentProvider interface
 * Hides x402 protocol details from app layer
 */

import { PaymentProvider } from '../provider.js';
import * as coinbaseX402 from '../../x402/coinbase.js';

export class X402CoinbaseProvider extends PaymentProvider {
  /**
   * Create a payment challenge
   */
  async createChallenge(amountInUSDC, label, config) {
    const challenge = await coinbaseX402.createPaymentChallenge(amountInUSDC, label, config);
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

    // Verify payment (internal step - app layer doesn't need to know)
    const verifyResult = await coinbaseX402.verifyPayment(paymentData, requirements, config);
    if (!verifyResult.isValid) {
      throw new Error(verifyResult.invalidReason || 'Payment verification failed');
    }

    // Settle payment
    const settlement = await coinbaseX402.settlePayment(paymentData, requirements, config);

    return {
      transaction: settlement.transaction,
      network: settlement.network,
      payer: settlement.payer || null,
    };
  }
}
