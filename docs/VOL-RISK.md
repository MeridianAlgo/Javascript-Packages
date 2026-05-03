# Volatility & Advanced Risk

## GARCH Family (MLE)

Pure-JS Nelder-Mead optimization, no SciPy/R dependencies.

```ts
import { fitGARCH11, fitEGARCH, fitGJR, garch11Forecast } from 'meridianalgo';

const result = fitGARCH11(returns);
// { params: { omega, alpha, beta, mu }, variances, logLikelihood, converged }

const fcst = garch11Forecast(lastVar, lastResid, result.params, 30);
```

Models: GARCH(1,1), EGARCH (asymmetric, log-scale), GJR-GARCH (leverage indicator).

## Range-Based Volatility Estimators

```ts
import {
  parkinsonVolatility, garmanKlassVolatility,
  rogersSatchellVolatility, yangZhangVolatility,
  fitHARRV,
} from 'meridianalgo';

const bars = [{ open, high, low, close }, ...];
parkinsonVolatility(bars);    // HL only — ~5x more efficient than CTC
garmanKlassVolatility(bars);  // OHLC — ~7x more efficient
rogersSatchellVolatility(bars); // drift-independent
yangZhangVolatility(bars);    // overnight + open-close + RS

// Heterogeneous Autoregressive RV
const har = fitHARRV(realizedVariances);
// { beta0, betaD, betaW, betaM, fitted, residuals }
```

## Cornish-Fisher VaR

Adjusts Gaussian VaR for skew and kurtosis.

```ts
import { cornishFisherVaR } from 'meridianalgo';
const var95 = cornishFisherVaR(returns, 0.95);  // positive number = loss
```

## Drawdown Analytics

```ts
import {
  drawdownSeries, painIndex, conditionalDrawdownAtRisk,
  topNDrawdowns, gainToPainRatio,
} from 'meridianalgo';

drawdownSeries(equityCurve);          // [0, ..., -0.12, ...]
painIndex(equityCurve);               // average drawdown
conditionalDrawdownAtRisk(equity, 0.95);
const top5 = topNDrawdowns(equity, 5); // [{ startIdx, troughIdx, endIdx, depth, durationBars }]
gainToPainRatio(returns);
```

## Probabilistic Sharpe / Min Track Record Length

Bailey & Lopez de Prado (2012).

```ts
import {
  probabilisticSharpeRatio, minTrackRecordLength,
  sharpeConfidenceInterval,
} from 'meridianalgo';

probabilisticSharpeRatio(returns, 0); // P(true SR > 0)
minTrackRecordLength(returns, 0, 0.05); // bars needed for 95% confidence
sharpeConfidenceInterval(returns, 0.95, 1000); // bootstrap CI
```

## Named Stress Scenarios

```ts
import { listStressScenarios, getStressScenario, applyStressScenario } from 'meridianalgo';

listStressScenarios();
// ['2008-crisis', 'covid-crash', 'dot-com', 'black-monday', 'taper-tantrum',
//  'asian-crisis', 'lehman-week']

const result = applyStressScenario(
  { equity: 1_000_000, rateDuration: 50_000, creditSpreadDuration: 20_000 },
  'covid-crash'
);
// { pnl, breakdown: { equity, rates, credit, vol, fx } }
```

## Risk Budgeting (ERC)

Spinu cyclic coordinate descent.

```ts
import { equalRiskContribution, riskBudgetingWeights } from 'meridianalgo';

const erc = equalRiskContribution(covariance);
// { weights, riskContributions, portfolioVolatility, iterations, converged }

const custom = riskBudgetingWeights(covariance, [0.5, 0.3, 0.2]);
```
