# Naveen's TukTuk - Payment Page

A minimal, production-ready payment page for TukTuk drivers in Sri Lanka, enabling digital payment settlement using x402 protocol.

## Features

- Mobile-first payment interface
- x402 payment integration (mock mode by default)
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

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` with your driver information and wallet address

4. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

## Configuration

All configuration is done via environment variables in `.env`. See `.env.example` for all available options.

### Payment Mode

- `X402_MODE=mock` - Simulated payments (default, for testing)
- `X402_MODE=coinbase` - Real x402 payments via Coinbase facilitator (requires additional config)

## Project Structure

```
/server.js              # Express server
/public/
  index.html            # Main page
  styles.css            # Styles
  app.js                # Client-side JavaScript
/lib/
  x402/
    adapter.js          # Payment adapter router
    mock.js             # Mock payment provider
    coinbase.js         # Coinbase payment provider
```

## Deployment

This app can be deployed to any VPS, cloud VM, or on-prem box that supports Node.js. Simply:

1. Clone the repository
2. Install dependencies (`npm install`)
3. Configure `.env` file
4. Start the server (`npm start`)

For production, consider using a process manager like PM2.

## License

ISC
