# Community service (multi-tenant) mode

Run one instance of the server so many drivers or businesses can use it. Each gets a **slug** and a payment page; funds go to their own wallet.

## When to use

- **Community instance:** You host one server; others sign up and get a link like `https://yoursite.com/p/naveen`. No need for everyone to run their own server.
- **Self-hosted:** Each person runs the app themselves and uses env vars (no DB). See main [README.md](README.md).

## Setup

1. **Install dependencies** (includes `better-sqlite3` for the DB):
   ```bash
   npm install
   ```

2. **Set environment variables:**
   ```bash
   # Path to SQLite file (created if missing)
   export DATABASE_PATH=./data/naveens.sqlite

   # Optional: enable multi-tenant explicitly (otherwise enabled when DATABASE_PATH is set)
   export MULTI_TENANT=1

   # Optional: protect registration and list with a secret header
   export ADMIN_SECRET=your-secret-token
   ```

3. **Create the DB directory** (if you use a path with a folder):
   ```bash
   mkdir -p data
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

5. **Register a business** (driver/seller) so they get a page:
   ```bash
   curl -X POST http://localhost:4021/api/businesses \
     -H "Content-Type: application/json" \
     -H "X-Admin-Secret: your-secret-token" \
     -d '{
       "slug": "naveen",
       "driverWallet": "0x1234...",
       "driverName": "Naveen",
       "driverCity": "Batticaloa",
       "driverCountry": "Sri Lanka",
       "lkrPerUsdc": 300
     }'
   ```

   If you didn’t set `ADMIN_SECRET`, omit the `X-Admin-Secret` header.

6. **Use the payment page:**  
   Open `http://localhost:4021/p/naveen`. That page uses Naveen’s wallet and LKR rate; payments go to the wallet you set for that slug.

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/config` | Single-tenant config (env). |
| `POST /api/pay` | Single-tenant pay (env). |
| `GET /api/p/:slug/config` | Config for that slug (from DB). |
| `POST /api/p/:slug/pay` | Pay that slug (funds to their wallet). |
| `GET /p/:slug` | Payment page for that slug. |
| `POST /api/businesses` | Register a business (optional `X-Admin-Secret`). |
| `GET /api/businesses` | List slugs (optional `X-Admin-Secret`). |
| `GET /health` | Returns `{ status: 'ok', multiTenant: true/false }`. |

## Adding endpoints (more routes)

The server is a single Express app in `server.js`. To add endpoints:

- **Single-tenant:** Add `app.get('/api/...', ...)` or `app.post('/api/...', ...)` in `server.js`.
- **Multi-tenant:** Slug-specific logic is under `/api/p/:slug`; add handlers on the `slugRouter` (see the “Multi-tenant (community) mode” block in `server.js`).

For a larger app you can split routes into files under e.g. `routes/` and mount them in `server.js`.

## Database

- **Schema:** One table, `businesses`, with: `slug`, `driver_wallet`, `driver_name`, `driver_city`, `driver_country`, `lkr_per_usdc`, `created_at`.
- **Location:** Set by `DATABASE_PATH` (file path). Default: not set (multi-tenant off).
- **Backups:** Copy the SQLite file. No migrations yet; schema is created on first use.

## GitHub and self-hosting

This repo is the **self-hostable** version: clone it, set env vars, run. No DB required for single-tenant.

The **community service** is the same codebase with `DATABASE_PATH` (and optionally `MULTI_TENANT=1`) set. You can deploy that to a VPS, Railway, Render, etc., and share the base URL so others use `/p/:slug` links. Power users can still run their own instance from this repo with only env-based config.
