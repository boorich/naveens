# Setup Instructions

## Build x402 Packages (One-time)

The server needs `@x402/core` and `@x402/evm` packages from the x402 repo.

**IMPORTANT: The x402 repo uses pnpm, not npm.**

```bash
# Install pnpm if you don't have it: npm install -g pnpm

# Build from the typescript root (installs all workspace deps)
cd /Users/martinmaurer/Projects/Martin/x402/typescript
pnpm install
pnpm --filter @x402/core build
pnpm --filter @x402/evm build
```

## Install Dependencies

**Option A: Use npm link (RECOMMENDED if file: paths don't work)**

See `SETUP-LINK.md` for npm link instructions.

**Option B: Use file: paths**

```bash
cd /Users/martinmaurer/Projects/Martin/dreamspace/x402_projects/naveens_tuktuk
rm -rf node_modules package-lock.json  # Clean first
npm install
```

The `package.json` uses `file:` paths to link the local x402 packages.

**If file: paths fail**, try npm link (Option A).

## Start Server

```bash
DRIVER_USDC_WALLET=0x0eb5b7b158f5AbCD943A17250cC36375c5Df4fc4 FACILITATOR_URL=https://x402.org/facilitator X402_MODE=coinbase NETWORK=eip155:84532 node server.js
```

## Test Payment

From `x402_payment_module`:
```bash
cd ../x402_payment_module
PRIVATE_KEY=0x... RESOURCE_URL=http://localhost:4021/api/pay node test-payment.js
```
