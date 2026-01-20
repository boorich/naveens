/**
 * Client-side Payment Signer
 * Bundled separately for browser use
 * Private key never leaves browser - only signed payload is returned
 */

import { x402Client } from '@x402/core/client';
import { ExactEvmScheme } from '@x402/evm/exact/client';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';

/**
 * Sign payment challenge client-side
 * @param {Object} challengeData - Payment challenge from server
 * @param {string} privateKey - Private key (0x-prefixed hex string, 66 chars)
 * @returns {Promise<Object>} Signed payment payload
 */
export async function signPayment(challengeData, privateKey) {
  // Validate private key format
  if (!privateKey || !privateKey.startsWith('0x') || privateKey.length !== 66) {
    throw new Error('Invalid private key format. Must start with 0x and be 66 characters (0x + 64 hex chars).');
  }
  
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

/**
 * Sign a plain message (for ownership verification, etc.)
 * @param {string} message - Plain text message to sign
 * @param {string} privateKey - Private key (0x-prefixed hex string, 66 chars)
 * @returns {Promise<string>} Signature
 */
export async function signMessage(message, privateKey) {
  // Validate private key format
  if (!privateKey || !privateKey.startsWith('0x') || privateKey.length !== 66) {
    throw new Error('Invalid private key format. Must start with 0x and be 66 characters (0x + 64 hex chars).');
  }
  
  // Create account from private key
  const account = privateKeyToAccount(privateKey);
  
  // Sign the message
  const signature = await account.signMessage({ message });
  
  return signature;
}

/**
 * Get address from private key (for displaying/verifying)
 * @param {string} privateKey - Private key (0x-prefixed hex string, 66 chars)
 * @returns {string} Address
 */
export function getAddressFromPrivateKey(privateKey) {
  if (!privateKey || !privateKey.startsWith('0x') || privateKey.length !== 66) {
    throw new Error('Invalid private key format. Must start with 0x and be 66 characters (0x + 64 hex chars).');
  }
  
  const account = privateKeyToAccount(privateKey);
  return account.address;
}

/**
 * Generate a new wallet (private key + address) client-side
 * @returns {{ address: string, privateKey: string }} Wallet object with address and private key
 */
export function generateWallet() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { address: account.address, privateKey };
}
