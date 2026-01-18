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

## Features

- Mobile-first payment interface
- LKR to USDC conversion
- QR code generation for offline sharing
- Social sharing capabilities
- Multi-language support (EN/SI/TA)
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

This app can be deployed to any VPS, cloud VM, or on-prem box that supports Node.js:

1. Clone the repository
2. Install dependencies (`npm install`)
3. Link x402 packages (`./FIX-LINKS.sh`)
4. Configure `.env` file
5. Start the server (`npm start` or `npm run start:coinbase`)

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
