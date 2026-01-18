/**
 * Payment Service
 * High-level payment abstraction that orchestrates challenge → settlement
 * Hides all protocol details from app layer
 */

import { getProvider } from './provider.js';

/**
 * Request payment - returns challenge or settlement
 * @param {number} amountInUSDC - Amount in USDC
 * @param {string} label - Payment label
 * @param {Object} config - Configuration (includes x402Mode)
 * @returns {Promise<{status: 'challenge' | 'settled', challengeData?: Object, proof?: Object}>}
 */
export async function requestPayment(amountInUSDC, label, config) {
  const provider = getProvider(config.x402Mode);
  const result = await provider.createChallenge(amountInUSDC, label, config);
  
  // Result is always a challenge from createChallenge
  // Settlement happens via processPayment() when payment is provided
  return result;
}

/**
 * Process payment - verify and settle
 * @param {number} amountInUSDC - Amount in USDC
 * @param {string} label - Payment label
 * @param {Object} challengeData - Challenge data from requestPayment
 * @param {Object} paymentData - Payment data from client
 * @param {Object} config - Configuration
 * @returns {Promise<{transaction: string, network: string, payer?: string}>}
 */
export async function processPayment(amountInUSDC, label, challengeData, paymentData, config) {
  const provider = getProvider(config.x402Mode);
  const proof = await provider.processPayment(challengeData, paymentData, config);
  
  return {
    status: 'settled',
    proof: proof,
  };
}
