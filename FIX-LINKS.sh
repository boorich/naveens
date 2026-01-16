#!/bin/bash

# Fix npm links for @x402 packages
# This script creates symlinks manually since npm link has permission issues

echo "🔗 Linking @x402/core and @x402/evm packages..."

# Ensure global links exist first
cd /Users/martinmaurer/Projects/Martin/x402/typescript/packages/core
if [ ! -L ~/.nvm/versions/node/v22.14.0/lib/node_modules/@x402/core ]; then
  npm link 2>/dev/null || echo "⚠️  npm link failed (permissions), but continuing..."
fi

cd /Users/martinmaurer/Projects/Martin/x402/typescript/packages/mechanisms/evm
if [ ! -L ~/.nvm/versions/node/v22.14.0/lib/node_modules/@x402/evm ]; then
  npm link 2>/dev/null || echo "⚠️  npm link failed (permissions), but continuing..."
fi

# Step 2: Create symlinks manually in naveens_tuktuk (works even if npm link fails)
cd /Users/martinmaurer/Projects/Martin/dreamspace/x402_projects/naveens_tuktuk

# Ensure node_modules/@x402 directory exists
mkdir -p node_modules/@x402

# Create symlinks manually (this works even when npm link has permission issues)
GLOBAL_NODE_MODULES="$HOME/.nvm/versions/node/v22.14.0/lib/node_modules"

if [ -d "$GLOBAL_NODE_MODULES/@x402/core" ]; then
  ln -sf "$GLOBAL_NODE_MODULES/@x402/core" node_modules/@x402/core
  echo "✅ Created symlink for @x402/core"
else
  echo "❌ Global @x402/core not found at $GLOBAL_NODE_MODULES/@x402/core"
fi

if [ -d "$GLOBAL_NODE_MODULES/@x402/evm" ]; then
  ln -sf "$GLOBAL_NODE_MODULES/@x402/evm" node_modules/@x402/evm
  echo "✅ Created symlink for @x402/evm"
else
  echo "❌ Global @x402/evm not found at $GLOBAL_NODE_MODULES/@x402/evm"
fi

# Step 3: Verify
if [ -L "node_modules/@x402/core" ] || [ -d "node_modules/@x402/core" ]; then
  echo "✅ @x402/core found in node_modules"
else
  echo "❌ @x402/core NOT found in node_modules"
fi

if [ -L "node_modules/@x402/evm" ] || [ -d "node_modules/@x402/evm" ]; then
  echo "✅ @x402/evm found in node_modules"
else
  echo "❌ @x402/evm NOT found in node_modules"
fi

echo ""
echo "Done! Try starting the server now."
