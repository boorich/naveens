# Setup with npm link (Alternative)

If `file:` paths don't work, use `npm link`:

## 1. Build x402 packages (if not done)

```bash
cd /Users/martinmaurer/Projects/Martin/x402/typescript
pnpm install
pnpm --filter @x402/core build
pnpm --filter @x402/evm build
```

## 2. Link packages globally

```bash
# Link core
cd /Users/martinmaurer/Projects/Martin/x402/typescript/packages/core
npm link

# Link evm
cd /Users/martinmaurer/Projects/Martin/x402/typescript/packages/mechanisms/evm
npm link
```

## 3. Link in naveens_tuktuk

```bash
cd /Users/martinmaurer/Projects/Martin/dreamspace/x402_projects/naveens_tuktuk
npm link @x402/core @x402/evm
npm install  # Install other deps (express, dotenv, qrcode)
```

## 4. Update package.json

Remove the `file:` paths and the packages will come from the global links:

```json
"dependencies": {
  "express": "^4.18.2",
  "dotenv": "^16.4.7",
  "qrcode": "^1.5.3"
}
```

The `@x402/core` and `@x402/evm` will be linked globally, not listed in package.json.
