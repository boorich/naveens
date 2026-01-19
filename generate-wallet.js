#!/usr/bin/env node

/**
 * Simple Wallet Generator
 * Generates a new Ethereum wallet (private key + address) for receiving USDC payments
 * 
 * SECURITY NOTE: This runs locally on YOUR machine. The private key never leaves your computer.
 * 
 * Usage:
 *   node generate-wallet.js
 * 
 * Or with Docker:
 *   docker run -it --rm node:20-slim sh -c "npm install -g viem && node -e \"...\""
 */

import { privateKeyToAccount } from 'viem/accounts';
import { generatePrivateKey } from 'viem/accounts';

try {
  // Generate a new random private key
  const privateKey = generatePrivateKey();
  
  // Derive the account (address) from the private key
  const account = privateKeyToAccount(privateKey);
  
  // Output in a clear format
  console.log('\n✅ New wallet generated!\n');
  console.log('📝 Your wallet address (share this to receive payments):');
  console.log(`   ${account.address}\n`);
  console.log('🔑 Your private key (KEEP THIS SECRET - paste it to sign payments):');
  console.log(`   ${privateKey}\n`);
  console.log('⚠️  SECURITY REMINDERS:');
  console.log('   1. Fund this address with USDC on Base Sepolia (for testing) or Base Mainnet');
  console.log('   2. Keep the private key secure - never share it');
  console.log('   3. Only fund what you need for daily spending');
  console.log('   4. Consider daily key rotation (see README.md)\n');
  console.log('📋 To fund your wallet:');
  console.log('   - Send USDC to:', account.address);
  console.log('   - Network: Base Sepolia (testnet) or Base Mainnet\n');
  
} catch (error) {
  console.error('❌ Error generating wallet:', error.message);
  console.error('\nMake sure you have viem installed:');
  console.error('   npm install viem');
  process.exit(1);
}