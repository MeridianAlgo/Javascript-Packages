# MeridianAlgo v2.0 - Quick Start Guide

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/meridianalgo-js.git
cd meridianalgo-js

# Install dependencies (requires pnpm)
npm install -g pnpm
pnpm install

# Build all packages
pnpm build
```

## Your First Backtest

Create a file `my-first-backtest.ts`:

```typescript
import { YahooAdapter } from '@meridianalgo/data';
import { trendFollowing } from '@meridianalgo/strategies';
import { TimeBasedEngine } from '@meridianalgo/backtest';

async function main() {
  // 1. Fetch data
  const yahoo = new YahooAdapter();
  const bars = await yahoo.ohlcv('AAPL', {
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1d'
  });

  console.log(`Fetched ${bars.length} bars`);

  // 2. Create strategy
  const strategy = trendFollowing({
    fastPeriod: 10,
    slowPeriod: 30,
    maType: 'ema'
  });

  // 3. Run backtest
  const engine = new TimeBasedEngine({
    strategy,
    data: bars,
    initialCash: 100000
  });

  const result = await engine.run();

  // 4. Display results
  console.log('\\n=== Backtest Results ===');
  console.log(`Total Return: ${(result.metrics.totalReturn * 100).toFixed(2)}%`);
  console.log(`Sharpe Ratio: ${result.metrics.sharpeRatio.toFixed(2)}`);
  console.log(`Max Drawdown: ${(result.metrics.maxDrawdown * 100).toFixed(2)}%`);
  console.log(`Win Rate: ${(result.metrics.winRate * 100).toFixed(2)}%`);
  console.log(`Total Trades: ${result.trades.length}`);
}

main().catch(console.error);
```

Run it:

```bash
npx ts-node my-first-backtest.ts
```

## Common Use Cases

### 1. Using Advanced Indicators

```typescript
import { YahooAdapter } from '@meridianalgo/data';
import { AdvancedVolatilityIndicators, RegimeIndicators } from '@meridianalgo/indicators';

const yahoo = new YahooAdapter();
const bars = await yahoo.ohlcv('SPY', {
  start: '2023-01-01',
  end: '2023-12-31',
  interval: '1d'
});

// Calculate returns
const returns = [];
for (let i = 1; i < bars.length; i++) {
  returns.push((bars[i].c - bars[i - 1].c) / bars[i - 1].c);
}

// GARCH volatility
const garch = AdvancedVolatilityIndicators.garch(returns);
console.log('Current volatility:', garch.volatility[garch.volatility.length - 1]);

// Regime detection
const regimes = RegimeIndicators.hmm(returns, 2);
console.log('Current regime:', regimes.regimes[regimes.regimes.length - 1]);
```

### 2. Custom Strategy

```typescript
import { Strategy } from '@meridianalgo/strategies';
import { Bar, Signal } from '@meridianalgo/core';
import { Indicators } from '@meridianalgo/indicators';

function myCustomStrategy(params: { rsiPeriod: number; oversold: number; overbought: number }): Strategy {
  const bars: Bar[] = [];
  
  return {
    id: 'my-custom-strategy',
    
    next(bar: Bar): Signal | null {
      bars.push(bar);
      
      if (bars.length < params.rsiPeriod) return null;
      
      const closes = bars.map(b => b.c);
      const rsi = Indicators.rsi(closes, params.rsiPeriod);
      const currentRSI = rsi[rsi.length - 1];
      
      if (currentRSI < params.oversold) {
        return { t: bar.t, value: 1 }; // Buy signal
      } else if (currentRSI > params.overbought) {
        return { t: bar.t, value: -1 }; // Sell signal
      }
      
      return { t: bar.t, value: 0 }; // Neutral
    }
  };
}

// Use it
const strategy = myCustomStrategy({
  rsiPeriod: 14,
  oversold: 30,
  overbought: 70
});
```

### 3. Parameter Optimization

```typescript
import { GridSearchOptimizer } from '@meridianalgo/optimize';
import { YahooAdapter } from '@meridianalgo/data';
import { trendFollowing } from '@meridianalgo/strategies';
import { TimeBasedEngine } from '@meridianalgo/backtest';

const yahoo = new YahooAdapter();
const bars = await yahoo.ohlcv('AAPL', {
  start: '2023-01-01',
  end: '2023-12-31',
  interval: '1d'
});

// Define objective function
const objective = async (params: Record<string, any>) => {
  const strategy = trendFollowing({
    fastPeriod: params.fastPeriod,
    slowPeriod: params.slowPeriod,
    maType: 'ema'
  });
  
  const engine = new TimeBasedEngine({
    strategy,
    data: bars,
    initialCash: 100000
  });
  
  const result = await engine.run();
  return result.metrics.sharpeRatio;
};

// Define parameter space
const space = {
  fastPeriod: { type: 'discrete' as const, min: 5, max: 20, step: 1 },
  slowPeriod: { type: 'discrete' as const, min: 25, max: 50, step: 5 }
};

// Run optimization
const optimizer = new GridSearchOptimizer();
const result = await optimizer.optimize(objective, space);

console.log('Best parameters:', result.bestParams);
console.log('Best Sharpe ratio:', result.bestScore);
```

### 4. Portfolio Optimization

```typescript
import { MeanVarianceOptimizer } from '@meridianalgo/portfolio';
import { YahooAdapter } from '@meridianalgo/data';

const yahoo = new YahooAdapter();
const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];
const returns: number[][] = [];

// Fetch data for each symbol
for (const symbol of symbols) {
  const bars = await yahoo.ohlcv(symbol, {
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1d'
  });
  
  const symbolReturns = [];
  for (let i = 1; i < bars.length; i++) {
    symbolReturns.push((bars[i].c - bars[i - 1].c) / bars[i - 1].c);
  }
  returns.push(symbolReturns);
}

// Transpose to get returns by date
const returnsByDate: number[][] = [];
for (let i = 0; i < returns[0].length; i++) {
  returnsByDate.push(returns.map(r => r[i]));
}

// Optimize
const optimizer = new MeanVarianceOptimizer();
const result = optimizer.optimize(returnsByDate, symbols, {
  longOnly: true,
  maxWeight: 0.4
});

console.log('Optimal weights:', result.weights);
console.log('Expected return:', result.expectedReturn);
console.log('Expected risk:', result.expectedRisk);
```

### 5. Risk Analysis

```typescript
import { RiskMetrics, PerformanceMetrics } from '@meridianalgo/risk';

// Assuming you have returns and equity arrays from a backtest
const returns = [0.01, -0.02, 0.015, -0.01, 0.02, ...];
const equity = [100000, 101000, 98980, 100465, ...];

// Calculate risk metrics
const var95 = RiskMetrics.var(returns, 0.95);
const cvar95 = RiskMetrics.cvar(returns, 0.95);
const maxDD = RiskMetrics.maxDrawdown(equity);
const vol = RiskMetrics.volatility(returns, true);

console.log('95% VaR:', (var95 * 100).toFixed(2) + '%');
console.log('95% CVaR:', (cvar95 * 100).toFixed(2) + '%');
console.log('Max Drawdown:', (maxDD.value * 100).toFixed(2) + '%');
console.log('Annualized Volatility:', (vol * 100).toFixed(2) + '%');

// Performance metrics
const sharpe = PerformanceMetrics.sharpeRatio(returns);
const sortino = PerformanceMetrics.sortinoRatio(returns);

console.log('Sharpe Ratio:', sharpe.toFixed(2));
console.log('Sortino Ratio:', sortino.toFixed(2));
```

### 6. Paper Trading

```typescript
import { PaperBroker } from '@meridianalgo/execution';
import { Order } from '@meridianalgo/core';

// Create paper broker
const broker = new PaperBroker({
  initialCash: 100000,
  commission: 1,
  slippageBps: 5
});

// Place order
const order: Order = {
  symbol: 'AAPL',
  side: 'buy',
  qty: 100,
  type: 'market'
};

const response = await broker.placeOrder(order);
console.log('Order placed:', response.orderId);

// Check account
const account = await broker.getAccount();
console.log('Cash:', account.cash);
console.log('Equity:', account.equity);
console.log('Positions:', account.positions);
```

## Running Examples

The repository includes several example scripts:

```bash
# Basic backtest example
pnpm example:basic

# Advanced features (GARCH, HMM, VPIN, PCA)
pnpm example:advanced

# Utils demo (math, stats, time)
pnpm example:utils
```

## Project Structure

```
meridianalgo-js/
├── packages/
│   ├── core/           # Core types and plugin system
│   ├── indicators/     # 100+ indicators
│   ├── data/           # Data adapters
│   ├── strategies/     # Strategy templates
│   ├── backtest/       # Backtesting engines
│   ├── risk/           # Risk metrics
│   ├── portfolio/      # Portfolio optimization
│   ├── models/         # ML models
│   ├── execution/      # Trading execution
│   ├── optimize/       # Parameter optimization
│   ├── visualize/      # Visualization
│   ├── pipeline/       # Workflow pipelines
│   ├── compliance/     # Audit and compliance
│   ├── cli/            # Command-line tools
│   └── utils/          # Utilities
├── examples/           # Example scripts
├── docs/               # Documentation
└── README.md
```

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Examples](docs/EXAMPLES.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Implementation Summary](docs/IMPLEMENTATION-SUMMARY.md)

## Getting Help

- Check the [documentation](docs/)
- Review [examples](examples/)
- Open an issue on GitHub
- Join our Discord community

## Next Steps

1. **Explore Examples**: Run the example scripts to see the framework in action
2. **Read Documentation**: Check out the comprehensive docs in the `docs/` folder
3. **Build Your Strategy**: Use the strategy templates as a starting point
4. **Backtest**: Test your strategy with historical data
5. **Optimize**: Find the best parameters for your strategy
6. **Paper Trade**: Test in real-time with paper trading
7. **Go Live**: Deploy to production (when ready)

## Tips

- Start with simple strategies and gradually add complexity
- Always backtest on out-of-sample data
- Use walk-forward analysis to avoid overfitting
- Monitor risk metrics closely
- Test thoroughly in paper trading before going live
- Keep good records with the audit logging system

## Common Issues

### pnpm not found
```bash
npm install -g pnpm
```

### Build errors
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Import errors
Make sure you've built the packages first:
```bash
pnpm build
```

## Support

For questions, issues, or contributions:
- GitHub Issues: [github.com/your-org/meridianalgo-js/issues](https://github.com/your-org/meridianalgo-js/issues)
- Discord: [Join our community](https://discord.gg/your-invite)
- Email: support@meridianalgo.com

---

Happy trading! 🚀
