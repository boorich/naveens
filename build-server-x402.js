#!/usr/bin/env node

/**
 * Build script for server-side x402 coinbase provider
 * Bundles @x402/core/server and @x402/evm/server for serverless deployment
 * 
 * NOTE: Requires @x402/core and @x402/evm to be linked via FIX-LINKS.sh first
 */

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const bundlePath = join(__dirname, 'lib/x402/coinbase.bundle.js');
const entryPoint = join(__dirname, 'lib/x402/coinbase.js');

// Check if bundle exists and is recent
function bundleExistsAndRecent() {
  if (!existsSync(bundlePath)) {
    return false;
  }
  
  try {
    const bundleStat = statSync(bundlePath);
    const entryStat = statSync(entryPoint);
    return bundleStat.mtime > entryStat.mtime;
  } catch (error) {
    return false;
  }
}

try {
  // If bundle exists and is recent, skip building
  if (bundleExistsAndRecent() && !process.env.FORCE_REBUILD) {
    console.log('✅ Using existing server bundle (skip build)');
    console.log(`   Bundle: lib/x402/coinbase.bundle.js`);
    console.log(`   (Set FORCE_REBUILD=1 to force rebuild)`);
    process.exit(0);
  }

  await build({
    entryPoints: [entryPoint],
    bundle: true,
    outfile: bundlePath,
    format: 'esm',
    platform: 'node',
    target: ['node18'],
    minify: false, // Don't minify server code for easier debugging
    sourcemap: !isProduction,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    external: ['express', 'dotenv'], // Don't bundle Express, it's a regular dependency
    logLevel: 'info',
    resolveExtensions: ['.js', '.mjs', '.ts', '.tsx'],
    banner: {
      js: `// Bundled server-side x402 coinbase provider\n// Includes @x402/core/server and @x402/evm/exact/server\n`,
    },
  });
  
  console.log('✅ Server-side x402 provider bundled successfully');
  console.log(`   Output: lib/x402/coinbase.bundle.js`);
  console.log(`   Mode: ${isProduction ? 'production' : 'development'}`);
} catch (error) {
  // If build fails and bundle exists, warn but don't fail
  if (existsSync(bundlePath)) {
    console.warn('⚠️  Build failed, but using existing bundle');
    console.warn(`   Error: ${error.message}`);
    console.warn(`   Bundle: lib/x402/coinbase.bundle.js (existing)`);
    process.exit(0);
  } else {
    console.error('❌ Failed to bundle server-side x402 provider:', error);
    console.error('   Bundle does not exist and cannot be built.');
    console.error('   Make sure @x402/core and @x402/evm are linked or published to npm.');
    process.exit(1);
  }
}
