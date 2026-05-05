# Backtesting Package

The `@meridianalgo/backtest` package provides a high-performance event-driven backtesting engine for validating trading strategies.

## Backtest Engine

The `TimeBasedEngine` is the primary class for running simulations on historical OHLCV data.

```typescript
import { 
  TimeBasedEngine, 
  FixedCommission, 
  FixedSlippage 
} from '@meridianalgo/backtest';

const engine = new TimeBasedEngine({
  strategy: myStrategy,
  data: bars,
  initialCash: 100000,
  commission: new FixedCommission(1), // $1 per trade
  slippage: new FixedSlippage(0.01)    // $0.01 per share
});

const result = await engine.run();
```

## Results and Metrics

The engine returns a comprehensive `BacktestResult` object:

- `metrics`: Standard performance metrics (Sharpe, Sortino, Max Drawdown, etc.)
- `trades`: List of all executed trades with PnL.
- `equity`: Time series of account equity and cash.
- `positions`: Final open positions.

## Transaction Costs

You can model realistic trading costs using cost models:

- `FixedCommission(amount)`
- `PercentageCommission(pct)`
- `FixedSlippage(amount)`
- `PercentageSlippage(pct)`

## Usage Example

```typescript
const result = await engine.run();

console.log('Final Equity:', result.equity[result.equity.length - 1].equity);
console.log('Total Return:', result.metrics.totalReturn);
console.log('Sharpe Ratio:', result.metrics.sharpeRatio);
```
