# Fighting Back Against Extractive Platform Capitalism

**Foundational Concept Document** · February 2026 · Version 1.1  
**Martin Maurer** · Founder & Infrastructure Architect

---

## 1. The Real Problem

The comfortable narrative about the Global South and technology is that informal economy vendors have been ignored by modern fintech. That narrative is wrong and it is too kind to the actual perpetrators.

Informal economy vendors have not been ignored. They have been actively targeted, recruited, and locked into extractive platform dependencies that are in many ways more damaging than no technology at all. Uber, Grab, Gojek, Rapido, and their equivalents across Asia, Africa, and Latin America did not pass over the tuk-tuk driver, the market seller, or the handicraft producer. They built entire businesses on top of them.

The platform gives the vendor something real: customer discovery, demand aggregation, a digital presence they could not build alone. Then it extracts 25–35% of every transaction. Forever. And it holds the customer relationship hostage so the vendor can never leave without losing their entire income base. That is not a service. That is a trap.

This is the defining dynamic of extractive platform capitalism in emerging markets. The vendor is recruited with genuine value, becomes dependent on the platform for survival, and then finds themselves in a permanent extraction relationship with no exit. The platform owns the customer. The vendor provides the labor. The economics flow upward to shareholders in San Francisco or Amsterdam.

### The bundled SaaS trap

The mechanism is always the same: bundle a real capability (find customers, process payments, manage inventory) with a customer relationship lock-in, then price accordingly once dependency is established. Shopify charges Western merchants 2.9% + $0.30 per transaction and is considered expensive. Grab charges Southeast Asian informal vendors 25–30% and is considered a success story. The difference is not the technology. It is the power asymmetry and the absence of alternatives.

### Why traditional fintech is not the answer

Stripe, Visa, and Square are not the enemy. They are simply irrelevant to this market. Their fee structures, onboarding requirements, bank account dependencies, and KYC frameworks make them structurally inaccessible to informal economy vendors. The problem is not that they are extractive toward these communities. It is that they have left a vacuum that extractive platform operators have filled instead.

Naveen's does not compete with Stripe. Naveen's competes with Grab. The target is not traditional fintech but the bundled platform model that trades genuine utility for permanent extraction and customer relationship capture.

---

## 2. The Solution: Naveen's

Naveen's is a self-funded impact business providing open, non-custodial USDC payment infrastructure for informal economy vendors. It is the counter-thesis to extractive platform capitalism: give vendors the payment capability without taking the customer relationship, without locking them in, and without extracting a percentage of their livelihood in perpetuity.

### The core proposition

- A vendor **owns their QR sticker**. It is physically theirs. No platform can deactivate it.
- A vendor **owns their wallet**. The keys are theirs. No platform holds their funds.
- A vendor **owns their customer relationships**. Buyers pay them directly. No platform sits between them.
- A vendor pays a **small, transparent infrastructure fee** — not a percentage of their earnings taken by a platform that also owns their customer data.
- A vendor can **stop using Naveen's tomorrow** and lose nothing except the infrastructure. Their customers, their money, and their relationships remain entirely theirs.

### What Naveen's is

- Hosted USDC payment endpoint infrastructure, accessible via QR code sticker
- Per-transaction basis-point fee collected at the facilitator level — transparent, on-chain, auditable
- Optional SaaS-style monthly subscription for vendors who prefer predictable pricing
- Operated from Poland under EU regulatory frameworks — MiCA-compliant, legally defensible
- Non-custodial by architecture — Naveen's never holds vendor funds under any circumstances

### What Naveen's is not

- Not a platform that owns the customer relationship
- Not a bundled product that creates dependency through feature lock-in
- Not a custodial wallet or financial intermediary
- Not a charity, NGO program, or donor-dependent initiative
- Not extracting 25–35% of vendor earnings

### How Naveen's grows

Naveen's grows the way WhatsApp grew — not through marketing but through the self-interest of existing users. Every vendor who receives USDC wants to spend it locally rather than convert back to LKR and lose on the exchange. So they ask the sandwich seller next door if they accept it. That seller wants in. Each new vendor creates new USDC holders among their buyers. Those holders look for more places to spend. The network recruits itself from both sides simultaneously.

The QR sticker on a vendor's table is not just a payment terminal. It is a visible recruitment signal to every USDC holder who walks past.

---

## 3. The Technology

Naveen's is built on x402, an open payment protocol using the HTTP 402 status code to enable machine-readable, programmable payment requests. The infrastructure runs on Node.js hosted in Poland, with Coinbase CDP providing USDC payment verification on Base.

### Architecture overview

| Layer | Detail |
|---|---|
| Infrastructure | Node.js x402 payment gate server, hosted in Poland (EU) |
| Payment rails | USDC on Base — fast, low-cost, dollar-stable |
| Verification | Coinbase CDP facilitator for payment confirmation |
| Vendor interface | QR code sticker — no app, no terminal, no power required |
| Fee collection | Basis-point fee at facilitator level, fully on-chain and auditable |
| Vendor wallet | Non-custodial — vendor holds their own keys, always |
| Ground operation | DreamSpace Academy, Batticaloa, Sri Lanka |

### Why USDC on Base

- **Dollar-stable** to protect vendors from local currency volatility without speculation
- **Transaction fees under $0.01** — viable for $2–5 handicraft and informal economy transactions
- **Instant settlement** — vendors see funds arrive in real time, no clearing delay
- **Non-custodial** — Naveen's never touches vendor funds at any point in the flow
- **Globally accessible** — diaspora buyers in the UK, Germany, or Canada pay instantly with no international transfer fees
- **Open protocol** — no single company controls the rails, including Naveen's

### The QR sticker: simplicity as philosophy

The entire point-of-sale terminal is a sticker. It requires no power, no internet connection on the vendor's side at point of display, no application download, and no technical knowledge to operate. A buyer scans it with any smartphone camera and pays. The vendor sees the USDC arrive. That's the entire interaction.

The simplicity is not a compromise but the design principle. Complexity is how platforms create dependency. Simplicity is how vendors stay free.

### Fee transparency as a statement of intent

Every fee Naveen's collects is visible on-chain: the exact basis points charged, the exact transaction amount, the exact timestamp. Any vendor can verify at any time exactly what they are paying and why. This is the architectural opposite of platform capitalism, where fee structures are deliberately obscure, subject to unilateral change, and bundled with other costs to prevent comparison. Naveen's fees are auditable by design because opacity is how extraction hides.

---

## 4. The Market

### Sri Lanka: the pilot market

Sri Lanka has approximately one million SMEs. The informal economy — street vendors, market sellers, home-based producers, and community selling networks — represents a substantial portion. Following the 2022 economic collapse, organic stablecoin adoption grew rapidly as citizens used USDT to protect savings from LKR devaluation and to receive diaspora remittances without losing 8–12% to money transfer operators. The demand for non-extractive payment infrastructure is real and proven. The regulatory environment is a gray zone: crypto is not banned, not licensed, and peer-to-peer transfers have never been explicitly prohibited.

### The beachhead: handicraft community, Batticaloa

The initial target is a WhatsApp-based community of 800 women in the Batticaloa region selling handmade products. This community has an established trust network, an active community leader, and existing international buyers. They cannot currently receive international payments efficiently. Every international sale either doesn't happen, loses 8–12% to a remittance operator, or requires a buyer with a credit card and a Western payment account. Naveen's eliminates all three barriers with a QR sticker and a five-minute wallet setup.

### Platform extraction in context

To understand the scale of what is being fought: a vendor earning $500/month through a platform charging 30% pays $150/month ($1,800/year) to a platform that also owns their customer data, can change its fee structure unilaterally, and can deplatform them without recourse. Over five years that is $9,000 extracted from a single informal economy vendor. Multiply by millions of vendors across the Global South and the scale of the extraction becomes clear.

### Addressable market

| Segment | Figure |
|---|---|
| Sri Lanka SMEs (total) | ~1,000,000 |
| Conservative addressable (informal) | ~300,000 |
| 10% penetration target | 30,000 vendors |
| Revenue at $2/month per vendor | $60,000 MRR |
| Revenue at $5/month per vendor | $150,000 MRR |
| Replication markets | Bangladesh, Philippines, Kenya, Tanzania, Colombia, Indonesia |

> These numbers are not the pitch. The pilot transaction with one vendor in Batticaloa is the pitch. Every number above becomes real only after that first USDC lands in that first wallet.

---

## 5. The Impact Model

Naveen's is an impact business. It is not a charity, not a pure profit play, and explicitly not a platform disguised as infrastructure. The impact is structural: vendors own their customer relationships, hold their own funds, and pay a transparent infrastructure fee rather than surrendering a percentage of their earnings to a platform that owns their economic future.

### What structural impact means

- Vendors earn in USDC rather than a currency subject to political and economic instability
- Vendors can reach international buyers directly for the first time, without a platform intermediating and capturing that relationship
- Vendors pay infrastructure fees calibrated to their transaction volumes, not a flat percentage extracted regardless of margin
- Vendors retain their customer data — buyers pay them directly, the relationship is theirs
- Vendors can exit Naveen's at any time and lose nothing: their wallet, their customers, their transaction history all remain theirs

### The competitive frame

The honest competitive comparison is not Stripe versus Naveen's on fee percentages. It is: a vendor currently using Grab or a regional platform equivalent is paying 25–35% per transaction and has no customer relationship of their own. Naveen's offers sub-2% infrastructure fees and full customer relationship ownership. That delta is not incremental improvement. It is a structural change in the vendor's economic position.

### The colonial inversion

Western platform capitalism enters emerging markets with a product that provides genuine utility, captures dependency, and then extracts indefinitely. The customer relationship — representing the most valuable asset in any business — is held by the platform, not the vendor. Naveen's is built by a European developer explicitly to invert that dynamic. The infrastructure advantage (EU-hosted, MiCA-compliant, technically robust x402 protocol) is deployed in service of vendor sovereignty, not platform capture. The goal is to give vendors the capability without taking the relationship.

---

## 6. The Partnership: DreamSpace Academy

DreamSpace Academy in Batticaloa is the ground operation partner for the Sri Lanka pilot. They bring what no amount of remote infrastructure can provide: Tamil and Sinhala language capability, established community trust built over years, physical presence in the communities that matter, and the credibility of a respected local institution.

### DreamSpace's role — four things only

1. Obtain vendor details, product details and prices, and required assets provided by the vendor (images, text files)
2. Conduct wallet setup and onboarding in Tamil and Sinhala, in person, in community
3. Print and physically distribute QR stickers to onboarded vendors
4. Act as first-line support and institutional legitimacy anchor for community leaders considering adoption

### What DreamSpace is not asked to do

- Handle any funds — DreamSpace is not a financial intermediary at any point
- Sell the product — onboarding is educational, not commercial
- Manage the technology — all infrastructure runs from Poland (Europe)
- Act like a startup — executing defined operational tasks is fine to begin with; building a business from the get-go is not required unless there is free entrepreneurial drive anyway

### The partnership philosophy

DreamSpace is not a subcontractor. The community relationships, language capability, and institutional trust they bring are irreplaceable assets. The partnership should evolve toward genuine co-ownership of the Sri Lanka operation as the model proves itself. The specific structure — including revenue share, organizational integration, equity equivalent — is a second conversation, after proof of concept. The starting position is: DreamSpace brings things to this partnership that money cannot buy, and the commercial structure should reflect that.

**This is a transformative institutional opportunity, not a tech pilot.**

Grant-dependent organizations have a ceiling set by whoever writes the checks — and those checks come with agendas, reporting requirements, and renewal uncertainty. Naveen's offers DreamSpace recurring infrastructure revenue that grows with every vendor onboarded, owned by DreamSpace, accountable to no external funder. That is structural freedom, not a project.

The specific commercial terms are a second conversation. Given this vision, what does fair look like from DreamSpace's side of the table? What does financial independence mean for an organization like DreamSpace Academy?

---

## 7. Regulatory Position

### Sri Lanka

Crypto is neither legal nor explicitly illegal in Sri Lanka. The Central Bank (CBSL) prohibits banks from processing crypto transactions but has never banned individual peer-to-peer transfers. A vendor receiving USDC for goods sold is a private individual receiving a peer-to-peer transfer, not a licensed financial service. DreamSpace's role is purely educational: printing stickers, explaining how wallets work, and supporting with setting up shops. No financial services are provided in Sri Lanka. No Sri Lankan entity processes payments.

### Poland / EU

Naveen's operates as a software infrastructure business from Poland, subject to EU regulatory frameworks. Under MiCA (fully in effect 2024), non-custodial infrastructure providers carry a significantly lighter regulatory burden than custodial exchanges or payment processors. Since Naveen's never holds vendor funds at any point, the VASP classification question is largely moot. Revenue is declared as SaaS infrastructure service income in Poland.

### The clean narrative

| Question | Answer |
|---|---|
| What Naveen's sells | Hosted payment endpoint infrastructure (SaaS) |
| What vendors pay for | Infrastructure access — not payment processing |
| Where the business operates | Poland, under EU / MiCA frameworks |
| What happens in Sri Lanka | Education and sticker distribution only |
| Who holds vendor funds | The vendor — always, by architecture |
| Who processes payments | No one — peer-to-peer between buyer and vendor wallets |
| Fee transparency | Every fee on-chain, auditable by anyone |

---

## 8. The 2-Week Activation Plan

The following is the happy path to the first live transaction. Everything before this is infrastructure. Everything after this is scale.

### Week 1 — Setup and introduction

- Naveen's delivers a complete onboarding kit to DreamSpace tech contact: print-ready QR sticker file, Tamil/Sinhala one-pager onboarding script, test wallet preloaded with $5 USDC for the live demo
- DreamSpace operational lead makes a warm introduction to the handicraft WhatsApp community leader, in person, Tamil-speaking program coordinator present — no tech pitch, just: *"we want to show you something"*
- DreamSpace tech person sets up her wallet on her existing phone; QR sticker printed and placed on her phone case or selling table
- **Live demo moment:** Martin joins via WhatsApp video from Poland and sends $2 USDC to her wallet in real time while she watches it land. That is the entire sales pitch.

### Week 2 — First real transaction and community seeding

- She posts naturally in her 800-person WhatsApp group — DreamSpace helps draft something simple in Tamil, not promotional, just: *"this happened to me"*
- DreamSpace identifies 3–5 most active sellers in the group; repeats wallet setup and sticker deployment with each
- First real commercial transaction: an international buyer (diaspora, traveler, remote supporter) pays a vendor via QR code
- Screenshot and on-chain record of that transaction becomes the proof of concept for everything that follows. **One real payment is worth more than any pitch deck.**

---

## 9. Guiding Principles

### Sovereignty by architecture

Non-custodial wallets. On-chain fee transparency. Open protocol infrastructure. Every design decision is made to ensure vendors cannot be exploited by Naveen's even if Naveen's wanted to. The architecture enforces ethics. This is not a policy position but a structural constraint baked into the system.

### Customer relationships belong to vendors

The defining feature that separates Naveen's from extractive platform capitalism is not the fee percentage, but that vendors own their customer relationships. A buyer who pays via Naveen's QR code is the vendor's customer, not Naveen's user. This principle is non-negotiable and must be preserved in every future product decision.

### Organic growth over forced scale

Naveen's does not need external investment to operate. Infrastructure cost is marginal. Growth through community networks at the pace those communities can absorb is the right speed for this market. Investor pressure to hit artificial metrics would damage exactly the community trust that is the entire value of the ground operation. Proof of concept first. Scale second. Capital last, if ever.

### Honesty about what this is

Naveen's is an impact business run by a self-funded European developer who intends to earn money. That is not a contradiction. The impact is real because the model only works if vendors genuinely benefit. A vendor who does not benefit stops using it. The profit motive and the social outcome are structurally aligned, not in tension. This must be stated plainly, not hidden behind impact-washing language.

### Proof before narrative

No investor conversation. No press release. Not until the first real transaction is on-chain. The screenshot of that transaction is the only document that matters until it exists.

### Replicability is the mission

The Sri Lanka pilot is a template, not a destination. The same QR sticker, the same x402 infrastructure, the same community-based onboarding model is deployable in Nairobi, Manila, Medellín, or Dhaka. The infrastructure does not change. The community partner changes. DreamSpace prints stickers in Batticaloa today. A different organization does the same in Lagos tomorrow. Building that replicable model correctly in Sri Lanka is the entire purpose of the pilot.

---

## 10. What Success Looks Like

These targets are ambitious but grounded in a flywheel dynamic that most payment network analyses miss: every USDC holder is simultaneously a potential vendor recruiter. A vendor who receives USDC and wants to spend it locally has an immediate incentive to find or create more USDC-accepting vendors. They walk up to a sandwich seller and ask. That sandwich seller wants in. Each new vendor creates new USDC holders among their buyers. Those holders look for more vendors. The network grows from both sides without Naveen's doing anything.

This is how WhatsApp spread — not through top-down marketing but through the self-interest of existing users. The QR sticker is the visible signal that makes the flywheel visible in physical space.

### 30 days

- First live commercial transaction on-chain — proves a real buyer, a real vendor, real USDC
- 10 active vendors with QR stickers deployed in Batticaloa
- Community leader actively sharing her experience within her WhatsApp group

### 90 days

- 500+ active vendors across the Batticaloa region
- At least one identifiable international buyer cohort (diaspora community, returned travelers) actively using the system
- DreamSpace partnership formalized with agreed structure that reflects genuine co-ownership
- First MRR visible from infrastructure fees — however small, it is proof the model is real

### 12 months

- 100,000+ active vendors across Sri Lanka
- Replication conversation underway in at least one additional country
- Naveen's is cash-flow positive from infrastructure fees alone
- DreamSpace is generating meaningful recurring revenue, reducing donor dependency in measurable terms
- At least one documented case of a vendor who left an extractive platform for Naveen's infrastructure

### The vision

> A Tamil-speaking woman in Batticaloa selling handwoven fabric receives payment from a Sri Lankan diaspora buyer in London in under 10 seconds, at a cost of less than $0.05, with no bank account required, no platform taking 30% of her earnings, no company holding her customer relationship hostage, and no possibility of being deplatformed. She owns the sticker. She owns the wallet. She owns the relationship. That is what this is for.

---

*Version 1.1 · February 2026 · This document is the ground truth. Update it when the ground changes.*
