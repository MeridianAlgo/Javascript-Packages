# Quick Start Guide

This guide will help you get up and running with MeridianAlgo in just a few minutes.

## 1. Installation

Install MeridianAlgo using your preferred package manager:

```bash
# npm
npm install meridianalgo

# pnpm
pnpm add meridianalgo

# yarn
yarn add meridianalgo
```

## 2. Basic Backtest Example

The core of MeridianAlgo is the `TimeBasedEngine`. Here is a simple example of how to fetch data and run a backtest.

```typescript
import { TimeBasedEngine, YahooAdapter } from 'meridianalgo';

async function main() {
  // 1. Fetch historical data (e.g., Apple Inc.)
  const adapter = new YahooAdapter();
  const data = await adapter.ohlcv('AAPL', {
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1d'
  });

  // 2. Define a simple trend-following strategy
  const myStrategy = {
    id: 'simple-trend',
    next: (bar, context) => {
      // Logic: Buy if price is above some level (simplified)
      // Return 1 for Buy/Hold, 0 for Cash/Neutral
      return { t: bar.t, value: 1 }; 
    }
  };

  // 3. Initialize the Backtesting Engine
  const engine = new TimeBasedEngine({
    initialCash: 100000,
    data,
    strategy: myStrategy,
    commission: 0.001 // 0.1% per trade
  });

  // 4. Run the simulation
  const results = await engine.run();

  // 5. Review metrics
  console.log('--- Backtest Results ---');
  console.log(`Total Return: ${(results.metrics.totalReturn * 100).toFixed(2)}%`);
  console.log(`Sharpe Ratio: ${results.metrics.sharpeRatio.toFixed(2)}`);
  console.log(`Max Drawdown: ${(results.metrics.maxDrawdown * 100).toFixed(2)}%`);
}

main().catch(console.error);
```

## 3. Using Technical Indicators

MeridianAlgo comes with 100+ indicators. All indicators are optimized for performance.

```typescript
import { Indicators } from 'meridianalgo';

const prices = [10, 11, 12, 11, 10, 11, 13, 14, 15];

// Simple Moving Average
const sma = Indicators.sma(prices, { period: 5 });

// RSI
const rsi = Indicators.rsi(prices, { period: 14 });

// MACD
const macd = Indicators.macd(prices, { fast: 12, slow: 26, signal: 9 });
```

## 4. Next Steps

- Explore the **[API Reference](./API.md)** for advanced features like Kalman Filters and Regime Detection.
- Learn about **[Portfolio Optimization](./API.md#portfolio)** to build multi-asset portfolios.
- Check out the **[Risk Management](./API.md#risk)** tools to protect your capital.
