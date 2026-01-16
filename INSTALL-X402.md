# Installing x402 Packages

The `@x402/core` and `@x402/evm` packages need to be linked from the x402 workspace.

## Option 1: npm link (Recommended)

```bash
# Link core package
cd /Users/martinmaurer/Projects/Martin/x402/typescript/packages/core
npm link

cd /Users/martinmaurer/Projects/Martin/x402/typescript/packages/mechanisms/evm
npm link

# Link them in naveens_tuktuk
cd /Users/martinmaurer/Projects/Martin/dreamspace/x402_projects/naveens_tuktuk
npm link @x402/core @x402/evm
```

## Option 2: Use file: paths in package.json

Update `package.json` dependencies to:
```json
"@x402/core": "file:../../x402/typescript/packages/core",
"@x402/evm": "file:../../x402/typescript/packages/mechanisms/evm"
```

Then run `npm install`.

## Option 3: Build packages first

If packages need building:
```bash
cd /Users/martinmaurer/Projects/Martin/x402/typescript/packages/core
npm run build

cd /Users/martinmaurer/Projects/Martin/x402/typescript/packages/mechanisms/evm  
npm run build
```

Then link as in Option 1.
