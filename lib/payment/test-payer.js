/**
 * Test Payment Payer
 * Utility for test payments (server acting as payer)
 * Provider-agnostic interface, but currently implements x402 payment building
 */

/**
 * Create payment payload for test payments
 * @param {Object} challengeData - Challenge data from payment service
 * @param {string} privateKey - Private key for signing (hex string)
 * @returns {Promise<Object>} Payment payload ready to send
 */
export async function createTestPayment(challengeData, privateKey) {
  // For now, this only supports x402-coinbase provider
  // In the future, we could make this provider-agnostic by delegating to provider
  
  // Import x402 client libraries (only used for test payments)
  const { x402Client } = await import('@x402/core/client');
  const { ExactEvmScheme } = await import('@x402/evm/exact/client');
  const { privateKeyToAccount } = await import('viem/accounts');
  
  // Create account from private key
  const account = privateKeyToAccount(privateKey);
  const clientSigner = {
    address: account.address,
    signTypedData: async (message) => {
      return await account.signTypedData(message);
    }
  };
  
  // Build payment payload using x402 client
  const client = new x402Client();
  client.register('eip155:84532', new ExactEvmScheme(clientSigner));
  const paymentPayload = await client.createPaymentPayload(challengeData);
  
  return paymentPayload;
}
