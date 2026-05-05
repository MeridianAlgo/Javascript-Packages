# Portfolio Optimization Package

The `@meridianalgo/portfolio` package provides advanced tools for asset allocation and portfolio optimization.

## Optimizers

### Mean-Variance Optimization (MVO)
Classic Markowitz optimization to find the tangency portfolio or minimum variance portfolio.

```typescript
import { MeanVarianceOptimizer } from '@meridianalgo/portfolio';

const mvo = new MeanVarianceOptimizer({
  returns: expectedReturns, // Array of expected returns
  covariance: covMatrix,     // Covariance matrix
  riskFreeRate: 0.02
});

const weights = mvo.optimize('sharpe'); // Maximize Sharpe Ratio
```

### Risk Parity
Allocates capital such that each asset contributes equally to the total portfolio risk.

```typescript
import { RiskParityOptimizer } from '@meridianalgo/portfolio';

const rp = new RiskParityOptimizer(covMatrix);
const weights = rp.optimize();
```

### Hierarchical Risk Parity (HRP)
Modern allocation method that uses machine learning (clustering) to group similar assets and allocate based on the hierarchy.

```typescript
import { hrpAllocate } from '@meridianalgo/portfolio';

const weights = hrpAllocate(returnsMatrix);
```

### Black-Litterman
Combines market equilibrium with investor views to produce stable, intuitive weights.

```typescript
import { BlackLittermanModel } from '@meridianalgo/portfolio';

const bl = new BlackLittermanModel({
  priorReturns: pi,
  covariance: sigma,
  views: P,
  viewReturns: Q,
  confidence: Omega
});

const adjustedReturns = bl.calculate();
```

## Position Sizing

### Kelly Criterion
Optimal sizing for bets with known probabilities.

```typescript
import { kellyBet, kellyMultiAsset } from '@meridianalgo/portfolio';

// Single asset
const fraction = kellyBet(0.55, 2.0); // 55% win rate, 2:1 reward/risk

// Multi-asset
const weights = kellyMultiAsset(expectedReturns, covMatrix);
```
