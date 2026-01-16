/**
 * Mock x402 Payment Provider
 * Simulates realistic x402 v2 protocol headers and responses for testing
 */

/**
 * Generate a random hex string
 */
function randomHex(length) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Delay helper for realistic payment simulation
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create payment requirements (PAYMENT-REQUIRED response)
 */
export async function createPaymentChallenge(amountInUSDC, label, config) {
  const {
    baseUrl,
    driverWallet,
  } = config;

  // Convert USDC amount to atomic units (6 decimals)
  const amountInAtomicUnits = Math.floor(amountInUSDC * 1e6).toString();

  // Mock payment requirements matching x402 v2 structure
  const paymentRequired = {
    x402Version: 2,
    error: "Payment required",
    resource: {
      url: `${baseUrl}/api/pay`,
      description: label || "ride_payment",
      mimeType: "application/json"
    },
    accepts: [{
      scheme: "exact",
      network: "eip155:84532", // Base Sepolia (mock)
      amount: amountInAtomicUnits,
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Mock USDC address
      payTo: driverWallet || "0x0000000000000000000000000000000000000000",
      maxTimeoutSeconds: 300,
      extra: {
        name: "USDC",
        version: "2",
        resourceUrl: `${baseUrl}/api/pay`
      }
    }]
  };

  return paymentRequired;
}

/**
 * Verify payment (mock - always succeeds after delay)
 * @param {Object} paymentPayload - Payment payload (unused in mock)
 * @param {Object} requirements - Payment requirements (unused in mock)
 * @param {Object} config - Configuration (unused in mock, accepted for compatibility)
 */
export async function verifyPayment(paymentPayload, requirements, config) {
  // Simulate payment verification delay
  await delay(800);

  return {
    isValid: true,
    invalidReason: null
  };
}

/**
 * Settle payment (mock - returns fake transaction hash)
 * @param {Object} paymentPayload - Payment payload (unused in mock)
 * @param {Object} requirements - Payment requirements (used for network)
 * @param {Object} config - Configuration (unused in mock, accepted for compatibility)
 */
export async function settlePayment(paymentPayload, requirements, config) {
  // Simulate settlement delay
  await delay(1200);

  const txHash = `0x${randomHex(64)}`;
  const payerAddress = `0x${randomHex(40)}`;

  const settlement = {
    success: true,
    transaction: txHash,
    network: requirements.network,
    payer: payerAddress,
    requirements: requirements
  };

  return settlement;
}
