#!/usr/bin/env node

/**
 * Build script for client-side payment signer
 * Bundles @x402/core and @x402/evm for browser use
 * 
 * NOTE: Requires @x402/core and @x402/evm to be linked via FIX-LINKS.sh first
 * If packages are not available (e.g., on Vercel), the script will skip building
 * if a bundle already exists.
 */

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, statSync } from 'fs';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const bundlePath = join(__dirname, 'public/client-signer.bundle.js');
const entryPoint = join(__dirname, 'lib/payment/client-signer.js');

// Check if bundle exists and is recent
function bundleExistsAndRecent() {
  if (!existsSync(bundlePath)) {
    return false;
  }
  
  // Check if bundle is newer than source file
  try {
    const bundleStat = statSync(bundlePath);
    const entryStat = statSync(entryPoint);
    return bundleStat.mtime > entryStat.mtime;
  } catch (error) {
    return false;
  }
}

try {
  // If bundle exists and is recent, skip building (useful when packages aren't available)
  if (bundleExistsAndRecent() && !process.env.FORCE_REBUILD) {
    console.log('✅ Using existing bundle (skip build)');
    console.log(`   Bundle: public/client-signer.bundle.js`);
    console.log(`   (Set FORCE_REBUILD=1 to force rebuild)`);
    process.exit(0);
  }

  await build({
    entryPoints: [entryPoint],
    bundle: true,
    outfile: bundlePath,
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
  // If build fails and bundle exists, warn but don't fail (for Vercel deployments)
  if (existsSync(bundlePath)) {
    console.warn('⚠️  Build failed, but using existing bundle');
    console.warn(`   Error: ${error.message}`);
    console.warn(`   Bundle: public/client-signer.bundle.js (existing)`);
    process.exit(0); // Don't fail the build if bundle exists
  } else {
    console.error('❌ Failed to bundle client-side signer:', error);
    console.error('   Bundle does not exist and cannot be built.');
    console.error('   Make sure @x402/core and @x402/evm are linked or published to npm.');
    process.exit(1);
  }
}
