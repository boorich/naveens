#!/bin/bash

# Start server with Coinbase facilitator (real payments)
# Requires: FACILITATOR_URL and DRIVER_USDC_WALLET in .env or set here

# Base Sepolia facilitator (testnet)
# For production, use: https://api.cdp.coinbase.com/platform/v2/x402
export FACILITATOR_URL="${FACILITATOR_URL:-https://x402.org/facilitator}"
export X402_MODE=coinbase
export NETWORK=eip155:84532

# Driver wallet (must be set - Base Sepolia address)
if [ -z "$DRIVER_USDC_WALLET" ]; then
  echo "❌ DRIVER_USDC_WALLET environment variable required"
  echo "   Set it in .env or export it:"
  echo "   export DRIVER_USDC_WALLET=0x..."
  exit 1
fi

# Test private key (for /api/test-pay endpoint - payer wallet)
if [ -z "$TEST_PRIVATE_KEY" ]; then
  echo "⚠️  TEST_PRIVATE_KEY not set - /api/test-pay will be disabled"
  echo "   Set it to enable browser payment testing:"
  echo "   export TEST_PRIVATE_KEY=0x... (consumer/payer wallet private key)"
fi

# Test private key (for /api/test-pay endpoint - payer wallet)
if [ -z "$TEST_PRIVATE_KEY" ]; then
  echo "⚠️  TEST_PRIVATE_KEY not set - /api/test-pay will be disabled"
  echo "   Set it to enable browser payment testing:"
  echo "   export TEST_PRIVATE_KEY=0x... (consumer/payer wallet private key)"
fi

echo "🚀 Starting server with Coinbase facilitator..."
echo "   Facilitator: $FACILITATOR_URL"
echo "   Network: $NETWORK"
echo "   Driver wallet: $DRIVER_USDC_WALLET"
if [ -n "$TEST_PRIVATE_KEY" ]; then
  echo "   Test payment: ENABLED (via /api/test-pay)"
else
  echo "   Test payment: DISABLED (set TEST_PRIVATE_KEY to enable)"
fi
echo ""

node server.js
