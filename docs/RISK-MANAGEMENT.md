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

```typescript
const maxDD = RiskMetrics.maxDrawdown(returns);

console.log('Max Drawdown:', maxDD.maxDrawdown);
console.log('Max Drawdown %:', maxDD.maxDrawdownPercent);
console.log('Drawdown Duration:', maxDD.duration);
console.log('Recovery Time:', maxDD.recoveryTime);
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

Return divided by maximum drawdown.

```typescript
const calmar = PerformanceMetrics.calmarRatio(
  returns,
  maxDD.maxDrawdownPercent
);

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

### Average Win/Loss

```typescript
const { averageWin, averageLoss } = PerformanceMetrics.averageWinLoss(returns);

console.log('Average Win:', averageWin);
console.log('Average Loss:', averageLoss);
console.log('Win/Loss Ratio:', averageWin / averageLoss);
```

## Portfolio Analysis

### Comprehensive Performance Analysis

Get all metrics at once:

```typescript
const prices = [/* historical prices */];
const benchmarkPrices = [/* benchmark prices */];

const analysis = PerformanceMetrics.performanceAnalysis(
  prices,
  benchmarkPrices,
  0.02  // Risk-free rate
);

console.log('Performance Analysis:', {
  totalReturn: analysis.totalReturn,
  annualizedReturn: analysis.annualizedReturn,
  volatility: analysis.volatility,
  sharpeRatio: analysis.sharpeRatio,
  sortinoRatio: analysis.sortinoRatio,
  maxDrawdown: analysis.maxDrawdown,
  calmarRatio: analysis.calmarRatio,
  winRate: analysis.winRate,
  profitFactor: analysis.profitFactor,
  var95: analysis.var95,
  cvar95: analysis.cvar95,
  beta: analysis.beta,
  alpha: analysis.alpha,
  informationRatio: analysis.informationRatio
});
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

### Historical Stress Test

```typescript
import { StressTesting } from 'meridianalgo';

const portfolio = {
  positions: [
    { symbol: 'AAPL', qty: 100, price: 150 },
    { symbol: 'GOOGL', qty: 50, price: 2800 }
  ]
};

// Test against 2008 financial crisis
const crisis2008 = {
  'AAPL': -0.50,  // -50%
  'GOOGL': -0.45  // -45%
};

const stressResult = StressTesting.historicalScenario(
  portfolio,
  crisis2008
);

console.log('Stressed Portfolio Value:', stressResult.value);
console.log('Loss:', stressResult.loss);
console.log('Loss %:', stressResult.lossPercent);
```

### Monte Carlo Simulation

```typescript
const simResults = StressTesting.monteCarlo(
  portfolio,
  {
    simulations: 10000,
    horizon: 252,  // 1 year
    confidence: 0.95
  }
);

console.log('Expected Value:', simResults.expectedValue);
console.log('VaR (95%):', simResults.var95);
console.log('CVaR (95%):', simResults.cvar95);
console.log('Worst Case:', simResults.worstCase);
console.log('Best Case:', simResults.bestCase);
```

### Sensitivity Analysis

```typescript
const sensitivity = StressTesting.sensitivity(
  portfolio,
  'AAPL',
  [-0.10, -0.05, 0, 0.05, 0.10]  // Price changes
);

sensitivity.forEach(result => {
  console.log(`AAPL ${result.change * 100}%: Portfolio ${result.portfolioChange * 100}%`);
});
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
  const result = StressTesting.historicalScenario(portfolio, scenario.shocks);
  console.log(`${scenario.name}: ${result.lossPercent}%`);
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
