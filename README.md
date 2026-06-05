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
[![Tests](https://img.shields.io/badge/tests-258%20passing-brightgreen.svg?style=flat-square)](https://github.com/MeridianAlgo/Javascript-Packages)
[![Coverage](https://img.shields.io/badge/coverage-80%25%2B-brightgreen.svg?style=flat-square)](https://github.com/MeridianAlgo/Javascript-Packages)
[![Bundle](https://img.shields.io/bundlephobia/minzip/meridianalgo?style=flat-square&label=minzip)](https://bundlephobia.com/package/meridianalgo)

[Installation](#installation) · [Quick Start](#quick-start) · [Examples](#examples) · [API](#api-reference) · [Docs](./docs/INDEX.md) · [Changelog](./CHANGELOG.md)

</div>

---

> **Active Development Notice:** This repository is currently being updated toward **v4.0.0**. The 3.x line is stable and production-ready — pin to a specific 3.x version (e.g. `meridianalgo@^3.12`) if you need API stability while v4 is in flight. v4 will introduce expanded ML, streaming-first indicators, and broader runtime support (Deno, Bun, browser).

---

## Why MeridianAlgo?

Traditional JavaScript trading libraries cover indicators. MeridianAlgo covers the **entire quant stack** in one cohesive, typed, tree-shakable package:

| Capability | What's included |
|---|---|
| **100+ Indicators** | Classic TA (SMA, EMA, RSI, MACD, Bollinger, ATR, Stochastic) + advanced (Ichimoku, Supertrend, Connors RSI, Fisher, Coppock, Aroon, Donchian, Keltner, Mass Index, Choppiness, Elder Ray, Pivot Points) |
| **Candlestick Patterns** | 15 detectors: doji, hammer, shooting star, engulfing, morning/evening star, three soldiers/crows, marubozu, spinning top, piercing, dark cloud cover, tweezers + `detectAllPatterns` aggregator |
| **Streaming Indicators** | `StreamingSMA`/`EMA`/`RSI`/`MACD`/`Bollinger` with `nextValue`/`replace`/`reset` for real-time tick processing |
| **Backtesting** | Event-driven time-based engine with slippage, commission, partial fills, custom cost models |
| **Risk Analytics** | VaR (historical, parametric, Cornish-Fisher), CVaR / modified Expected Shortfall, GARCH(1,1), range volatility, stress testing, drawdown, Sharpe, Sortino, Calmar, **Adjusted Sharpe (Pézier-White)**, tail ratio, Information Ratio, Tracking Error, Active Share, up/down capture |
| **Portfolio Optimization** | Mean-Variance (Markowitz), Black-Litterman, **Hierarchical Risk Parity (HRP)**, Risk-Parity, **Kelly criterion** (discrete/continuous/multi-asset/fractional), constrained solvers |
| **Performance Attribution** | **Brinson-Hood-Beebower** (allocation/selection/interaction), **CAPM**, **Fama-French 3/5-factor** OLS regression, custom multi-factor models |
| **Stochastic Models** | GBM, Heston (stochastic vol), CIR, Merton jump-diffusion, Ornstein-Uhlenbeck, Monte Carlo |
| **Options Pricing** | Black-Scholes, implied vol (Brent solver), full Greeks (Δ/Γ/Θ/Vega/Ρ), **higher-order Greeks** (vanna/charm/vomma/veta/speed/zomma/color/ultima/dual Δ·Γ), option chains |
| **Fixed Income** | TVM (NPV/IRR/PMT/PV/FV), bond pricing, duration, convexity, yield curves (bootstrap, Nelson-Siegel) |
| **Credit** | CDS pricing, hazard-rate bootstrap, Z-spread, default probability |
| **Execution Algorithms** | VWAP, TWAP, POV, **Almgren-Chriss** Implementation Shortfall closed-form |
| **Microstructure** | Order book mid/microprice/imbalance, quoted/effective/realized/Roll spreads, square-root + Almgren-Chriss market impact |
| **Wealth Protection** | **CPPI** (fixed floor) and **TIPP** (ratcheting floor) dynamic strategies |
| **Strategies** | Mean-reversion, momentum, trend-following, pairs-trading, composer for multi-strategy ensembles |
| **Data Adapters** | Yahoo, Binance, Alpaca, Polygon — pluggable |
| **Execution Brokers** | Paper broker, extensible broker adapter interface |
| **Machine Learning** | Pure-JS LSTM/GRU forward pass, walk-forward CV (expanding/rolling), feature engineering, **Gaussian HMM** (Baum-Welch + Viterbi) for regime detection, Kalman filter, ARIMA, linear regression, fractional differencing |
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
npm run example:greeks     # Higher-order Greeks & tail-risk analytics
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
import { RiskMetrics, RiskPerformanceMetrics, StressTesting } from 'meridianalgo';

const returns = [0.01, -0.02, 0.015, -0.005, 0.03, -0.01];
const equity = [100, 101, 98.98, 100.47, 99.97, 102.97, 101.94];

// Risk-adjusted performance (annualized by default)
RiskPerformanceMetrics.sharpeRatio(returns, 0.02);    // risk-free rate 2%
RiskPerformanceMetrics.sortinoRatio(returns, 0.02);
RiskPerformanceMetrics.calmarRatio(returns, equity);  // needs the equity curve

// Tail risk
RiskMetrics.var(returns, 0.95, 'historical');         // 95% Value at Risk
RiskMetrics.cvar(returns, 0.95);                       // Expected Shortfall

// Stress testing on a positions portfolio
const portfolio = [{ symbol: 'AAPL', qty: 100, avgPrice: 180 }];
StressTesting.scenario(portfolio, { AAPL: -0.20 });   // apply a -20% shock
StressTesting.historical(portfolio, {
  date: new Date('2008-09-15'),
  returns: { AAPL: -0.30 },
});
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

### 9. Hierarchical Risk Parity (HRP)

Lopez de Prado's clustering-based allocation. No matrix inversion — robust on near-singular covariance.

```typescript
import { hrpAllocate } from 'meridianalgo';

// returns: rows = time, cols = assets
const { weights, order } = hrpAllocate({ returns });
console.log('HRP weights:', weights);  // sums to 1
```

### 10. Kelly Criterion

```typescript
import { kellyBet, kellyContinuous, kellyMultiAsset, fractionalKelly } from 'meridianalgo';

// Discrete bet: 60% win, 2:1 payoff
const f = kellyBet({ winProb: 0.6, winPayoff: 2, lossPayoff: 1 });

// Continuous (Merton): expected return / variance
const fc = kellyContinuous({ mu: 0.10, sigma: 0.20, riskFree: 0.02 });

// Multi-asset: Σ⁻¹(μ − r·1)
const w = kellyMultiAsset({ expectedReturns, covariance, riskFree: 0.02 });

// Fractional (half-Kelly is industry standard for live trading)
const safe = fractionalKelly(f, 0.5);
```

### 11. Brinson Performance Attribution

```typescript
import { brinsonAttribution } from 'meridianalgo';

const result = brinsonAttribution({
  segments: [
    { name: 'Tech',     portfolioWeight: 0.40, benchmarkWeight: 0.30, portfolioReturn: 0.15, benchmarkReturn: 0.12 },
    { name: 'Energy',   portfolioWeight: 0.20, benchmarkWeight: 0.25, portfolioReturn: 0.08, benchmarkReturn: 0.10 },
    { name: 'Finance',  portfolioWeight: 0.40, benchmarkWeight: 0.45, portfolioReturn: 0.06, benchmarkReturn: 0.07 },
  ],
});
console.log(result.totals);
// { allocation, selection, interaction, totalActive }
```

### 12. Factor Models (CAPM / Fama-French)

```typescript
import { capmRegression, famaFrench3, famaFrench5 } from 'meridianalgo';

const capm = capmRegression({ portfolioReturns, marketReturns, riskFree: rfSeries });
console.log(`α=${capm.alpha.toFixed(4)} β=${capm.betas[0].toFixed(2)} R²=${capm.rSquared.toFixed(2)}`);

const ff3 = famaFrench3({
  portfolioReturns, marketReturns, smb, hml, riskFree: rfSeries,
});
// { alpha, betas: [Mkt-RF, SMB, HML], rSquared, residualStdError, n }
```

### 13. Execution Algorithms — VWAP/TWAP/POV/Almgren-Chriss

```typescript
import {
  vwapSchedule, twapSchedule, povSchedule, implementationShortfallSchedule,
} from 'meridianalgo';

const totalQty = 100_000;

const vwap = vwapSchedule({
  totalQty,
  volumeProfile: [0.05, 0.15, 0.20, 0.10, 0.08, 0.07, 0.08, 0.10, 0.12, 0.05],
});

const twap = twapSchedule({ totalQty, buckets: 10 });

const pov = povSchedule({
  totalQty,
  participation: 0.10,
  marketVolume: forecastVolume,
});

// Almgren-Chriss optimal IS: x_k = X·sinh(κ(T−t_k))/sinh(κT), κ=√(λσ²/η)
const isq = implementationShortfallSchedule({
  totalQty, buckets: 10,
  sigma: 0.20, riskAversion: 1e-6,
  gamma: 1e-7, eta: 1e-6,
});

isq.forEach(s => console.log(`bucket ${s.index}: ${Math.round(s.qty)}`));
```

### 14. Order-Book Microstructure

```typescript
import { OrderBook, rollSpread, squareRootImpact } from 'meridianalgo';

const ob = new OrderBook({
  bids: [{ price: 99.95, size: 1000 }, { price: 99.90, size: 500 }],
  asks: [{ price: 100.05, size: 800 }, { price: 100.10, size: 600 }],
});
console.log('Mid:', ob.midPrice());
console.log('Microprice:', ob.microprice());     // size-weighted mid
console.log('Imbalance:', ob.imbalance());       // (bidSize − askSize) / total

// Roll (1984) effective spread from trade prices
const spread = rollSpread(tradePrices);

// Almgren-Chriss square-root impact: c·σ·√(Q/ADV)
const cost = squareRootImpact({ qty: 50_000, adv: 1_000_000, sigma: 0.20, c: 0.5 });
```

### 15. Streaming Indicators (Real-Time Ticks)

```typescript
import { StreamingMACD, StreamingBollinger } from 'meridianalgo';

const macd = new StreamingMACD(12, 26, 9);
const bb = new StreamingBollinger(20, 2);

ws.on('tick', ({ price }) => {
  const m = macd.nextValue(price);
  const b = bb.nextValue(price);
  if (m && price > b.upper) signalShort();
});

// Mid-bar revisions: replace() snapshots prior state, no compounding
macd.replace(correctedPrice);
```

### 16. Pure-JS ML — LSTM/GRU + HMM Regime Detection

Zero-dep ML primitives. No tfjs, no native bindings — runs in Node, Deno, Bun, browser.

```typescript
import {
  LSTMCell, GRUCell, randomLSTMWeights,
  walkForward,
  trainHMM, viterbi,
  lagFeatures, rollingMean, logReturns, zScore,
} from 'meridianalgo';

// Forward pass with weights trained in Python/JAX
const cell = new LSTMCell(loadedWeights);
const { h, c } = cell.forward(sequence);

// Walk-forward time-series CV
const cv = walkForward(X, y, {
  mode: 'expanding', initialTrainSize: 100, testSize: 20, step: 20,
  fit: (Xtr, ytr) => trainModel(Xtr, ytr),
  predict: (m, Xte) => m.predict(Xte),
});
console.log('Mean MSE:', cv.meanMse);

// HMM regime detection (bull/bear classification)
const { params, logLik } = trainHMM(returns, 2, { maxIter: 100 });
const states = viterbi(returns, params);  // 0 or 1 per timestep
```

### 17. Wealth Protection — CPPI / TIPP

```typescript
import { cppiStrategy, tippStrategy } from 'meridianalgo';

// CPPI: fixed floor protection
const path = cppiStrategy({
  riskyReturns,                    // per-period risky asset returns
  safeRate: 0.02 / 252,            // daily risk-free
  multiplier: 3,                   // leverage on cushion
  floorRatio: 0.80,                // protect 80% of starting wealth
  startingValue: 1_000_000,
});

// TIPP: ratcheting floor (raises with portfolio highs)
const tippPath = tippStrategy({
  riskyReturns, safeRate: 0.02 / 252,
  multiplier: 3, floorRatio: 0.80,
  startingValue: 1_000_000,
});
```

### 18. CLI

```bash
npx meridianalgo backtest --symbol AAPL --start 2023-01-01 --end 2024-01-01 --strategy sma-crossover
npx meridianalgo optimize --strategy momentum --grid config.json
npx meridianalgo analyze --returns returns.csv
```

### 19. Higher-Order Greeks & Tail Risk

```typescript
import {
  higherOrderGreeks,
  modifiedExpectedShortfall, adjustedSharpeRatio, tailRatio,
} from 'meridianalgo';

// Second- and third-order option sensitivities (verified vs finite differences).
// Time-decay Greeks (charm/color/veta) share one calendar-time convention.
const g = higherOrderGreeks({ S: 100, K: 105, T: 0.75, r: 0.03, sigma: 0.25, q: 0.01 }, 'call');
// { vanna, charm, vomma, veta, speed, zomma, color, ultima, dualDelta, dualGamma }

// Higher-moment-aware risk on a daily return series
const returns = [0.006, -0.045, 0.004, 0.007, -0.06, 0.003, 0.005, -0.002];
modifiedExpectedShortfall(returns, 0.95);  // Cornish-Fisher Expected Shortfall (loss)
adjustedSharpeRatio(returns, 0.02, 252);   // Pézier-White, penalizes skew/kurtosis
tailRatio(returns, 0.05);                  // right-tail vs left-tail magnitude
```

See [`docs/OPTIONS.md`](./docs/OPTIONS.md) and [`docs/VOL-RISK.md`](./docs/VOL-RISK.md) for the full reference.

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
  RiskMetrics, RiskPerformanceMetrics, StressTesting, PerformanceAttribution,
  cornishFisherVaR, modifiedExpectedShortfall, adjustedSharpeRatio, tailRatio,

  // Options
  blackScholesPrice, blackScholesGreeks, higherOrderGreeks, impliedVolatility,

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

Full index at [`docs/INDEX.md`](./docs/INDEX.md).

**Getting started**
- [Getting Started](./docs/GETTING-STARTED.md) · [Quick Start](./docs/QUICK-START.md) · [Setup & Development](./docs/SETUP.md) · [API Reference](./docs/API.md)

**Analytics & models**
- [Indicators Catalog](./docs/INDICATORS.md) · [Candlestick Patterns](./docs/INDICATORS-PATTERNS.md)
- [Streaming Indicators](./docs/STREAMING.md) · [Strategies Guide](./docs/STRATEGIES.md) · [Backtesting](./docs/BACKTEST.md) · [Optimization](./docs/OPTIMIZE.md)
- [Risk Management](./docs/RISK-MANAGEMENT.md) · [Volatility & Tail Risk](./docs/VOL-RISK.md) · [GARCH](./docs/GARCH.md)
- [Portfolio Optimization](./docs/PORTFOLIO.md) · [Attribution](./docs/PORTFOLIO-ATTRIBUTION.md)
- [Options & Greeks](./docs/OPTIONS.md) · [Stochastic Models](./docs/STOCHASTIC.md) · [Credit](./docs/CREDIT.md) · [Yield Curves](./docs/CURVES.md) · [Fixed Income](./docs/FINANCE.md)
- [Execution Algorithms](./docs/EXECUTION.md) · [Microstructure](./docs/MICROSTRUCTURE.md) · [Machine Learning](./docs/ML.md) · [Time-Series Models](./docs/MODELS.md)
- [Data Adapters](./docs/DATA.md) · [Core](./docs/CORE.md) · [Utilities](./docs/UTILS.md) · [Types](./docs/TYPES.md) · [CLI](./docs/CLI.md)

**Project**
- [Security](./docs/SECURITY.md) · [Disclaimer](./docs/DISCLAIMER.md) · [What's Next](./docs/WHATS-NEXT.md)

---

## Project Structure

```text
src/
├── core/           Types, config, logger, plugin registry, errors
├── indicators/     100+ classic + advanced TA (momentum, volatility, volume, ML, microstructure, regime, seasonality)
├── data/           Yahoo, Binance, Alpaca, Polygon adapters + DataManager
├── backtest/       Event-driven TimeBasedEngine + cost models
├── strategies/     Mean-reversion, momentum, trend, pairs, composer, position sizer
├── risk/           Metrics, VaR/CVaR, tail-risk, stress testing, attribution, CPPI/TIPP
├── portfolio/      Mean-variance, Black-Litterman, risk-parity, HRP, Kelly
├── options/        Black-Scholes, implied vol, higher-order Greeks, option chains
├── stochastic/     GBM, Heston, CIR, Merton jump-diffusion, Monte Carlo
├── garch/          GARCH(1,1), EGARCH, GJR-GARCH
├── finance/        TVM, bond pricing, duration, convexity
├── curves/         Yield-curve bootstrap, Nelson-Siegel
├── credit/         Merton structural, CDS, Z-spread, expected loss
├── microstructure/ Order book, spread estimators, market impact
├── ml/             LSTM/GRU, walk-forward CV, HMM regimes, feature engineering
├── execution/      Execution algos (VWAP/TWAP/POV/Almgren-Chriss), paper broker
├── models/         ARIMA, linear regression, state-space models
├── optimize/       Grid + random parameter search
├── utils/          Math, stats, time utilities
└── cli/            Command-line interface
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
npm test              # Run all tests (258 passing)
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
