/**
 * x402 Payment Adapter
 * Routes payment operations to the configured provider (mock or coinbase)
 */

import * as mockProvider from './mock.js';
import * as coinbaseProvider from './coinbase.js';

/**
 * Create payment adapter based on X402_MODE environment variable
 */
export function getProvider(mode) {
  switch (mode?.toLowerCase()) {
    case 'coinbase':
      return coinbaseProvider;
    case 'mock':
    default:
      return mockProvider;
  }
}

/**
 * Create payment challenge (PAYMENT-REQUIRED response)
 */
export async function createPaymentChallenge(amountInUSDC, label, config) {
  const provider = getProvider(config.x402Mode);
  return provider.createPaymentChallenge(amountInUSDC, label, config);
}

/**
 * Verify payment
 */
export async function verifyPayment(paymentPayload, requirements, config) {
  const provider = getProvider(config.x402Mode);
  return provider.verifyPayment(paymentPayload, requirements);
}

/**
 * Settle payment
 */
export async function settlePayment(paymentPayload, requirements, config) {
  const provider = getProvider(config.x402Mode);
  return provider.settlePayment(paymentPayload, requirements);
}
