# MeridianAlgo v2.0 Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (install with `npm install -g pnpm`)

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo and link workspace packages.

### 2. Build All Packages

```bash
pnpm build
```

This builds all packages in the correct dependency order using Turbo.

### 3. Run Example

```bash
pnpm ts-node examples/basic-backtest.ts
```

This runs a complete backtest example using Yahoo Finance data.

## Package-by-Package Setup

If you want to work on individual packages:

```bash
# Build core package
cd packages/core
pnpm build

# Build indicators package
cd packages/indicators
pnpm build

# Build data package
cd packages/data
pnpm build

# Build strategies package
cd packages/strategies
pnpm build

# Build backtest package
cd packages/backtest
pnpm build
```

## Troubleshooting

### pnpm not found

```bash
npm install -g pnpm
```

### Build errors

Make sure to build packages in dependency order:
1. core
2. indicators, data, utils
3. strategies
4. backtest
5. cli

Or just use `pnpm build` from the root which handles this automatically.

### TypeScript errors

Ensure you're using TypeScript 5.3+:

```bash
pnpm add -D typescript@^5.3.3
```

## Development Workflow

### Watch Mode

```bash
# Watch all packages
pnpm dev

# Watch specific package
cd packages/core
pnpm build --watch
```

### Testing

```bash
# Run all tests
pnpm test

# Test specific package
cd packages/core
pnpm test
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
cd packages/core
pnpm lint
```

## Next Steps

1. Read the [README-V2.md](README-V2.md) for framework overview
2. Check out [examples/](examples/) for more usage examples
3. Review the [design document](.kiro/specs/quant-framework-expansion/design.md)
4. Start building your own strategies!

## Current Status

### ✅ Implemented
- Core plugin system
- Data adapters (Yahoo Finance working, others stubbed)
- All existing indicators migrated
- Strategy templates (trend-following, mean-reversion)
- Time-driven backtest engine
- Cost models (commission, slippage)
- Performance metrics
- CLI skeleton

### 🚧 Stub/Planned
- Polygon, Binance, Alpaca adapters (interfaces ready, need API integration)
- Event-driven backtest engine
- Advanced indicators (GARCH, HMM, etc.)
- ML models
- Portfolio optimization
- Live trading
- Visualization
- Parameter optimization

## Getting Help

- Check the [design document](.kiro/specs/quant-framework-expansion/design.md)
- Review [examples/basic-backtest.ts](examples/basic-backtest.ts)
- Open an issue on GitHub
