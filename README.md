# Naveen's — Self-Serve Payment Storefronts for Sri Lanka SMEs

A multi-tenant SaaS platform that lets any small business in Sri Lanka create a payment page and start accepting USDC in minutes. No bank, no POS terminal, no intermediary.

Naveen — a tuk-tuk driver in Batticaloa — is the first tenant and the proof of concept. His page lives at `/p/naveen`. Anyone can register their own storefront at `/` and get a page at `/p/their-name`.

Payments settle on the Base network (USDC) and go **directly** to the seller's wallet. The platform never touches the money.

---

## What It Is

- A vendor registers at the root URL, picks a name and a USDC wallet, and gets a page at `/p/slug`
- Customers open that page (via QR code, WhatsApp link, or direct URL), enter an amount in LKR, and pay in USDC
- The payment signs client-side with the buyer's private key — no wallet app, no browser extension required
- The vendor sees the transaction settle on-chain in seconds

The platform charges a small transparent infrastructure fee (configurable in basis points) collected as a second x402 payment immediately after the vendor payment settles — all within the same user interaction, without the buyer needing to do anything extra.

---

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env — set DATABASE_PATH, X402_MODE, and optionally PLATFORM_FEE_WALLET
npm run dev
```

Server starts at `http://localhost:4021`.

- **Register a storefront:** `http://localhost:4021/` — fill the form, generate or paste a wallet, get your page
- **Vendor page:** `http://localhost:4021/p/:slug`
- **QR code:** `http://localhost:4021/api/p/:slug/qr` (PNG download)
- **Admin view:** `http://localhost:4021/admin?secret=YOUR_ADMIN_SECRET`

### Payment Modes

| Mode | `X402_MODE` | Use |
|------|-------------|-----|
| Mock | `mock` | Local development — payments are simulated, no real money |
| Coinbase | `coinbase` | Production — real USDC on Base via Coinbase facilitator |

---

## Two Ways to Deploy

| Mode | When to use | Setup |
|------|-------------|-------|
| **Community service (multi-tenant)** | One shared deployment for many businesses | Set `DATABASE_PATH`. All storefronts live at `/p/:slug`. This is the primary mode. |
| **Self-hosted (single-tenant)** | One business running their own instance | No database needed. Set `DRIVER_USDC_WALLET` etc. in `.env`. Power user escape hatch. |

---

## Features

- Self-serve storefront registration with in-browser wallet generation
- Per-tenant payment pages at `/p/:slug` — seller name, service, description, contact buttons
- LKR → USDC conversion with configurable exchange rate per vendor
- QR code generation for each storefront (printable, downloadable)
- Multi-language support — English, Sinhala (සිංහල), Tamil (தமிழ்) — switchable per page visit
- Server-side availability toggle (vendor marks themselves busy/available via manage token)
- Two-phase fee collection — vendor payment + platform fee signed sequentially client-side
- Transaction log in SQLite with fee status tracking
- Admin view at `/admin` — all storefronts, wallet addresses, availability, QR download links, per-tenant transaction history, deliberate-friction delete flow
- Persistent floating wallet widget — always-visible key management with live USDC balance, age warnings, and balance threshold alerts
- Merchant self-service payments view — tap "My payments" on any storefront to see transaction history (manage token, stored in browser, no admin required)
- Client-side private key signing — keys never leave the browser, used once, discarded
- On-chain verification via BaseScan after payment settles

---

## Architecture: Payment Protocol Abstraction

**Key principle:** The application layer treats payments as only two meaningful states:

1. **"Challenge exists"** — user is told how to pay (payment required)
2. **"Settlement completed"** — payment proof available

Everything else (verification steps, facilitator quirks, retries, protocol choreography) is hidden below the app layer.

```
Client Request
    ↓
Payment Service  (app layer — two states only)
    ↓
Payment Provider  (protocol layer)
    ↓
x402 / Coinbase / mock / future-facilitator
```

The **app layer** only calls:
- `requestPayment(amount, label)` → challenge or settlement
- `processPayment(challenge, paymentData)` → settlement proof

The **provider layer** handles protocol-specific challenge creation, verification, and settlement. Swap facilitators without touching app code.

### Adding a New Payment Provider

```javascript
// lib/payment/providers/my-provider.js
import { PaymentProvider } from '../provider.js';

export class MyProvider extends PaymentProvider {
  async createChallenge(amountInUSDC, label, config) {
    return { status: 'challenge', challengeData: { ... } };
  }
  async processPayment(challengeData, paymentData, config) {
    return { transaction: 'tx_hash', network: 'base', payer: '...' };
  }
}
```

Register in `server.js`, set `X402_MODE=my-provider`. No other changes needed.

---

## Design Philosophy: Small Spending Keys

**This project makes a deliberate choice: buyers paste a private key to sign payments.**

This is not a security compromise. It is a deliberate rejection of the complexity that is killing crypto adoption.

### The Problem with Crypto UX

Every mainstream crypto tool requires browser extensions, seed phrase ceremonies, hardware wallets, or "connect wallet" flows. The result: crypto is unusable for 99% of people who just want to pay for something.

### The Architecture

This project uses **small spending keys** — keys funded with only what you need for everyday payments (a few dollars, enough for a tuk-tuk ride or a meal). The buyer pastes the key, the payment signs in-browser, the key is immediately discarded from memory.

**Why this is the right architecture for this use case:**

1. **Key size = risk size.** A small spending key is like cash in your wallet — not your life savings. If it's compromised, the loss is bounded.

2. **Zero onboarding friction.** No extensions, no seed phrases, no "connect wallet." Paste and pay.

3. **Rapid key rotation.** Key compromised? Fund a new one in seconds. More flexible than a hardware wallet.

4. **Deliberate UX.** The "cash ceremony" of pasting makes the transaction feel intentional. No hidden abstraction creating false security.

5. **Real adoption.** This is how crypto actually reaches real people for real everyday transactions. Academic purity that never leaves the lab helps nobody.

Security purists will say "never paste private keys." They're right for large holdings. They're wrong about what's needed for a tuk-tuk ride.

### Transparency as a Feature

For this use case, on-chain transparency is desirable, not a problem:

- Vendor sees the payment landed → on-chain is perfect
- Buyer can verify independently → on-chain is perfect
- Dispute resolution → transaction history is a public record
- Both parties can check BaseScan → on-chain is perfect

There is nothing private about a tuk-tuk payment. Adding ZK proofs or encryption would add complexity, cost, and failure modes for zero benefit.

### Daily Key Rotation

Recommended practice for buyers who pay regularly: rotate spending keys daily.

1. Every morning, generate a fresh wallet
2. Transfer remaining funds from yesterday's key to the new one
3. Use the new key for the day

On Base L2, a transfer costs $0.01–0.10. Daily rotation costs under $30/year. The exposure window is 24 hours maximum even if a key is compromised.

This is the same pattern as SSL/TLS certificate rotation — limit exposure through regular rotation. Just faster, because we can.

---

## Project Structure

```
server.js                      # Express server — routes, multi-tenant logic, admin page
lib/
  db.js                        # SQLite schema — businesses + transactions tables
  businesses.js                # Tenant CRUD, availability toggle, transaction recording
  seed.js                      # Seeds /p/naveen on first boot
  wallet-gen.js                # Re-exports viem/accounts for browser bundle
  payment/
    provider.js                # PaymentProvider interface & registry
    service.js                 # Payment service (hides protocol from app layer)
    client-signer.js           # Browser-side x402 signing source
    providers/
      mock.js                  # Mock provider (development)
      x402-coinbase.js         # Coinbase facilitator provider (production)
    test-payer.js              # Server-side test payer (dev only)
  x402/
    adapter.js                 # Legacy adapter
    coinbase.js                # x402/Coinbase implementation
public/
  index.html                   # Registration page (root URL)
  app.js                       # Registration page logic — slug check, wallet gen, form submit
  tenant.html                  # Generic storefront template (all /p/:slug pages)
  tenant.js                    # Storefront logic — config load, language switching,
                               #   availability toggle, payment flow (two-phase), share,
                               #   unified manage-token gate, merchant payments view
  wallet-widget.js             # Floating wallet widget — self-injecting FAB, localStorage
                               #   key management, live balance via RPC, rotation prompts
  styles.css                   # Design system — CSS custom properties, all pages
  client-signer.bundle.js      # Built: x402 client-side signing (committed — x402 not on npm)
  wallet-gen.bundle.js         # Built: viem wallet generation (lightweight, no x402 dep)
build-client-signer.js         # Builds client-signer.bundle.js
build-wallet-gen.js            # Builds wallet-gen.bundle.js
```

---

## Configuration

All configuration via `.env`. See `.env.example` for all options.

### Key Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_PATH` | — | Path to SQLite file. Setting this enables multi-tenant mode. |
| `X402_MODE` | `mock` | `mock` or `coinbase` |
| `FACILITATOR_URL` | `https://facilitator.coinbase.com` | x402 facilitator endpoint |
| `NETWORK` | `eip155:84532` | Base Sepolia testnet. Use `eip155:8453` for mainnet. |
| `PLATFORM_FEE_BPS` | `100` | Platform fee in basis points (100 = 1%) |
| `PLATFORM_FEE_WALLET` | — | Platform wallet that receives the fee. Fee disabled if unset. |
| `ADMIN_SECRET` | — | Protects `/admin` and `GET /api/businesses`. Unset = open. |
| `DRIVER_USDC_WALLET` | — | Wallet address for the seeded Naveen tenant |

---

## API Reference

### Storefront

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/p/:slug` | Vendor storefront page |
| `GET` | `/api/p/:slug/config` | Tenant config (name, service, rates, availability, fee params) |
| `POST` | `/api/p/:slug/pay` | x402 payment endpoint |
| `PATCH` | `/api/p/:slug/availability` | Toggle availability (requires manage token) |
| `GET` | `/api/p/:slug/my-transactions` | Merchant's own transaction history (requires manage token) |
| `GET` | `/api/p/:slug/qr` | QR code PNG for the storefront URL |

### Registration & Admin

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/businesses` | Register a new storefront (returns `manageToken`) |
| `GET` | `/api/businesses` | List all storefronts (admin) |
| `GET` | `/api/businesses/:slug/transactions` | Transaction history for a storefront (admin) |
| `DELETE` | `/api/businesses/:slug` | Delete storefront + transactions (admin) |
| `GET` | `/api/available/:slug` | Check slug availability |
| `POST` | `/api/platform/fee` | Platform fee payment endpoint |
| `POST` | `/api/p/:slug/record-transaction` | Record a completed vendor payment |
| `PATCH` | `/api/p/:slug/record-transaction/:id/fee` | Update fee status on a transaction |
| `GET` | `/admin` | Admin dashboard (protected by `ADMIN_SECRET`) |
| `GET` | `/health` | Health check |

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide.

**Recommended platform: Railway.** This is a stateful Express server with SQLite — Railway runs it as a persistent process with a mounted volume. Push to GitHub, set env vars, attach a volume, done. ~$5–8/month.

Key points:
- `client-signer.bundle.js` and `wallet-gen.bundle.js` are committed to the repo intentionally — the x402 packages are not on npm and cannot be rebuilt in a CI environment
- `railway.json` and `Procfile` are included — Railway uses `node server.js` directly, bypassing the prestart build hooks
- Set `DATABASE_PATH=/data/naveens.sqlite` and mount a Railway volume at `/data`
- For production: `NETWORK=eip155:8453` (Base Mainnet) + `FACILITATOR_URL=https://facilitator.coinbase.com`
- For staging/QA: `NETWORK=eip155:84532` (Base Sepolia) + `FACILITATOR_URL=https://x402.org/facilitator`

### VPS / Self-hosted

```bash
git clone <repo>
npm install
cp .env.example .env
# Edit .env
node server.js
```

Use PM2 for process management. Use Litestream for SQLite backups to S3/R2.

---

## License

ISC
