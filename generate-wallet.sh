#!/bin/bash

# Simple wallet generator script
# Option 1: Run locally with Node.js (recommended)
# Option 2: Run with Docker (if you prefer containers)

set -e

echo "🔐 Wallet Generator for USDC Payments"
echo ""

# Check if running with Docker flag
if [ "$1" = "--docker" ]; then
    echo "🐳 Generating wallet using Docker..."
    docker build -f Dockerfile.wallet-gen -t wallet-gen . > /dev/null 2>&1
    docker run -it --rm wallet-gen
else
    # Check if viem is available
    if ! node -e "require('viem/accounts')" 2>/dev/null; then
        echo "❌ viem not found. Installing..."
        npm install viem > /dev/null 2>&1
    fi
    
    echo "💻 Generating wallet locally..."
    node generate-wallet.js
fi