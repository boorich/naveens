You are Claude Code acting as a senior pragmatic full-stack engineer.

Build a minimal, production-ready MVP of a “TukTuk driver payment page” for Sri Lanka.

This is NOT a booking app.
This is NOT a platform.
This is a portable economic surface that follows the driver.

The page exists to:
- settle agreed rides
- make payment trivial for foreigners
- anchor trust + identity
- be shareable before or after a ride

---

## CORE PRINCIPLE (VERY IMPORTANT)

Payment timing is NOT encoded.

The system must NOT care whether the ride is:
- paid before
- paid during
- paid after

The only invariant:
→ the driver waits until settlement is visible.

This is a digital cash register, not a workflow.

---

## TECH STACK (INTENTIONAL & BORING)

- Node.js
- Express
- Plain HTML + CSS + vanilla JS
- No React
- No Next.js
- No framework magic
- One server, one process
- Runs locally with:
  `npm install && node server.js`

Static files served from `/public`.

Must be deployable to:
- any VPS
- cheap cloud VM
- on-prem box

---

## FUNCTIONAL SCOPE

### 1) LANDING PAGE (mobile-first)

**Hero**
- Driver name: “Naveen’s TukTuk”
- Location: “Batticaloa, Sri Lanka”
- Driver photo placeholder
- Short line:
  “Agree on a price. Settle digitally.”

**Availability (lightweight)**
- Status badge: “Available” / “Busy”
- Manual toggle
- Stored in localStorage only
- No backend persistence

---

### 2) PRIMARY ACTIONS (ORDER MATTERS)

Buttons, in this order:

1) **Settle Ride**
   - Scrolls to payment section
2) **WhatsApp / Call**
   - WhatsApp deep link preferred
   - Fallback: tel: link
3) **Language**
   - EN / SI / TA
   - Simple JS dictionary object
   - No i18n framework

This supports both:
- link-first (shared on WhatsApp before meeting)
- QR-first (physical proximity, post-ride)

---

### 3) SETTLE RIDE (CORE PAYMENT)

UI language must be neutral:
- “Settle ride”
- “Pay agreed amount”
NOT “Pay now” / “Book” / “Checkout”

**Inputs**
- Amount in LKR (numeric)
- Optional preset buttons: 500 / 1000 / 2000 LKR

**Display**
- “Estimated: X.XX USDC”
- Conversion via env var `LKR_PER_USDC`

**Action**
- Button: “Settle in USDC”

---

### 4) x402 PAYMENT FLOW

Backend endpoint:
- `POST /api/pay`

Behavior:
- Client sends amount + label `"ride_payment"`
- Server responds with x402 payment challenge
- Client completes payment
- Success state shows:
  - USDC amount
  - tx hash / receipt reference
  - text: “Settlement visible to driver”

Important:
- Single currency only: USDC
- No withdraw UI
- No balances
- No custody
- Pass-through to driver wallet

---

### 5) x402 IMPLEMENTATION DETAILS

Use adapter pattern:

/lib/x402/
- adapter.js
- coinbase.js
- mock.js

Rules:
- Default mode = MOCK
- Mock must:
  - simulate realistic x402 headers
  - delay confirmation slightly
  - return fake tx hash
- Same API shape for real provider

All secrets in env vars.
No secrets on client.

---

### 6) RECOMMEND NAVEEN (NO STAR RATINGS)

There is NO rating system.

Instead:

Text:
“If you liked your ride, sharing this page helps more than star ratings.”

Provide:
- Copy link button
- Share buttons:
  - WhatsApp
  - Facebook
  - X / Twitter

Prefilled share text:
“I rode with Naveen’s TukTuk in Batticaloa — fair, friendly, easy to settle digitally. Contact + pay here: <URL>”

No tracking.
No analytics.
No gamification.

---

### 7) QR CODE (OFFLINE USE ONLY)

QR codes are NOT for scanning on the same phone.

Implement:

- Button: “Get QR for TukTuk”
- Clicking it:
  - generates QR for the page URL
  - shows it full-screen
  - offers:
    - “Download image”
    - “Save to phone”

Helper text:
“Print this QR or place it on your TukTuk for customers to scan.”

QR is an **offline artifact**.

---

### 8) FOOTER

- “Powered by x402”
- Safety note: “Agree fare before you ride.”

---

## FILE STRUCTURE

/server.js
/public/
  index.html
  styles.css
  app.js
/lib/
  x402/
    adapter.js
    coinbase.js
    mock.js
/README.md

---

## ENV VARS

- DRIVER_NAME
- DRIVER_PHONE
- DRIVER_WHATSAPP
- DRIVER_CITY
- DRIVER_COUNTRY
- DRIVER_USDC_WALLET
- LKR_PER_USDC
- X402_MODE=mock|coinbase
- COINBASE_* (placeholders)
- BASE_URL

---

## SECURITY & UX

- Validate LKR input
- Prevent double submission
- Clear error messages
- Mobile-first
- Works offline except payment
- No cookies
- No analytics
- No user accounts

---

## ACCEPTANCE CRITERIA

- Runs locally in under 2 minutes
- Simulated x402 payment works
- Payment can happen anytime relative to ride
- Driver logic depends ONLY on settlement visibility
- Link sharing works
- QR is printable
- Code is boring, readable, and hackable

---

Now build it.
Start with server.js, then static HTML, then payment flow, then QR generation, then polish.
