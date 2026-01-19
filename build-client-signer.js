#!/usr/bin/env node

/**
 * Build script for client-side payment signer
 * Bundles @x402/core and @x402/evm for browser use
 * 
 * NOTE: Requires @x402/core and @x402/evm to be linked via FIX-LINKS.sh first
 */

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

try {
  await build({
    entryPoints: [join(__dirname, 'lib/payment/client-signer.js')],
    bundle: true,
    outfile: join(__dirname, 'public/client-signer.bundle.js'),
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    minify: isProduction,
    sourcemap: !isProduction,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    external: [], // Bundle everything - we want all dependencies included
    logLevel: 'info',
    resolveExtensions: ['.js', '.mjs', '.ts', '.tsx'],
    // esbuild automatically follows symlinks in node_modules
  });
  
  console.log('✅ Client-side signer bundled successfully');
  console.log(`   Output: public/client-signer.bundle.js`);
  console.log(`   Mode: ${isProduction ? 'production' : 'development'}`);
} catch (error) {
  console.error('❌ Failed to bundle client-side signer:', error);
  process.exit(1);
}
