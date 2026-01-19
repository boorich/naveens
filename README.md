# Naveen's TukTuk - Payment Page

A minimal, production-ready payment page for TukTuk drivers in Sri Lanka. **Digital cash register** for ride settlement - not a booking system, not a platform. Just payment.

## Architecture: Payment Protocol Abstraction

**Key architectural principle:** The application layer treats payments as **only two meaningful states**:

1. **"Challenge exists"** - User is told how to pay (payment required)
2. **"Settlement completed"** - Payment proof/receipt available

Everything else (verification steps, facilitator quirks, retries, protocol choreography) is **hidden below the app layer**.

### What This Means

- **Client code has zero protocol knowledge** - No headers, status codes, or protocol-specific logic in the UI
- **No state machine complexity** - Just: idle → challenge/paying → settled (or error)
- **Provider-agnostic** - Swap payment facilitators without touching app code
- **Simple, boring code** - Business logic focuses on business, not payment protocol details

### Payment Flow

```
Client Request
    ↓
Payment Service (app layer)
    ↓
Payment Provider (protocol layer)
    ↓
x402/Coinbase/Stripe/etc (implementation)
```

The **app layer** only sees:
- `requestPayment(amount, label)` → Returns challenge or settlement
- `processPayment(challenge, paymentData)` → Returns settlement proof

The **provider layer** handles:
- Protocol-specific challenge creation
- Payment verification (internal step - app doesn't need to know)
- Settlement execution
- Error handling and retries

## Design Philosophy: Fighting Crypto Complexity

**This project makes a deliberate architectural choice that many will criticize: clients paste their private key to sign payments.**

This is **not a security compromise** - it's a **deliberate rejection of the complexity that's killing crypto adoption**.

### The Real Problem

Crypto has an adoption crisis because it's become an **elitist minefield**:
- People don't understand the complexity → they burn their fingers
- People got burned before → they're too scared to try
- Every tool requires browser extensions, seed phrases, hardware wallets
- The "security theater" of wallet infrastructure becomes a barrier to entry

**Result:** Crypto remains unusable for 99% of people who just want to pay for things.

### The Architecture: Small Spending Keys

This project uses **small spending keys** - keys funded with only what you need for everyday payments (a few dollars, enough for rides, coffee, etc.). Users paste the key, sign the payment, and the key is immediately discarded from memory.

**Why this is the RIGHT architecture:**

1. **Key size = risk size** - Small spending key = small loss if compromised. This is how cash works: you don't carry your life savings in your wallet.

2. **Zero onboarding friction** - No browser extensions, no seed phrases, no "connect wallet" flows. Just paste and pay.

3. **Rapid key rotation** - Key compromised? Fund a new one. Takes seconds. Hardware wallets can't compete with this flexibility.

4. **Deliberate UX** - The "cash ceremony" of pasting makes users think. It's not hidden behind abstraction layers that create false security.

5. **Real adoption** - This is how crypto actually gets used by real people for real things. The alternative is academic purity that never leaves the lab.

### Why We Don't Care About the Criticism

Security purists will say "never paste private keys." They're not wrong about best practices for large holdings, but they're wrong about what's needed for everyday payments.

**The real threat to crypto adoption isn't clipboard malware** - it's the complexity and elitism that keeps crypto out of reach of 99% of humanity.

This project chooses **actual usability** over **theoretical security** for everyday payments. If you need to store life savings, use a hardware wallet. If you need to pay for a tuk-tuk ride, paste a spending key.

### Why Not Abstract Further? (Privacy vs Transparency)

We could add privacy layers - zero-knowledge proofs, encrypted payment submissions, abstract payment receipts. **But why?**

**For this use case, transparency is a feature, not a bug:**

- Driver needs to see payment landed → On-chain is perfect
- Customer can verify payment independently → On-chain is perfect  
- Both parties can verify on BaseScan → On-chain is perfect
- Dispute resolution → Transaction history is public record

**There's no sensitive information to hide.** A tuk-tuk payment is not a secret - both parties know about it, both parties can verify it, and that's exactly what we want.

Adding privacy layers would:
- Add complexity (ZK proofs, encryption, abstract verification)
- Add friction (custom verification flows, trust assumptions)
- Add cost (ZK proof generation, specialized infrastructure)
- Add failure modes (proof verification bugs, encryption key management)

**For zero benefit** - because there's nothing private about a tuk-tuk payment.

Keep it simple, transparent, on-chain. Privacy is for use cases that actually need it (confidential transactions, anonymous donations, etc.). This isn't one of them.

### Daily Key Rotation: Money Hygiene

**Recommended practice:** Automated daily key rotation for spending keys.

**How it works:**
1. Every morning, automatically create a fresh wallet
2. Transfer remaining funds from yesterday's wallet to the new one
3. Use the new wallet key for the day
4. Old key is automatically obsolete

**Why this is powerful:**
- **Time-limited exposure** - Even if compromised, key is only valid for ~24 hours
- **Forced awareness** - Daily fund transfer means you check your holdings every day
- **Infinite address space** - New key every day = massive search space for attackers
- **Gas cost is minimal** - Base network fees are low; L3s make this essentially free

**Implementation options:**
- Cron job / scheduled task (runs locally or on a server)
- Browser extension (runs in background)
- Password manager plugin (integrates with key storage)
- Mobile app (daily notification reminder)

This isn't security theater - it's **money hygiene**. You check your wallet balance daily, you rotate keys daily, you maintain awareness. With low gas fees (Base/L3), the cost is trivial compared to the security and operational benefits.

**Gas cost reality check:**
- Base Sepolia: ~$0.01-0.05 per transfer
- Base mainnet: ~$0.01-0.10 per transfer  
- L3 networks: Essentially free

Daily rotation costs **$3-30/year** depending on network. That's less than a coffee per month for automated key rotation and forced daily balance awareness.

**The SSL certificate parallel:**

Think SSL/TLS certificates for websites - they rotate every 60-90 days. Same security principle:
- Limited exposure window (if private key compromised, only valid until cert expires)
- Automated rotation (Let's Encrypt, etc. handle it automatically)
- Operational awareness (you notice when rotation happens)
- Industry standard practice (nobody questions rotating SSL certs)

**Daily key rotation is the same pattern, just faster** - because we can. Low gas costs make daily rotation trivial, so why wait 60-90 days when you can rotate every 24 hours? The security model is identical: limit exposure window through regular rotation.

This isn't radical - it's applying proven web security patterns to everyday spending keys.

## Features

- Mobile-first payment interface
- LKR to USDC conversion
- QR code generation for offline sharing
- Social sharing capabilities
- Multi-language support (EN/SI/TA)
- **Client-side private key signing** - Keys never leave the browser, used once, discarded
- **On-chain verification** - Trustless verification via BaseScan block explorer
- No booking system - just payment settlement

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Link x402 packages (if not published):
```bash
./FIX-LINKS.sh
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` with your driver information and wallet address

5. Start the server:
```bash
# Mock mode (for testing)
npm run dev

# Coinbase facilitator (real payments)
npm run start:coinbase
```

The server will start on `http://localhost:4021` (or the PORT specified in `.env`).

## Configuration

All configuration is done via environment variables in `.env`. See `.env.example` for all available options.

### Payment Mode

- `X402_MODE=mock` - Simulated payments (default, for testing)
- `X402_MODE=coinbase` - Real x402 payments via Coinbase facilitator (requires additional config)

See [README-COINBASE.md](README-COINBASE.md) for Coinbase facilitator setup.

### Generating Your Wallet

**To start receiving payments, you need a wallet with USDC.**

The simplest way: Use the included wallet generator (runs **locally on your machine** - your keys never leave your computer):

```bash
# Option 1: Run locally (recommended - most secure)
./generate-wallet.sh

# Option 2: Run with Docker
./generate-wallet.sh --docker

# Option 3: Direct Node.js (if viem is installed)
node generate-wallet.js
```

This will output:
- **Wallet address** - Fund this with USDC (share it to receive payments)
- **Private key** - Use this to sign payments (keep it secret)

**Security note:** This tool runs **locally on your machine**. The private key is generated and displayed on your computer - it never touches any server. You have full control.

**Next steps:**
1. Copy your wallet address
2. Fund it with USDC on Base Sepolia (testnet) or Base Mainnet
3. Use the private key when signing payments
4. Consider daily key rotation (see Design Philosophy section)

**Why not use a web service?** If someone else generates your keypair, they could see your private key. This tool runs on **your machine** - you're in control.

## Project Structure

```
/server.js                    # Express server (app layer - no protocol knowledge)
/public/
  index.html                  # Main page
  styles.css                  # Styles
  app.js                      # Client-side JavaScript (2-state model: challenge vs settled)
/lib/
  payment/                    # Payment abstraction layer
    provider.js               # PaymentProvider interface & registry
    service.js                # High-level payment service (hides protocol details)
    providers/
      mock.js                 # Mock provider (for testing)
      x402-coinbase.js        # Coinbase provider (hides x402 details)
    test-payer.js             # Test payment utility (server as payer)
  x402/                       # Protocol-specific implementation
    adapter.js                # Legacy adapter (deprecated - use payment/ layer)
    mock.js                   # Mock x402 implementation
    coinbase.js               # Real x402/Coinbase implementation
```

### Architectural Layers

1. **App Layer** (`server.js`, `public/app.js`)
   - No protocol knowledge
   - Two states: challenge vs settlement
   - Simple, maintainable code

2. **Payment Service Layer** (`lib/payment/service.js`)
   - Orchestrates payment flow
   - Hides protocol details from app
   - Provider-agnostic interface

3. **Provider Layer** (`lib/payment/providers/`)
   - Implements `PaymentProvider` interface
   - Handles protocol-specific logic
   - Easy to swap (new facilitator = new provider)

4. **Protocol Implementation** (`lib/x402/`)
   - x402/Coinbase specific code
   - Can be replaced without touching app layer

## Adding a New Payment Provider

To add a new facilitator (e.g., Stripe, Lightning Network):

1. Create `lib/payment/providers/stripe.js`:
```javascript
import { PaymentProvider } from '../provider.js';

export class StripeProvider extends PaymentProvider {
  async createChallenge(amountInUSDC, label, config) {
    // Your challenge creation logic
    return { status: 'challenge', challengeData: {...} };
  }

  async processPayment(challengeData, paymentData, config) {
    // Your verification + settlement logic
    return { transaction: 'tx_hash', network: 'stripe', payer: '...' };
  }
}
```

2. Register in `server.js`:
```javascript
import { StripeProvider } from './lib/payment/providers/stripe.js';
registerProvider('stripe', new StripeProvider());
```

3. Set `X402_MODE=stripe` - **No other code changes needed!**

The app layer doesn't know or care which provider you're using.

## Testing

### Mock Mode
```bash
npm run dev
```
Access `http://localhost:4021` - payments are simulated.

### Coinbase Facilitator (Real Payments)
```bash
npm run start:coinbase
```

Requires:
- `DRIVER_USDC_WALLET` - Your Base Sepolia wallet address
- `TEST_PRIVATE_KEY` - (Optional) For test payments via `/api/test-pay`

See [README-COINBASE.md](README-COINBASE.md) for details.

## Deployment

### Vercel (Serverless)

**Recommended for quick deployment:**

See [VERCEL.md](VERCEL.md) for detailed Vercel deployment instructions.

Quick start:
1. Push code to GitHub
2. Import to Vercel dashboard
3. Set environment variables
4. Deploy

**Note:** Requires x402 packages to be published to npm, or bundled dependencies.

### VPS / Traditional Hosting

This app can be deployed to any VPS, cloud VM, or on-prem box that supports Node.js:

1. Clone the repository
2. Install dependencies (`npm install`)
3. Link x402 packages (`./FIX-LINKS.sh`)
4. Configure `.env` file
5. Start the server (`npm start` or `npm run start:coinbase`)

**Recommended platforms:**
- Railway - Simple deployment, supports Docker
- Render - Free tier, easy setup
- DigitalOcean App Platform - Managed Node.js hosting
- Traditional VPS (DigitalOcean, Linode, etc.) - Full control

For production, consider using a process manager like PM2.

## Why This Architecture?

**Decoupling:** App code independent of payment facilitator specifics. Change facilitators without refactoring.

**Simplicity:** Two clear states (challenge vs settlement) instead of complex state machines.

**Swappability:** New facilitator = implement `PaymentProvider` interface. No app changes.

**Testability:** Easy to mock payment service for testing.

**Maintainability:** Protocol changes isolated to provider layer. Business logic stays clean.

**No vendor lock-in:** Payment protocols are implementation details, not architectural constraints.

## License

ISC
