# Risk Management API

Comprehensive guide to risk metrics, portfolio analysis, and risk management.

## Table of Contents

- [Risk Metrics](#risk-metrics)
- [Performance Metrics](#performance-metrics)
- [Portfolio Analysis](#portfolio-analysis)
- [Stress Testing](#stress-testing)

## Risk Metrics

### Value at Risk (VaR)

Estimates the maximum loss over a given time period at a specified confidence level.

```typescript
import { RiskMetrics } from 'meridianalgo';

const returns = [0.01, 0.02, -0.01, 0.03, -0.02, /* ... */];

// Historical VaR
const var95 = RiskMetrics.var(returns, 0.95, 'historical');
console.log('VaR (95%):', var95);

// Parametric VaR (assumes normal distribution)
const varParam = RiskMetrics.var(returns, 0.95, 'parametric');

// Monte Carlo VaR
const varMC = RiskMetrics.var(returns, 0.95, 'monte-carlo');
```

**Interpretation:**
- VaR of -0.02 at 95% confidence means: "We are 95% confident that we won't lose more than 2% in a given period"

**Methods:**
- `historical`: Uses actual historical returns
- `parametric`: Assumes normal distribution
- `monte-carlo`: Simulates future returns

### Conditional Value at Risk (CVaR)

Expected loss given that VaR threshold is exceeded (also called Expected Shortfall).

```typescript
const cvar95 = RiskMetrics.cvar(returns, 0.95);
console.log('CVaR (95%):', cvar95);
```

**Why CVaR > VaR:**
- Captures tail risk better
- Considers magnitude of extreme losses
- More conservative risk measure

### Maximum Drawdown

Largest peak-to-trough decline in portfolio value.

`RiskMetrics.maxDrawdown` takes an **equity curve** (cumulative value), not a return
series, and returns the drawdown as a negative fraction plus its location.

```typescript
const equity = [100, 105, 103, 110, 98, 102];
const maxDD = RiskMetrics.maxDrawdown(equity);

console.log('Max Drawdown (fraction):', maxDD.value);  // e.g. -0.1091 (negative)
console.log('Peak index:', maxDD.start);
console.log('Trough index:', maxDD.end);
console.log('Drawdown duration (bars):', maxDD.duration);
```

**Use Cases:**
- Assess worst-case scenario
- Set risk limits
- Evaluate strategy robustness
- Compare strategies

### Volatility

Standard deviation of returns (annualized).

```typescript
const vol = RiskMetrics.volatility(returns, true);  // true = annualize
console.log('Annualized Volatility:', vol);
```

### Beta

Measures sensitivity to market movements.

```typescript
const portfolioReturns = [/* ... */];
const marketReturns = [/* ... */];

const beta = RiskMetrics.beta(portfolioReturns, marketReturns);
console.log('Beta:', beta);
```

**Interpretation:**
- Beta = 1: Moves with market
- Beta > 1: More volatile than market
- Beta < 1: Less volatile than market
- Beta < 0: Inverse correlation

## Performance Metrics

### Sharpe Ratio

Risk-adjusted return metric.

```typescript
import { PerformanceMetrics } from 'meridianalgo';

const sharpe = PerformanceMetrics.sharpeRatio(
  returns,
  0.02,  // Risk-free rate (2%)
  true   // Annualize
);

console.log('Sharpe Ratio:', sharpe);
```

**Interpretation:**
- Sharpe > 1: Good
- Sharpe > 2: Very good
- Sharpe > 3: Excellent

**Formula:** `(Return - RiskFreeRate) / Volatility`

### Sortino Ratio

Like Sharpe but only penalizes downside volatility.

```typescript
const sortino = PerformanceMetrics.sortinoRatio(
  returns,
  0.02,  // Risk-free rate
  true   // Annualize
);

console.log('Sortino Ratio:', sortino);
```

**Why Sortino > Sharpe:**
- Only considers downside risk
- Better for asymmetric return distributions
- More appropriate for strategies with positive skew

### Calmar Ratio

Annualized return divided by the magnitude of maximum drawdown. Takes the return
series and the **equity curve**.

```typescript
const calmar = PerformanceMetrics.calmarRatio(returns, equity);

console.log('Calmar Ratio:', calmar);
```

**Interpretation:**
- Higher is better
- Measures return per unit of drawdown risk

### Information Ratio

Excess return per unit of tracking error.

```typescript
const portfolioReturns = [/* ... */];
const benchmarkReturns = [/* ... */];

const ir = PerformanceMetrics.informationRatio(
  portfolioReturns,
  benchmarkReturns
);

console.log('Information Ratio:', ir);
```

**Use Cases:**
- Evaluate active management
- Compare to benchmark
- Assess manager skill

### Alpha

Excess return above what CAPM predicts.

```typescript
const alpha = PerformanceMetrics.alpha(
  portfolioReturns,
  marketReturns,
  0.02  // Risk-free rate
);

console.log('Alpha:', alpha);
```

**Interpretation:**
- Alpha > 0: Outperforming
- Alpha = 0: Market return
- Alpha < 0: Underperforming

### Win Rate

Percentage of profitable trades.

```typescript
const winRate = PerformanceMetrics.winRate(returns);
console.log('Win Rate:', winRate + '%');
```

### Profit Factor

Ratio of gross profit to gross loss.

```typescript
const pf = PerformanceMetrics.profitFactor(returns);
console.log('Profit Factor:', pf);
```

**Interpretation:**
- PF > 1: Profitable
- PF > 1.5: Good
- PF > 2: Excellent

### Average Win/Loss Ratio

Ratio of the average winning return to the average losing return.

```typescript
const ratio = PerformanceMetrics.avgWinLoss(returns);
console.log('Avg Win/Loss Ratio:', ratio);

// Related single-call metrics:
PerformanceMetrics.expectancy(returns);   // win-rate-weighted edge
PerformanceMetrics.payoffRatio(returns);  // alias of avgWinLoss
```

## Portfolio Analysis

### Building a Metrics Dashboard

Compose the individual metric functions to produce a summary:

```typescript
import { RiskMetrics, PerformanceMetrics } from 'meridianalgo';

const summary = {
  volatility: RiskMetrics.volatility(returns),
  sharpeRatio: PerformanceMetrics.sharpeRatio(returns, 0.02),
  sortinoRatio: PerformanceMetrics.sortinoRatio(returns, 0.02),
  calmarRatio: PerformanceMetrics.calmarRatio(returns, equity),
  maxDrawdown: RiskMetrics.maxDrawdown(equity).value,
  winRate: PerformanceMetrics.winRate(returns),
  profitFactor: PerformanceMetrics.profitFactor(returns),
  var95: RiskMetrics.var(returns, 0.95, 'historical'),
  cvar95: RiskMetrics.cvar(returns, 0.95),
  beta: RiskMetrics.beta(returns, benchmarkReturns),
  alpha: PerformanceMetrics.alpha(returns, benchmarkReturns, 0.02),
  informationRatio: PerformanceMetrics.informationRatio(returns, benchmarkReturns),
};

console.log('Performance summary:', summary);
```

### Tail Risk (Higher-Moment Aware)

Standard VaR assumes normal returns. For skewed, fat-tailed series, use the
Cornish-Fisher and Pézier-White estimators. See [Volatility & Tail Risk](./VOL-RISK.md).

```typescript
import {
  cornishFisherVaR, modifiedExpectedShortfall, adjustedSharpeRatio, tailRatio,
} from 'meridianalgo';

cornishFisherVaR(returns, 0.95);            // skew/kurtosis-adjusted VaR (loss)
modifiedExpectedShortfall(returns, 0.95);   // Cornish-Fisher Expected Shortfall
adjustedSharpeRatio(returns, 0.02, 252);    // Sharpe penalized for skew/kurtosis
tailRatio(returns, 0.05);                   // right-tail vs left-tail magnitude
```

### Tracking Error

Standard deviation of excess returns vs benchmark.

```typescript
const te = PerformanceMetrics.trackingError(
  portfolioReturns,
  benchmarkReturns
);

console.log('Tracking Error:', te);
```

## Stress Testing

Test portfolio under extreme scenarios.

The portfolio is an array of positions: `{ symbol, qty, avgPrice }`.

### Scenario Shock

```typescript
import { StressTesting } from 'meridianalgo';

const portfolio = [
  { symbol: 'AAPL', qty: 100, avgPrice: 150 },
  { symbol: 'GOOGL', qty: 50, avgPrice: 2800 },
];

// Apply per-symbol return shocks (e.g. a 2008-style crisis)
const result = StressTesting.scenario(portfolio, { AAPL: -0.50, GOOGL: -0.45 });

console.log('P&L:', result.pnl);
console.log('New value:', result.newValue);
console.log('Per-symbol breakdown:', result.breakdown);
```

### Historical Stress Test

```typescript
const hist = StressTesting.historical(portfolio, {
  date: new Date('2008-09-15'),
  returns: { AAPL: -0.50, GOOGL: -0.45 },
});

console.log('P&L:', hist.pnl, 'Breakdown:', hist.breakdown);
```

### Monte Carlo Simulation

`monteCarlo(portfolio, meanReturns, volatilities, correlations, simulations, horizon)`:

```typescript
const sim = StressTesting.monteCarlo(
  portfolio,
  { AAPL: 0.0004, GOOGL: 0.0003 },   // per-period mean returns
  { AAPL: 0.02, GOOGL: 0.025 },      // per-period volatilities
  [[1, 0.6], [0.6, 1]],              // correlation matrix
  10000,                             // simulations
  252,                               // horizon (bars)
);

console.log('VaR (95%):', sim.var95);
console.log('CVaR (95%):', sim.cvar95);
console.log('Worst Case:', sim.worstCase);
console.log('Best Case:', sim.bestCase);
```

## Risk Management Strategies

### Position Limits

```typescript
class RiskManager {
  private maxPositionSize = 0.10;  // 10% max per position
  private maxSectorExposure = 0.30;  // 30% max per sector
  private maxDrawdown = 0.20;  // 20% max drawdown
  
  checkPosition(size: number, portfolioValue: number): boolean {
    return (size / portfolioValue) <= this.maxPositionSize;
  }
  
  checkDrawdown(currentDD: number): boolean {
    return currentDD <= this.maxDrawdown;
  }
}
```

### Stop-Loss Management

```typescript
class StopLossManager {
  calculateStopLoss(
    entryPrice: number,
    method: 'fixed' | 'atr' | 'volatility',
    params: any
  ): number {
    switch (method) {
      case 'fixed':
        return entryPrice * (1 - params.percent);
      
      case 'atr':
        return entryPrice - (params.atr * params.multiplier);
      
      case 'volatility':
        return entryPrice - (params.volatility * params.stdDevs);
      
      default:
        return entryPrice * 0.95;  // 5% default
    }
  }
  
  trailingStop(
    currentPrice: number,
    highestPrice: number,
    trailPercent: number
  ): number {
    return highestPrice * (1 - trailPercent);
  }
}
```

### Portfolio Rebalancing

```typescript
class PortfolioRebalancer {
  rebalance(
    currentWeights: Record<string, number>,
    targetWeights: Record<string, number>,
    threshold: number = 0.05  // 5% threshold
  ): Record<string, number> {
    const trades: Record<string, number> = {};
    
    for (const symbol in targetWeights) {
      const current = currentWeights[symbol] || 0;
      const target = targetWeights[symbol];
      const diff = target - current;
      
      if (Math.abs(diff) > threshold) {
        trades[symbol] = diff;
      }
    }
    
    return trades;
  }
}
```

## Best Practices

### 1. Diversification

```typescript
// Don't put all eggs in one basket
const maxPositionSize = 0.10;  // 10% max
const minPositions = 10;  // At least 10 positions
const maxCorrelation = 0.70;  // Max 70% correlation
```

### 2. Risk Budgeting

```typescript
// Allocate risk, not capital
const riskBudget = {
  equities: 0.60,  // 60% of risk
  bonds: 0.20,     // 20% of risk
  alternatives: 0.20  // 20% of risk
};
```

### 3. Regular Monitoring

```typescript
// Monitor risk metrics daily
function dailyRiskCheck(portfolio: Portfolio) {
  const metrics = {
    var: RiskMetrics.var(portfolio.returns, 0.95),
    drawdown: RiskMetrics.maxDrawdown(portfolio.returns),
    concentration: calculateConcentration(portfolio)
  };
  
  if (metrics.var > RISK_LIMIT) {
    alert('VaR limit breached!');
  }
  
  if (metrics.drawdown.maxDrawdownPercent > MAX_DRAWDOWN) {
    alert('Max drawdown exceeded!');
  }
}
```

### 4. Stress Testing

```typescript
// Regular stress tests
const scenarios = [
  { name: '2008 Crisis', shocks: {/* ... */} },
  { name: 'COVID-19', shocks: {/* ... */} },
  { name: 'Flash Crash', shocks: {/* ... */} }
];

scenarios.forEach(scenario => {
  const result = StressTesting.scenario(portfolio, scenario.shocks);
  console.log(`${scenario.name}: P&L ${result.pnl}`);
});
```

### 5. Position Sizing

```typescript
// Never risk more than 1-2% per trade
const riskPerTrade = 0.01;  // 1%
const portfolioValue = 100000;
const stopLossPercent = 0.05;  // 5%

const positionSize = (portfolioValue * riskPerTrade) / stopLossPercent;
console.log('Position Size:', positionSize);
```

## Common Pitfalls

1. **Ignoring Tail Risk**: VaR doesn't capture extreme events - use CVaR
2. **Over-Optimization**: Don't curve-fit to historical data
3. **Correlation Breakdown**: Correlations increase during crises
4. **Leverage Misuse**: Leverage amplifies both gains and losses
5. **Ignoring Costs**: Transaction costs and slippage matter
6. **Survivorship Bias**: Dead assets aren't in your dataset
7. **Look-Ahead Bias**: Don't use future information

## Risk Limits Example

```typescript
const RISK_LIMITS = {
  // Position limits
  maxPositionSize: 0.10,        // 10% max per position
  maxSectorExposure: 0.30,      // 30% max per sector
  maxCountryExposure: 0.50,     // 50% max per country
  
  // Risk limits
  maxPortfolioVaR: 0.05,        // 5% daily VaR
  maxDrawdown: 0.20,            // 20% max drawdown
  maxLeverage: 2.0,             // 2x max leverage
  
  // Concentration limits
  minPositions: 10,             // At least 10 positions
  maxCorrelation: 0.70,         // Max 70% correlation
  
  // Stop-loss
  maxLossPerTrade: 0.02,        // 2% max loss per trade
  maxDailyLoss: 0.05            // 5% max daily loss
};
```
