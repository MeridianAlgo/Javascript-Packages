<div align="center">

# MeridianAlgo

### Professional-grade quantitative finance framework for JavaScript & TypeScript

*Institutional-quality algorithmic trading, backtesting, risk management, and portfolio optimization — in a single unified package.*

[![NPM Version](https://img.shields.io/npm/v/meridianalgo.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/meridianalgo)
[![NPM Downloads](https://img.shields.io/npm/dm/meridianalgo.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/meridianalgo)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/node/v/meridianalgo.svg?style=flat-square&color=339933&logo=node.js&logoColor=white)](https://nodejs.org)
[![CI](https://img.shields.io/github/actions/workflow/status/MeridianAlgo/Javascript-Packages/ci.yml?style=flat-square&label=CI)](https://github.com/MeridianAlgo/Javascript-Packages/actions)
[![Tests](https://img.shields.io/badge/tests-66%20passing-brightgreen.svg?style=flat-square)](https://github.com/MeridianAlgo/Javascript-Packages)

[Installation](#installation) · [Quick Start](#quick-start) · [Examples](#examples) · [API](#api-reference) · [Docs](./docs/INDEX.md) · [Changelog](./CHANGELOG.md)

</div>

---

> **🚧 Active Development Notice:** This repository is currently being updated toward **v4.0.0**. The 3.x line is stable and production-ready — pin to a specific 3.x version (e.g. `meridianalgo@^3.9`) if you need API stability while v4 is in flight. v4 will introduce expanded ML, streaming-first indicators, and broader runtime support (Deno, Bun, browser).

---

## Why MeridianAlgo?

Traditional JavaScript trading libraries cover indicators. MeridianAlgo covers the **entire quant stack** in one cohesive, typed, tree-shakable package:

| Capability | What's included |
|---|---|
| **100+ Indicators** | Classic TA (SMA, EMA, RSI, MACD, Bollinger, ATR, Stochastic) + advanced (GARCH, Hurst, VPIN, Kalman, HMM regime detection) |
| **Backtesting** | Event-driven time-based engine with slippage, commission, partial fills, custom cost models |
| **Risk Analytics** | VaR (historical, parametric, Cornish-Fisher), CVaR, stress testing, factor attribution, drawdown, Sharpe, Sortino, Calmar |
| **Portfolio Optimization** | Mean-Variance (Markowitz), Black-Litterman, Risk-Parity, constrained solvers |
| **Strategies** | Mean-reversion, momentum, trend-following, pairs-trading, composer for multi-strategy ensembles |
| **Data Adapters** | Yahoo, Binance, Alpaca, Polygon — pluggable |
| **Execution** | Paper broker, extensible broker adapter interface |
| **ML & Statistics** | Kalman filter, ARIMA, linear regression, feature engineering, fractional differencing, Ornstein-Uhlenbeck |
| **Parameter Search** | Grid search + random search with parallelizable objective functions |
| **Plugin System** | Drop in custom indicators, strategies, data sources, brokers |

**Fully typed.** First-class TypeScript. No `any` in the public surface.
**Zero heavy deps.** Built on native math — only `commander`, `yahoo-finance2`, `tslib` at runtime.
**Node 18+.** ESM + CJS builds. Tree-shakable.

---

## Installation

```bash
npm install meridianalgo
# or
pnpm add meridianalgo
# or
yarn add meridianalgo
```

**Requirements:** Node.js `>=18.0.0`, TypeScript `>=5.0` (for TS users).

---

## Quick Start

### 30-second backtest

```typescript
import { TimeBasedEngine, YahooAdapter, Indicators } from 'meridianalgo';

const data = await new YahooAdapter().ohlcv('AAPL', {
  start: '2023-01-01',
  end: '2024-01-01',
  interval: '1d',
});

const engine = new TimeBasedEngine({
  initialCash: 100_000,
  data,
  strategy: {
    id: 'sma-crossover',
    next: (bar, ctx) => {
      const closes = ctx.history.map((b) => b.c);
      const fast = Indicators.sma(closes, 10).at(-1) ?? 0;
      const slow = Indicators.sma(closes, 30).at(-1) ?? 0;
      return { t: bar.t, value: fast > slow ? 1 : 0 };
    },
  },
});

const result = await engine.run();
console.log(`Return: ${(result.metrics.totalReturn * 100).toFixed(2)}%`);
console.log(`Sharpe: ${result.metrics.sharpeRatio.toFixed(2)}`);
console.log(`Max DD: ${(result.metrics.maxDrawdown * 100).toFixed(2)}%`);
```

---

## Examples

Full runnable examples live in [`examples/`](./examples). Run them with:

```bash
npm run example:basic      # Basic backtest
npm run example:advanced   # Advanced features
npm run example:utils      # Math/stats utilities
npm run example:quant      # Quantitative strategies
npm run example:risk       # Risk management
```

### 1. Technical Indicators

```typescript
import { Indicators } from 'meridianalgo';

const closes = [44, 44.3, 44.1, 44.5, 44.7, 45.1, 45.3, 45.5, 45.9, 46.2, 46.5];

Indicators.sma(closes, 5);     // Simple Moving Average
Indicators.ema(closes, 5);     // Exponential Moving Average
Indicators.rsi(closes, 14);    // Relative Strength Index
Indicators.macd(closes);       // { macd, signal, histogram }
Indicators.bollinger(closes);  // { upper, middle, lower }
Indicators.atr(highs, lows, closes, 14);
Indicators.stochastic(highs, lows, closes, 14);
```

### 2. Advanced Quant Tools

```typescript
import { AdvancedMath, KalmanFilter } from 'meridianalgo';

// Hurst Exponent — detect mean reversion (<0.5) vs trending (>0.5)
const hurst = AdvancedMath.hurstExponent(returns);

// Fractional differencing — stationarity without losing memory
const diffed = AdvancedMath.fractionalDiff(prices, 0.4);

// Ornstein-Uhlenbeck — mean-reversion speed + equilibrium
const { theta, mu, sigma } = AdvancedMath.fitOU(spread);

// Kalman filter — dynamic signal smoothing
const kf = new KalmanFilter({ Q: 1e-5, R: 0.01 });
const smoothed = prices.map((p) => kf.filter(p));
```

### 3. Risk Metrics

```typescript
import { RiskPerformanceMetrics, StressTesting } from 'meridianalgo';

const returns = [0.01, -0.02, 0.015, -0.005, 0.03, -0.01];

RiskPerformanceMetrics.sharpe(returns, 0.02);       // risk-free rate 2%
RiskPerformanceMetrics.sortino(returns, 0.02);
RiskPerformanceMetrics.calmar(returns);
RiskPerformanceMetrics.valueAtRisk(returns, 0.95);  // 95% VaR
RiskPerformanceMetrics.cvar(returns, 0.95);         // Expected Shortfall

StressTesting.historicalScenario(portfolio, '2008-crisis');
StressTesting.monteCarlo(portfolio, { simulations: 10_000, horizon: 252 });
```

### 4. Portfolio Optimization

```typescript
import { MeanVarianceOptimizer, BlackLittermanModel, RiskParityOptimizer } from 'meridianalgo';

// Markowitz mean-variance with target return
const mv = new MeanVarianceOptimizer();
const weights = mv.optimize({
  expectedReturns: [0.08, 0.12, 0.06],
  covariance: covMatrix,
  targetReturn: 0.10,
  constraints: { minWeight: 0, maxWeight: 0.5 },
});

// Black-Litterman — blend market equilibrium with investor views
const bl = new BlackLittermanModel({
  marketCaps: [1e12, 5e11, 3e11],
  riskAversion: 2.5,
});
const posteriorReturns = bl.computePosterior({
  views: [{ assets: [0, 1], weights: [1, -1], expectedReturn: 0.03, confidence: 0.8 }],
});

// Risk parity — equal risk contribution
const rp = new RiskParityOptimizer();
const rpWeights = rp.optimize(covMatrix);
```

### 5. Built-in Strategies

```typescript
import { MeanReversionStrategy, MomentumStrategy, PairsTradingStrategy, StrategyComposer } from 'meridianalgo';

const mr = new MeanReversionStrategy({ lookback: 20, entryZ: 2, exitZ: 0.5 });
const mom = new MomentumStrategy({ lookback: 60, topN: 10 });
const pairs = new PairsTradingStrategy({ lookback: 60, entryZ: 2, exitZ: 0 });

// Combine strategies with weighted voting
const composite = new StrategyComposer([
  { strategy: mr, weight: 0.4 },
  { strategy: mom, weight: 0.6 },
]);
```

### 6. Parameter Optimization

```typescript
import { GridSearchOptimizer } from 'meridianalgo';

const optimizer = new GridSearchOptimizer({
  parameters: {
    fast: [5, 10, 15, 20],
    slow: [30, 50, 100, 200],
  },
  objective: async ({ fast, slow }) => {
    const result = await runBacktest({ fast, slow });
    return result.metrics.sharpeRatio;
  },
});

const best = await optimizer.run();
console.log(`Best params: ${JSON.stringify(best.params)} (Sharpe ${best.score})`);
```

### 7. Custom Data Adapter (Plugin)

```typescript
import { DataAdapter, OHLCVBar } from 'meridianalgo';

export class MyExchangeAdapter implements DataAdapter {
  async ohlcv(symbol: string, opts: { start: string; end: string; interval: string }): Promise<OHLCVBar[]> {
    const response = await fetch(`https://api.myexchange.com/bars?symbol=${symbol}`);
    const json = await response.json();
    return json.bars.map((b: any) => ({
      t: new Date(b.timestamp).getTime(),
      o: b.open, h: b.high, l: b.low, c: b.close, v: b.volume,
    }));
  }
}
```

### 8. Custom Indicator Plugin

```typescript
import { registerIndicator } from 'meridianalgo';

registerIndicator('zscore', (values: number[], lookback = 20) => {
  return values.map((_, i) => {
    if (i < lookback - 1) return NaN;
    const window = values.slice(i - lookback + 1, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / lookback;
    const std = Math.sqrt(window.reduce((s, v) => s + (v - mean) ** 2, 0) / lookback);
    return (values[i] - mean) / std;
  });
});
```

### 9. CLI

```bash
npx meridianalgo backtest --symbol AAPL --start 2023-01-01 --end 2024-01-01 --strategy sma-crossover
npx meridianalgo optimize --strategy momentum --grid config.json
npx meridianalgo analyze --returns returns.csv
```

---

## API Reference

Full surface area documented in [`docs/API.md`](./docs/API.md). Highlights:

### Core Modules

```typescript
import {
  // Indicators
  Indicators, AdvancedMath, KalmanFilter,

  // Data
  YahooAdapter, BinanceAdapter, AlpacaAdapter, PolygonAdapter, DataManager,

  // Backtest
  TimeBasedEngine, CommissionModel, SlippageModel,

  // Strategies
  MeanReversionStrategy, MomentumStrategy, TrendFollowingStrategy,
  PairsTradingStrategy, StrategyComposer, PositionSizer,

  // Risk
  RiskPerformanceMetrics, StressTesting, PerformanceAttribution,

  // Portfolio
  MeanVarianceOptimizer, BlackLittermanModel, RiskParityOptimizer,

  // Optimization
  GridSearchOptimizer, RandomSearchOptimizer,

  // Execution
  PaperBroker,

  // Utils
  MathUtils, StatUtils, TimeUtils,
} from 'meridianalgo';
```

### Documentation index

- [Getting Started](./docs/GETTING-STARTED.md)
- [Quick Start](./docs/QUICK-START.md)
- [API Reference](./docs/API.md)
- [Indicators Catalog](./docs/INDICATORS.md)
- [Strategies Guide](./docs/STRATEGIES.md)
- [Risk Management](./docs/RISK-MANAGEMENT.md)
- [Setup & Development](./docs/SETUP.md)
- [Security](./docs/SECURITY.md)
- [What's Next](./docs/WHATS-NEXT.md)

---

## Project Structure

```text
src/
├── core/         Types, config, logger, plugin registry, errors
├── indicators/   100+ classic + advanced TA (momentum, volatility, volume, ML, microstructure, regime, seasonality)
├── data/         Yahoo, Binance, Alpaca, Polygon adapters + DataManager
├── backtest/     Event-driven TimeBasedEngine + cost models
├── strategies/   Mean-reversion, momentum, trend, pairs, composer, position sizer
├── risk/         Metrics, VaR/CVaR, stress testing, performance attribution
├── portfolio/    Mean-variance, Black-Litterman, risk-parity optimizers
├── execution/    Paper broker + broker adapter interface
├── models/       ARIMA, linear regression, state-space models
├── optimize/     Grid + random parameter search
├── utils/        Math, stats, time utilities
└── cli/          Command-line interface
```

---

## Performance

- **Zero-copy indicator computations** where possible (typed arrays).
- **NaN-padded outputs** for lossless alignment with input series.
- **Streaming-friendly** `TimeBasedEngine` — process millions of bars without loading all in memory.
- **Benchmark:** `Indicators.sma(series, 20)` on 1M bars ≈ 15ms on M1 MBP.

---

## Testing

```bash
npm test              # Run all tests (66 passing)
npm run test:coverage # Coverage report
npm run test:watch    # TDD mode
```

Coverage targets maintained across `core/`, `indicators/`, `backtest/`, `risk/`, `strategies/`, `data/`.

---

## Contributing

Contributions welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

1. Fork and clone
2. `pnpm install`
3. Create a feature branch
4. `npm test && npm run lint`
5. Open a PR with a clear description

---

## License

MIT © 2026 Meridian Algorithmic Research Team. See [LICENSE](./LICENSE).

---

## Disclaimer

**For educational and research purposes only.** Past performance is not indicative of future results. Trading financial markets involves substantial risk of loss. The authors and contributors are not responsible for any financial losses incurred through use of this software. Full text in [DISCLAIMER.md](./DISCLAIMER.md).

---

<div align="center">

**Built by quants, for quants.**

[GitHub](https://github.com/MeridianAlgo/Javascript-Packages) · [npm](https://www.npmjs.com/package/meridianalgo) · [Issues](https://github.com/MeridianAlgo/Javascript-Packages/issues)

</div>
