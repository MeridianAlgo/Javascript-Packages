# MeridianAlgo.js

[![NPM Version](https://img.shields.io/npm/v/meridianalgo.svg)](https://www.npmjs.com/package/meridianalgo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/MeridianAlgo/Javascript-Packages/actions/workflows/ci.yml/badge.svg)](https://github.com/MeridianAlgo/Javascript-Packages/actions)

MeridianAlgo is a professional-grade, high-performance quantitative finance framework for JavaScript and TypeScript. It provides institutional-quality tools for algorithmic trading, backtesting, risk management, and portfolio optimization in a single, unified package.

---

## Key Features

*   High Performance: Native TypeScript implementation optimized for large datasets.
*   Technical Indicators (100+): Classic (SMA, RSI, MACD) to advanced (GARCH, Hurst Exponent, VPIN, Kalman Filter).
*   Backtesting Engine: Realistic time-based simulation with custom commission and slippage models.
*   Risk Management: VaR, CVaR, Stress Testing, and Performance Attribution.
*   Portfolio Optimization: Mean-Variance (Markowitz), Black-Litterman, and Risk Parity.
*   Plugin Architecture: Easily extend the framework with custom data adapters, strategies, and models.
*   Machine Learning: Built-in utilities for feature engineering, regime detection, and state-space models.

---

## Installation

```bash
# Using npm
npm install meridianalgo

# Using pnpm
pnpm add meridianalgo

# Using yarn
yarn add meridianalgo
```

---

## Quick Start

### Basic Backtest

```typescript
import { TimeBasedEngine, Indicators, YahooAdapter } from 'meridianalgo';

async function run() {
  const data = await new YahooAdapter().ohlcv('AAPL', {
    start: '2023-01-01',
    end: '2024-01-01',
    interval: '1d'
  });

  const engine = new TimeBasedEngine({
    initialCash: 100000,
    data,
    strategy: {
      id: 'simple-ema',
      next: (bar) => {
        // Your logic here
        return { t: bar.t, value: 1 };
      }
    }
  });

  const result = await engine.run();
  console.log(`Total Return: ${result.metrics.totalReturn * 100}%`);
}
```

---

## Advanced Quantitative Tools

MeridianAlgo v4.0.0+ includes cutting-edge tools for modern quants:

*   Hurst Exponent: Measure time-series persistence and mean reversion.
*   Fractional Differencing: Achieve stationarity while preserving long-term memory.
*   Ornstein-Uhlenbeck Process: Estimate mean reversion speed and long-term equilibrium.
*   Kalman Filter: Dynamic state estimation and noise reduction for signals.
*   Black-Litterman: Blend market equilibrium with subjective investor views.

---

## Project Structure

The project has been consolidated into a streamlined single-package structure for better performance and easier dependency management:

```text
src/
├── core/         # Core types & Plugin system
├── indicators/   # Classic & Advanced TA Indicators
├── data/         # Adapters (Yahoo, Binance, Alpaca, Polygon)
├── backtest/     # Simulation Engines
├── strategies/   # Templates & Logical Composers
├── risk/         # Metrics (VaR, Sharpe) & Stress Testing
├── portfolio/    # Optimization & Allocation Models
├── execution/    # Order Management & Broker Adapters
└── utils/        # Math, Stats, & Time Utilities
```

---

## Documentation

*   [Quick Start Guide](docs/QUICK-START.md)
*   [API Reference](docs/API.md)
*   [Developer Guide](docs/SETUP.md)
*   [Mathematical Foundations](docs/IMPLEMENTATION-SUMMARY.md)

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

---

## License & Disclaimer

Copyright (c) 2026 Meridian Algorithmic Research Team. Licensed under the MIT License.

DISCLAIMER: This software is for educational and research purposes only. Trading financial markets involves significant risk of loss. Read the full DISCLAIMER before use.
