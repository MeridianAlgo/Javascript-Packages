# Trading Strategies API

Complete guide to creating, combining, and optimizing trading strategies.

## Table of Contents

- [Built-in Strategies](#built-in-strategies)
- [Strategy Composition](#strategy-composition)
- [Position Sizing](#position-sizing)
- [Custom Strategies](#custom-strategies)

## Built-in Strategies

### Trend Following

Follows market trends using moving average crossovers.

```typescript
import { trendFollowing } from 'meridianalgo';

const strategy = trendFollowing({
  fastPeriod: 10,
  slowPeriod: 20,
  maType: 'ema'  // 'sma', 'ema', 'wma', etc.
});
```

**Parameters:**
- `fastPeriod`: Fast moving average period
- `slowPeriod`: Slow moving average period
- `maType`: Type of moving average to use

**Signals:**
- `+1`: Bullish (fast MA crosses above slow MA)
- `-1`: Bearish (fast MA crosses below slow MA)
- `0`: Neutral

**Example:**
```typescript
const bars = [/* historical price data */];

strategy.init(bars);

for (const bar of bars) {
  const signal = strategy.next(bar);
  
  if (signal && signal.value > 0) {
    console.log('Buy signal at', bar.c);
  } else if (signal && signal.value < 0) {
    console.log('Sell signal at', bar.c);
  }
}
```

### Mean Reversion

Trades based on price deviations from mean.

```typescript
import { meanReversion } from 'meridianalgo';

const strategy = meanReversion({
  period: 20,
  stdDev: 2,
  rsiPeriod: 14,
  rsiOverbought: 70,
  rsiOversold: 30
});
```

**Parameters:**
- `period`: Bollinger Bands period
- `stdDev`: Standard deviations for bands
- `rsiPeriod`: RSI calculation period
- `rsiOverbought`: RSI overbought threshold
- `rsiOversold`: RSI oversold threshold

**Logic:**
- Buy when price touches lower band AND RSI < oversold
- Sell when price touches upper band AND RSI > overbought

### Pairs Trading

Statistical arbitrage between correlated assets.

```typescript
import { pairsTrading } from 'meridianalgo';

const strategy = pairsTrading({
  lookback: 60,
  entryThreshold: 2.0,
  exitThreshold: 0.5
});
```

**Parameters:**
- `lookback`: Historical period for spread calculation
- `entryThreshold`: Z-score threshold to enter trade
- `exitThreshold`: Z-score threshold to exit trade

### Momentum

Trades based on price momentum.

```typescript
import { momentum } from 'meridianalgo';

const strategy = momentum({
  period: 20,
  threshold: 0.02  // 2% momentum threshold
});
```

## Strategy Composition

Combine multiple strategies for robust trading systems.

### Blending Strategies

Weight multiple strategies and combine their signals.

```typescript
import { StrategyComposer } from 'meridianalgo';

const strategy1 = trendFollowing({ fastPeriod: 10, slowPeriod: 20 });
const strategy2 = meanReversion({ period: 20, stdDev: 2 });
const strategy3 = momentum({ period: 14 });

// Blend with custom weights
const blended = StrategyComposer.blend(
  [strategy1, strategy2, strategy3],
  [0.5, 0.3, 0.2]  // 50% trend, 30% mean reversion, 20% momentum
);

blended.init(bars);
const signal = blended.next(currentBar);
```

**How it works:**
- Each strategy generates a signal (-1 to +1)
- Signals are multiplied by their weights
- Final signal is the weighted sum

### Voting Strategies

Require consensus from multiple strategies.

```typescript
const voted = StrategyComposer.vote(
  [strategy1, strategy2, strategy3],
  2  // Require 2 out of 3 strategies to agree
);

voted.init(bars);
const signal = voted.next(currentBar);
```

**How it works:**
- Counts how many strategies agree on direction
- Only generates signal if threshold is met
- More conservative than blending

### Sequential Strategies

Execute strategies in sequence with filters.

```typescript
const sequential = StrategyComposer.sequential([
  { strategy: trendStrategy, filter: (signal) => Math.abs(signal.value) > 0.5 },
  { strategy: momentumStrategy, filter: (signal) => signal.value !== 0 }
]);
```

## Position Sizing

Optimize position sizes based on risk and market conditions.

### Kelly Criterion

Optimal position sizing based on win rate and payoff ratio.

```typescript
import { PositionSizer } from 'meridianalgo';

const signal = { t: new Date(), value: 1 };

const size = PositionSizer.kelly(
  signal,
  0.6,  // Win rate (60%)
  2.0,  // Win/loss ratio (2:1)
  1.0   // Max position size (100%)
);

console.log('Kelly position size:', size);
```

**Formula:** `f* = (p * b - q) / b`
- `p`: Probability of winning
- `q`: Probability of losing (1 - p)
- `b`: Win/loss ratio

**Warning:** Full Kelly can be aggressive. Consider using fractional Kelly (e.g., 0.5 * Kelly).

### Volatility Targeting

Size positions to maintain constant portfolio volatility.

```typescript
const size = PositionSizer.volTarget(
  signal,
  0.15,     // Current asset volatility (15%)
  0.10,     // Target portfolio volatility (10%)
  100000    // Portfolio value
);
```

**Use Cases:**
- Risk parity portfolios
- Volatility-adjusted position sizing
- Dynamic leverage adjustment

### Drawdown-Aware Sizing

Reduce position sizes during drawdowns.

```typescript
const size = PositionSizer.drawdownAware(
  signal,
  0.05,    // Current drawdown (5%)
  0.20,    // Max drawdown threshold (20%)
  1000     // Base position size
);
```

**Logic:**
- Reduces size linearly as drawdown increases
- Helps preserve capital during losing streaks
- Automatically scales back up as equity recovers

### Fixed Fractional

Simple percentage-based position sizing.

```typescript
const size = PositionSizer.fixedFractional(
  signal,
  0.02,    // Risk 2% per trade
  100000   // Portfolio value
);
```

### Risk-Based Sizing

Size based on stop-loss distance.

```typescript
const size = PositionSizer.riskBased(
  signal,
  100,     // Entry price
  95,      // Stop-loss price
  0.01,    // Risk 1% of portfolio
  100000   // Portfolio value
);
```

## Custom Strategies

Create your own strategies by implementing the Strategy interface.

### Basic Custom Strategy

```typescript
import { Strategy, Bar, Signal } from 'meridianalgo';

class MyCustomStrategy implements Strategy {
  id = 'my-custom-strategy';
  private history: Bar[] = [];
  
  init(bars: Bar[]): void {
    this.history = bars;
  }
  
  next(bar: Bar): Signal | null {
    this.history.push(bar);
    
    // Your strategy logic here
    const prices = this.history.map(b => b.c);
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    
    if (sma20 > sma50) {
      return { t: bar.t, value: 1 };  // Buy
    } else if (sma20 < sma50) {
      return { t: bar.t, value: -1 }; // Sell
    }
    
    return null;  // No signal
  }
  
  private calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }
}

// Use your custom strategy
const myStrategy = new MyCustomStrategy();
myStrategy.init(bars);
const signal = myStrategy.next(currentBar);
```

### Advanced Custom Strategy with State

```typescript
class AdvancedStrategy implements Strategy {
  id = 'advanced-strategy';
  private state: {
    position: number;
    entryPrice: number;
    stopLoss: number;
  } = {
    position: 0,
    entryPrice: 0,
    stopLoss: 0
  };
  
  init(bars: Bar[]): void {
    // Initialize with historical data
  }
  
  next(bar: Bar): Signal | null {
    // Check stop-loss
    if (this.state.position !== 0) {
      if (bar.c <= this.state.stopLoss) {
        this.state.position = 0;
        return { t: bar.t, value: 0 };  // Exit
      }
    }
    
    // Entry logic
    if (this.state.position === 0) {
      // Your entry conditions
      if (/* buy condition */) {
        this.state.position = 1;
        this.state.entryPrice = bar.c;
        this.state.stopLoss = bar.c * 0.95;  // 5% stop
        return { t: bar.t, value: 1 };
      }
    }
    
    return null;
  }
  
  getState() {
    return this.state;
  }
}
```

## Strategy Testing

### Batch Signal Generation

Generate signals for entire dataset at once:

```typescript
const strategy = trendFollowing({ fastPeriod: 10, slowPeriod: 20 });

// Generate all signals
const signals = strategy.generate!(bars);

console.log(`Generated ${signals.length} signals`);
signals.forEach(signal => {
  console.log(`${signal.t}: ${signal.value}`);
});
```

### Strategy Metrics

Evaluate strategy performance:

```typescript
import { PerformanceMetrics } from 'meridianalgo';

const signals = strategy.generate!(bars);
const returns = calculateReturns(signals, bars);

const metrics = {
  sharpe: PerformanceMetrics.sharpeRatio(returns),
  sortino: PerformanceMetrics.sortinoRatio(returns),
  maxDD: PerformanceMetrics.maxDrawdown(prices),
  winRate: PerformanceMetrics.winRate(returns)
};

console.log('Strategy Metrics:', metrics);
```

## Best Practices

1. **Always Initialize**: Call `init()` before using `next()`
2. **Handle Null Signals**: Not every bar generates a signal
3. **Manage State**: Track positions and entry prices
4. **Risk Management**: Always use stop-losses
5. **Diversification**: Combine multiple strategies
6. **Backtesting**: Test thoroughly before live trading
7. **Position Sizing**: Never risk more than 1-2% per trade
8. **Slippage & Costs**: Account for transaction costs

## Common Patterns

### Trend Filter

Only trade mean reversion in trending markets:

```typescript
const trendFilter = trendFollowing({ fastPeriod: 50, slowPeriod: 200 });
const meanRev = meanReversion({ period: 20, stdDev: 2 });

const filtered = StrategyComposer.sequential([
  { 
    strategy: trendFilter,
    filter: (signal) => signal.value > 0  // Only long in uptrend
  },
  { 
    strategy: meanRev,
    filter: (signal) => signal.value > 0  // Only take long signals
  }
]);
```

### Multi-Timeframe

Combine signals from different timeframes:

```typescript
const dailyTrend = trendFollowing({ fastPeriod: 20, slowPeriod: 50 });
const hourlyEntry = meanReversion({ period: 10, stdDev: 2 });

// Trade hourly mean reversion in direction of daily trend
```

### Regime Detection

Adapt strategy based on market regime:

```typescript
function selectStrategy(volatility: number) {
  if (volatility > 0.3) {
    return meanReversion({ period: 10, stdDev: 1.5 });  // Tighter bands
  } else {
    return trendFollowing({ fastPeriod: 20, slowPeriod: 50 });
  }
}
```
