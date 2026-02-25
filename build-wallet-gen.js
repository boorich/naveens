#!/usr/bin/env node
/**
 * Builds a tiny browser bundle for in-browser wallet generation.
 * Only depends on viem/accounts — no x402 packages needed.
 * Output: public/wallet-gen.bundle.js
 */
import { build } from 'esbuild';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [join(__dirname, 'lib/wallet-gen.js')],
  bundle: true,
  outfile: join(__dirname, 'public/wallet-gen.bundle.js'),
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  minify: process.env.NODE_ENV === 'production',
  logLevel: 'info',
});

console.log('✅ Wallet generation bundle built: public/wallet-gen.bundle.js');
