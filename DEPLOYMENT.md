# Deployment Guide

## Recommended: Railway

Railway is the recommended hosting platform for this app. It runs the Express server as a persistent process with a mounted volume for SQLite — no database layer rewrite needed, no ephemeral filesystem surprises.

**Cost:** ~$5–8/month at low volume. Scales with actual resource usage.

---

## Prerequisites

- A [Railway account](https://railway.app) (sign up with GitHub)
- Your GitHub repo pushed and up to date
- A real USDC wallet address on Base Mainnet for production

---

## Step 1 — Create a Railway project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **Deploy from GitHub repo**
3. Select this repository
4. Railway will detect `railway.json` and use `node server.js` as the start command — no build step needed (bundles are committed)

---

## Step 2 — Add a persistent volume

The SQLite database must survive deploys and restarts.

1. In your Railway project, go to your service → **Volumes**
2. Click **Add Volume**
3. Set mount path: `/data`
4. Railway will persist everything written to `/data` across deploys

---

## Step 3 — Set environment variables

In Railway dashboard → your service → **Variables**, add:

### Required

| Variable | Value |
|----------|-------|
| `DATABASE_PATH` | `/data/naveens.sqlite` |
| `X402_MODE` | `coinbase` |
| `FACILITATOR_URL` | `https://facilitator.coinbase.com` |
| `NETWORK` | `eip155:8453` (Base Mainnet) |
| `DRIVER_USDC_WALLET` | Your real Base Mainnet wallet address |
| `BASE_URL` | Your Railway domain e.g. `https://naveens.up.railway.app` |
| `NODE_ENV` | `production` |

### Strongly recommended

| Variable | Value |
|----------|-------|
| `ADMIN_SECRET` | A strong random string — protects `/admin` |
| `PLATFORM_FEE_BPS` | `100` (= 1%) |
| `PLATFORM_FEE_WALLET` | Your platform wallet address on Base Mainnet |

### Optional

| Variable | Value |
|----------|-------|
| `DRIVER_NAME` | `Naveen` |
| `DRIVER_CITY` | `Batticaloa` |
| `DRIVER_COUNTRY` | `Sri Lanka` |
| `DRIVER_PHONE` | `+94...` |
| `DRIVER_WHATSAPP` | `+94...` |
| `LKR_PER_USDC` | `300` (update to match current rate) |
| `NAVEEN_MANAGE_TOKEN` | Set this to keep Naveen's manage token stable across redeploys |

---

## Step 4 — Deploy

Railway deploys automatically when you push to your connected branch. First deploy happens immediately after adding variables.

Watch the deploy logs in Railway dashboard to confirm:

```
Server running at https://your-app.up.railway.app
Payment mode: x402-coinbase
Multi-tenant mode active — register at https://your-app.up.railway.app/
Seeded default tenant: /p/naveen
```

---

## Step 5 — Custom domain (optional)

1. Railway dashboard → your service → **Settings** → **Domains**
2. Add your custom domain (e.g. `pay.naveens.lk`)
3. Follow the DNS instructions (CNAME record)
4. Update `BASE_URL` env var to match your custom domain

---

## Step 6 — Verify

| Check | URL |
|-------|-----|
| Health | `https://your-domain/health` |
| Registration page | `https://your-domain/` |
| Naveen's page | `https://your-domain/p/naveen` |
| Admin panel | `https://your-domain/admin?secret=YOUR_ADMIN_SECRET` |
| Naveen's QR | `https://your-domain/api/p/naveen/qr` |

---

## Ongoing operations

### Updating the app

```bash
git push origin multi-tenant
```

Railway picks up the push and redeploys automatically. The SQLite volume persists — no data loss.

### Backing up the database

Railway volumes are persistent but not automatically backed up offsite. For production, set up [Litestream](https://litestream.io) to continuously replicate the SQLite file to an S3-compatible bucket (Cloudflare R2 is free for small volumes).

Basic Litestream config (`litestream.yml`):

```yaml
dbs:
  - path: /data/naveens.sqlite
    replicas:
      - url: s3://your-bucket/naveens.sqlite
```

Run Litestream alongside the server by changing `Procfile` to:

```
web: litestream replicate -exec "node server.js" /data/naveens.sqlite s3://your-bucket/naveens.sqlite
```

### Checking logs

Railway dashboard → your service → **Deployments** → click any deploy → **View Logs**

Or install the Railway CLI:

```bash
npm install -g @railway/cli
railway login
railway logs
```

### Inspecting the database

SSH into Railway is not available on the hobby plan. To inspect the database:

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway run sqlite3 /data/naveens.sqlite "SELECT * FROM businesses;"
```

Or use the admin panel at `/admin` for a visual overview.

---

## Testnet vs Mainnet

| | Testnet | Mainnet |
|--|---------|---------|
| `NETWORK` | `eip155:84532` | `eip155:8453` |
| `FACILITATOR_URL` | `https://x402.org/facilitator` | `https://facilitator.coinbase.com` |
| `X402_MODE` | `coinbase` | `coinbase` |
| Real money | No | Yes |

Run testnet for staging/QA. Switch to mainnet when going live.

---

## Scaling

SQLite on a single Railway instance comfortably handles hundreds of thousands of transactions per month. When you approach the following thresholds, consider migrating to Postgres:

- Sustained >1,000 concurrent users
- Database file >10 GB
- Write latency becoming a user-visible issue

The payment abstraction layer (`lib/payment/`) is already decoupled. The database layer (`lib/db.js`, `lib/businesses.js`) would need to be rewritten for Postgres, but no app-layer code changes are required.

---

## Alternative: Vercel (not recommended for this app)

Vercel's filesystem is ephemeral — SQLite data is lost between function invocations. Using Vercel requires replacing `better-sqlite3` with a remote database (Turso, Neon, PlanetScale), which means rewriting the entire DB layer to async. Railway avoids this entirely.

If you specifically need Vercel, migrate the DB layer to [Turso](https://turso.tech) (remote SQLite, free tier, minimal API changes) and update all DB calls in `lib/businesses.js` to `async/await`.
