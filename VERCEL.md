# Deploying to Vercel

## Prerequisites

1. **Vercel account** - Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional, for local testing):
   ```bash
   npm install -g vercel
   ```

## Important: x402 Package Dependencies

**This project uses local x402 packages** (`@x402/core`, `@x402/evm`) that are linked via `npm link` or `file:` paths.

**For Vercel deployment, you have two options:**

### Option 1: Publish x402 Packages (Recommended)

If the x402 packages are published to npm:
- Vercel will install them automatically
- No special configuration needed

### Option 2: Bundle Dependencies

If x402 packages are not published, you'll need to:
1. Bundle the server code with dependencies
2. Or use Vercel's build process to handle local packages

**Note:** The `FIX-LINKS.sh` script won't work on Vercel's build environment. You'll need to ensure x402 packages are available via npm or bundled.

## Environment Variables

Set these in Vercel dashboard (Settings → Environment Variables):

**Required:**
- `DRIVER_USDC_WALLET` - Your Base Sepolia wallet address (0x...)
- `X402_MODE` - Set to `coinbase` for real payments, or `mock` for testing

**Optional:**
- `FACILITATOR_URL` - Default: `https://x402.org/facilitator` (testnet)
- `NETWORK` - Default: `eip155:84532` (Base Sepolia)
- `TEST_PRIVATE_KEY` - For test payments (optional)
- `PORT` - Not needed on Vercel (auto-assigned)
- `BASE_URL` - Your Vercel deployment URL (auto-set by Vercel)

## Deployment Steps

### Via Vercel Dashboard (Recommended - Easiest)

**If your GitHub account is already linked to Vercel:**

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. Go to [vercel.com/new](https://vercel.com/new)

3. Import your repository (Vercel will auto-detect it if your GitHub is linked)

4. Vercel will auto-detect settings from `vercel.json`:
   - Framework: Auto-detected
   - Build Command: `npm run build` (runs `build:signer:prod`)
   - Output Directory: Auto-detected (serverless functions)

5. Add environment variables:
   - Click "Environment Variables" in project settings
   - Add: `DRIVER_USDC_WALLET`, `X402_MODE`, etc. (see above)

6. Click "Deploy"

**That's it!** Vercel will build and deploy automatically. Future pushes to your main branch will auto-deploy.

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (first time - will prompt for configuration)
vercel

# Deploy to production
vercel --prod
```

## Static Files

Static files in `public/` are automatically served by Vercel.

**Important:** Make sure `public/client-signer.bundle.js` is built before deploying:
```bash
npm run build:signer:prod
```

Or add it to your build command in Vercel settings.

## API Routes

API routes (`/api/pay`, `/api/test-pay`, `/api/config`) are handled as serverless functions.

**Note:** Vercel has execution time limits:
- Hobby plan: 10 seconds
- Pro plan: 60 seconds

Payment processing should complete within these limits. If not, consider:
- Optimizing payment processing
- Using Vercel Pro plan
- Moving to a different hosting solution

## Custom Domain

1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### "Cannot find module '@x402/core'"

**Problem:** x402 packages aren't available in Vercel's build environment.

**Solutions:**
1. Publish x402 packages to npm
2. Bundle dependencies in build step
3. Use a different deployment method (VPS, Railway, etc.)

### "Module not found" errors

Make sure all dependencies are in `package.json` (not just devDependencies for production builds).

### Static files not loading

Check that `public/` directory is being served correctly. Vercel should handle this automatically, but verify in Vercel dashboard → Settings → General.

## Alternative: VPS Deployment

If Vercel doesn't work due to x402 package dependencies, consider:
- **Railway** - Similar to Vercel, supports Docker
- **Render** - Free tier, supports Node.js
- **DigitalOcean App Platform** - Simple deployment
- **Traditional VPS** - Full control, use `npm link` or `file:` paths

See main README.md for VPS deployment instructions.