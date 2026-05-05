# Stochastic Models Package

The `@meridianalgo/stochastic` package provides tools for simulating stochastic processes and running Monte Carlo simulations.

## Process Models

### Geometric Brownian Motion (GBM)
Standard model for asset price paths.
`dS_t = mu * S_t dt + sigma * S_t dW_t`

```typescript
import { GBM } from '@meridianalgo/stochastic';

const gbm = new GBM({
  S0: 100,
  mu: 0.05,
  sigma: 0.2,
  T: 1,
  steps: 252
});

const paths = gbm.simulate({ paths: 100 });
```

### Heston Model
Stochastic volatility model.
`dS_t = mu * S_t dt + sqrt(v_t) * S_t dW1_t`
`dv_t = kappa * (theta - v_t) dt + xi * sqrt(v_t) dW2_t`

```typescript
import { Heston } from '@meridianalgo/stochastic';

const heston = new Heston({
  S0: 100,
  v0: 0.04,
  mu: 0.05,
  kappa: 2.0,
  theta: 0.04,
  xi: 0.3,
  rho: -0.7,
  T: 1,
  steps: 252
});
```

### Merton Jump Diffusion
GBM with Poisson jumps.

### Cox-Ingersoll-Ross (CIR)
Mean-reverting square-root process (often used for interest rates).

## Monte Carlo Engine

A unified engine for running simulations with variance reduction techniques.

```typescript
import { MonteCarloEngine } from '@meridianalgo/stochastic';

const engine = new MonteCarloEngine(
  () => gbm.simulateTerminal({ paths: 10000, antithetic: true }),
  (terminals) => terminals.map(s => Math.max(s - 100, 0)) // Call option payoff
);

const result = engine.run();
console.log('Price:', result.estimate);
console.log('95% CI:', result.ci95);
```

## Random Number Generation

Standardized random number generators with seeding support.
- `normalRng(seed?: number): () => number`
- `uniformRng(seed?: number): () => number`
