# Getting Started with MeridianAlgo

## Installation

```bash
npm install meridianalgo
# or
yarn add meridianalgo
# or
pnpm add meridianalgo
```

## Quick Start

### 1. Technical Indicators

MeridianAlgo provides a comprehensive suite of technical indicators:

```typescript
import { Indicators } from 'meridianalgo';

// Price data
const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];

// Simple Moving Average
const sma = Indicators.sma(prices, 5);
console.log('SMA:', sma);

// Exponential Moving Average
const ema = Indicators.ema(prices, 5);
console.log('EMA:', ema);

// Relative Strength Index
const rsi = Indicators.rsi(prices, 14);
console.log('RSI:', rsi);

// MACD
const macd = Indicators.macd(prices, 12, 26, 9);
console.log('MACD Line:', macd.macd);
console.log('Signal Line:', macd.signal);
console.log('Histogram:', macd.histogram);

// Bollinger Bands
const bb = Indicators.bollingerBands(prices, 20, 2);
console.log('Upper Band:', bb.upper);
console.log('Middle Band:', bb.middle);
console.log('Lower Band:', bb.lower);
```

### 2. Trading Strategies

Create and combine trading strategies:

```typescript
import { trendFollowing, meanReversion } from 'meridianalgo';
import { StrategyComposer } from 'meridianalgo';
import { Bar } from 'meridianalgo';

// Create sample bar data
const bars: Bar[] = [
  {
    t: new Date('2024-01-01'),
    o: 100,
    h: 105,
    l: 99,
    c: 103,
    v: 1000000,
    symbol: 'AAPL'
  },
  // ... more bars
];

// Trend Following Strategy
const trendStrategy = trendFollowing({
  fastPeriod: 10,
  slowPeriod: 20,
  maType: 'ema'
});

// Mean Reversion Strategy
const meanRevStrategy = meanReversion({
  period: 20,
  stdDev: 2,
  rsiPeriod: 14
});

// Initialize strategies
trendStrategy.init(bars);
meanRevStrategy.init(bars);

// Generate signals
const signal1 = trendStrategy.next(bars[bars.length - 1]);
const signal2 = meanRevStrategy.next(bars[bars.length - 1]);

console.log('Trend Signal:', signal1);
console.log('Mean Reversion Signal:', signal2);

// Blend multiple strategies
const blended = StrategyComposer.blend(
  [trendStrategy, meanRevStrategy],
  [0.6, 0.4] // 60% trend, 40% mean reversion
);

blended.init(bars);
const blendedSignal = blended.next(bars[bars.length - 1]);
console.log('Blended Signal:', blendedSignal);
```

### 3. Backtesting

Run backtests on your strategies:

```typescript
import { TimeBasedEngine } from 'meridianalgo';
import { FixedCommission, FixedSlippage } from 'meridianalgo';

const engine = new TimeBasedEngine({
  strategy: trendStrategy,
  data: bars,
  initialCash: 100000,
  commission: new FixedCommission(1), // $1 per trade
  slippage: new FixedSlippage(5) // 5 basis points
});

const results = await engine.run();

console.log('Final Equity:', results.equity[results.equity.length - 1]);
console.log('Total Trades:', results.trades.length);
console.log('Performance Metrics:', results.metrics);
```

### 4. Risk Management

Calculate risk metrics and manage portfolio risk:

```typescript
import { RiskMetrics, PerformanceMetrics } from 'meridianalgo';

// Calculate returns from prices
const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);

// Value at Risk
const var95 = RiskMetrics.var(returns, 0.95);
console.log('VaR (95%):', var95);

// Conditional Value at Risk
const cvar95 = RiskMetrics.cvar(returns, 0.95);
console.log('CVaR (95%):', cvar95);

// Sharpe Ratio
const sharpe = PerformanceMetrics.sharpeRatio(returns);
console.log('Sharpe Ratio:', sharpe);

// Sortino Ratio
const sortino = PerformanceMetrics.sortinoRatio(returns);
console.log('Sortino Ratio:', sortino);

// Maximum Drawdown
const maxDD = PerformanceMetrics.maxDrawdown(prices);
console.log('Max Drawdown:', maxDD);
```

### 5. Position Sizing

Optimize position sizes based on various methods:

```typescript
import { PositionSizer } from 'meridianalgo';

const signal = { t: new Date(), value: 1 }; // Buy signal

// Kelly Criterion
const kellySize = PositionSizer.kelly(
  signal,
  0.6,  // Win rate
  2,    // Win/loss ratio
  1     // Max position size
);

// Volatility Targeting
const volSize = PositionSizer.volTarget(
  signal,
  0.15,    // Current volatility
  0.20,    // Target volatility
  100000   // Portfolio value
);

// Drawdown-Aware Sizing
const ddSize = PositionSizer.drawdownAware(
  signal,
  0.05,   // Current drawdown
  0.10,   // Max drawdown
  1000    // Base position size
);

console.log('Kelly Size:', kellySize);
console.log('Vol-Targeted Size:', volSize);
console.log('DD-Aware Size:', ddSize);
```

### 6. Data Management

Connect to various data sources:

```typescript
import { DataManager, YahooAdapter, AlpacaAdapter } from 'meridianalgo';

// Create data manager
const adapters = new Map();
adapters.set('yahoo', new YahooAdapter());
adapters.set('alpaca', new AlpacaAdapter('API_KEY', 'SECRET_KEY'));

const dataManager = new DataManager(adapters);

// Fetch historical data
const yahooData = await dataManager.ohlcv('yahoo', 'AAPL', {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31'),
  interval: '1d'
});

console.log('Historical Data:', yahooData);
```

## Next Steps

- [API Documentation](./API.md) - Complete API reference
- [Examples](../examples/) - More detailed examples
- [Advanced Features](./ADVANCED.md) - Advanced usage patterns
- [Contributing](./CONTRIBUTING.md) - How to contribute

## Support

- GitHub Issues: https://github.com/MeridianAlgo/Javascript-Packages/issues
- Documentation: https://github.com/MeridianAlgo/Javascript-Packages#readme
