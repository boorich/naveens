/**
 * Mock Payment Provider
 * Wraps lib/x402/mock.js to implement PaymentProvider interface
 */

import { PaymentProvider } from '../provider.js';
import * as mockX402 from '../../x402/mock.js';

export class MockProvider extends PaymentProvider {
  /**
   * Create a payment challenge
   */
  async createChallenge(amountInUSDC, label, config) {
    const challenge = await mockX402.createPaymentChallenge(amountInUSDC, label, config);
    return {
      status: 'challenge',
      challengeData: challenge,
    };
  }

  /**
   * Process a payment (verify + settle)
   */
  async processPayment(challengeData, paymentData, config) {
    // Extract requirements from challenge
    const requirements = challengeData.accepts?.[0];
    if (!requirements) {
      throw new Error('Invalid challenge data: missing requirements');
    }

    // Verify payment (mock always succeeds)
    const verifyResult = await mockX402.verifyPayment(paymentData, requirements, config);
    if (!verifyResult.isValid) {
      throw new Error(verifyResult.invalidReason || 'Payment verification failed');
    }

    // Settle payment
    const settlement = await mockX402.settlePayment(paymentData, requirements, config);

    return {
      transaction: settlement.transaction,
      network: settlement.network,
      payer: settlement.payer || null,
    };
  }
}
