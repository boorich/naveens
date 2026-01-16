# Starting Server with Coinbase Facilitator

## Quick Start

```bash
# Set driver wallet (Base Sepolia address)
export DRIVER_USDC_WALLET=0x...

# Start with script
npm run start:coinbase

# OR manually:
./start-coinbase.sh

# OR with inline command:
FACILITATOR_URL=https://x402.org/facilitator X402_MODE=coinbase NETWORK=eip155:84532 DRIVER_USDC_WALLET=0x... node server.js
```

## Environment Variables

**Required:**
- `DRIVER_USDC_WALLET` - Your Base Sepolia wallet address (0x...)

**Optional (defaults set in script):**
- `FACILITATOR_URL` - Default: `https://x402.org/facilitator` (testnet)
  - For production: `https://api.cdp.coinbase.com/platform/v2/x402`
- `NETWORK` - Default: `eip155:84532` (Base Sepolia)
- `X402_MODE` - Set to `coinbase` by script

## Facilitator URLs

- **Testnet**: `https://x402.org/facilitator` (Base Sepolia)
- **Production**: `https://api.cdp.coinbase.com/platform/v2/x402` (requires CDP API keys)

## Testing

Once server is running, test from payment module:

```bash
cd ../x402_payment_module
PRIVATE_KEY=0x... RESOURCE_URL=http://localhost:4021/api/pay node test-payment.js
```
