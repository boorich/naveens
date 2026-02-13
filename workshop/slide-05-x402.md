What is x402?

## A simple rule: Pay before you access.

1. Vendor sets a price
2. Customer sees the price
3. Customer pays (or doesn't)
4. If paid → service delivered

**No negotiation. No surprises. No games.**

---

### What x402 is:

**A payment protocol** you can think of as like a vending machine:
- You see the price
- You pay
- You get what you paid for
- No one can change the price after you pay

### What x402 is NOT:

- ❌ Not a cryptocurrency to buy and sell
- ❌ Not a trading platform
- ❌ Not an investment scheme
- ❌ Not something that goes up or down in value

**x402 is just a way to handle payments fairly and transparently.**

---

### How it works in practice:

**Traditional way:**
- Customer: "How much?"
- Vendor: "500 rupees"
- Customer: "Too much! 300?"
- Vendor: "400, final offer"
- Both waste time negotiating

**With x402:**
- Customer sees: "$0.40 per kilometer"
- Customer pays or doesn't
- No conversation needed
- Both save time

### The technology:

x402 uses the ledger we just discussed to:
- Record the price (can't be changed)
- Record the payment (can't be faked)
- Release the service (automatic)

**It's payment infrastructure, not speculation.**

---

### For developers: x402 technical overview

**x402 is a payment protocol** that uses smart contracts on Ethereum (Base) to enforce "pay before access" rules.

**How it works technically:**

1. **Vendor creates a payment request** (on-chain or off-chain)
2. **Price is recorded** (in smart contract or signed message)
3. **Customer pays USDC** (standard ERC-20 transfer)
4. **Payment triggers access** (automatic via smart contract or verification)

**Key technical components:**

- **Smart contracts:** Enforce payment rules automatically
- **USDC integration:** Standard ERC-20 token transfers
- **Ethereum/Base blockchain:** Immutable transaction record
- **Cryptographic proofs:** Verify payments without trusting intermediaries

**Architecture:**

- **Client-side:** JavaScript/TypeScript libraries for payment handling
- **Server-side:** Payment verification and service delivery
- **On-chain:** Smart contracts for payment enforcement (optional but recommended)
- **Off-chain:** Signed messages for lightweight use cases

**Developer resources:**

- **Core packages:** `@x402/core` and `@x402/evm` (npm packages)
- **GitHub repositories:** x402 organization (check for core, evm, and other packages)
- **Facilitator service:** https://x402.org/facilitator (testnet facilitator)
- **This project:** Reference implementation showing full integration
- **Package structure:**
  - `@x402/core/client` - Client-side payment handling
  - `@x402/core/server` - Server-side verification
  - `@x402/evm/exact/client` - EVM-specific client implementation
  - `@x402/evm/exact/server` - EVM-specific server implementation

**What you'll build:**

- Payment pages for local businesses
- Integration with existing systems
- Custom payment flows
- Tools for vendors to manage their storefronts

**x402 gives you the protocol. You build the experience.**

**This is open infrastructure**—no platform lock-in, no vendor fees, no data extraction. Just payment rails that work.

---

### Enough theory. Let's see how this actually works in practice with a real example.
