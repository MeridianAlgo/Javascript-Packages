# Optimization Package

The `@meridianalgo/optimize` package provides tools for parameter optimization, hyperparameter tuning, and strategy calibration.

## Optimizers

### Grid Search
Exhaustive search over a predefined parameter space. Best for small numbers of parameters.

```typescript
import { GridSearchOptimizer } from '@meridianalgo/optimize';

const optimizer = new GridSearchOptimizer({
  parameters: {
    period: { min: 10, max: 50, step: 10 },
    threshold: { min: 1.5, max: 2.5, step: 0.1 }
  }
});

const result = await optimizer.optimize(async (params) => {
  // Run backtest or objective function
  return score;
});

console.log('Best Params:', result.bestParams);
console.log('Best Score:', result.bestScore);
```

### Random Search
Randomly samples the parameter space. More efficient for high-dimensional spaces than grid search.

```typescript
import { RandomSearchOptimizer } from '@meridianalgo/optimize';

const optimizer = new RandomSearchOptimizer({
  parameters: {
    lookback: { min: 20, max: 200 },
    entryThreshold: { min: 0.01, max: 0.05 }
  },
  iterations: 100
});

const result = await optimizer.optimize(async (params) => {
  // Objective function
  return score;
});
```

## Features

- **Asynchronous Objective Functions**: Support for long-running tasks like backtests.
- **Parametric Space**: Define ranges and steps for numeric parameters.
- **Parallel Execution Support**: Built-in hooks for future parallelization.
