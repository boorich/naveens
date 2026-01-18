/**
 * Payment Provider Interface
 * Defines minimal contract for payment providers (decoupled from x402/Coinbase specifics)
 */

/**
 * @typedef {Object} ChallengeData
 * @property {string} status - 'challenge'
 * @property {Object} challengeData - Provider-specific challenge data (hidden from app layer)
 * @property {Object} [appData] - App-friendly data to expose (if any)
 */

/**
 * @typedef {Object} SettlementProof
 * @property {string} transaction - Transaction hash/ID
 * @property {string} network - Network identifier
 * @property {string} [payer] - Payer address/ID (optional)
 */

/**
 * Payment Provider Interface
 * Providers implement this to handle payment challenges and settlement
 */
export class PaymentProvider {
  /**
   * Create a payment challenge
   * @param {number} amountInUSDC - Amount in USDC
   * @param {string} label - Payment label/description
   * @param {Object} config - Provider configuration
   * @returns {Promise<ChallengeData>}
   */
  async createChallenge(amountInUSDC, label, config) {
    throw new Error('createChallenge() must be implemented by provider');
  }

  /**
   * Process a payment (verify + settle in one step)
   * Hides verification details from app layer
   * @param {Object} challengeData - Challenge data from createChallenge
   * @param {Object} paymentData - Payment data from client
   * @param {Object} config - Provider configuration
   * @returns {Promise<SettlementProof>}
   * @throws {Error} If payment is invalid or settlement fails
   */
  async processPayment(challengeData, paymentData, config) {
    throw new Error('processPayment() must be implemented by provider');
  }
}

/**
 * Provider Registry
 */
const providers = new Map();

/**
 * Register a payment provider
 * @param {string} name - Provider name (e.g., 'mock', 'x402-coinbase')
 * @param {PaymentProvider} provider - Provider instance
 */
export function registerProvider(name, provider) {
  providers.set(name.toLowerCase(), provider);
}

/**
 * Get a payment provider by name
 * @param {string} name - Provider name
 * @returns {PaymentProvider}
 */
export function getProvider(name) {
  const provider = providers.get(name?.toLowerCase());
  if (!provider) {
    throw new Error(`Payment provider '${name}' not found. Available: ${Array.from(providers.keys()).join(', ')}`);
  }
  return provider;
}

/**
 * List available providers
 * @returns {string[]}
 */
export function listProviders() {
  return Array.from(providers.keys());
}
