# Options & Stochastic Models

## Black-Scholes-Merton

European option pricing, full Greeks, put-call parity.

```ts
import { blackScholesPrice, blackScholesGreeks, putCallParity } from 'meridianalgo';

const params = { S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, q: 0 };
const call = blackScholesPrice(params, 'call');     // 10.4506
const put = blackScholesPrice(params, 'put');       // 5.5735
const greeks = blackScholesGreeks(params, 'call');  // { delta, gamma, theta, vega, rho }
```

`q` (dividend yield) defaults to 0. Theta is per year — divide by 365 for per-day.

## Higher-Order Greeks

Second- and third-order sensitivities for volatility trading and risk management.

```ts
import { higherOrderGreeks } from 'meridianalgo';

const params = { S: 100, K: 105, T: 0.75, r: 0.03, sigma: 0.25, q: 0.01 };
const g = higherOrderGreeks(params, 'call');
// {
//   vanna,   // ∂delta/∂sigma = ∂vega/∂spot
//   charm,   // ∂delta/∂time (delta decay, per year)
//   vomma,   // ∂vega/∂sigma  (a.k.a. volga)
//   veta,    // ∂vega/∂time   (per year)
//   speed,   // ∂gamma/∂spot  (third order)
//   zomma,   // ∂gamma/∂sigma
//   color,   // ∂gamma/∂time  (gamma decay, per year)
//   ultima,  // ∂vomma/∂sigma (third order)
//   dualDelta, // ∂price/∂strike
//   dualGamma, // ∂²price/∂strike²
// }
```

All formulas are the closed-form Black-Scholes-Merton sensitivities (verified
against finite differences). The time-decay Greeks — `charm`, `color`, `veta` —
share a single convention: they are derivatives with respect to **calendar time**
(`∂/∂t`), so a negative value means the corresponding first-order Greek shrinks as
expiry approaches. They are quoted per year; divide by 365 for a per-day estimate.
Degenerate inputs (expired option or non-positive volatility) return all-zero
sensitivities.

## Implied Volatility

```ts
import { impliedVolatility, impliedVolNewton, impliedVolBrent } from 'meridianalgo';

const iv = impliedVolatility(marketPrice, S, K, T, r, 'call');
```

`impliedVolatility` tries Newton-Raphson first (fast), falls back to Brent (robust).

## OptionChain

Manage a strikes × expiries grid.

```ts
import { OptionChain } from 'meridianalgo';

const chain = new OptionChain({ spot: 100, rate: 0.05 });
chain.addBulk([
  { strike: 95, expiry: 0.5, type: 'call', price: 8.20 },
  { strike: 100, expiry: 0.5, type: 'call', price: 5.10 },
  { strike: 105, expiry: 0.5, type: 'call', price: 2.80 },
]);
chain.computeImpliedVols().computeGreeks();
const slice = chain.slice({ expiry: 0.5, type: 'call' });
```

## Stochastic Models

### GBM

```ts
import { GBM } from 'meridianalgo';

const gbm = new GBM({ S0: 100, mu: 0.05, sigma: 0.2, T: 1, steps: 252 });
const paths = gbm.simulate({ paths: 10000, antithetic: true, seed: 42 });
const terminal = gbm.simulateTerminal({ paths: 100000, antithetic: true });
```

### Heston Stochastic Volatility

```ts
import { Heston } from 'meridianalgo';

const heston = new Heston({
  S0: 100, v0: 0.04, mu: 0.05,
  kappa: 2, theta: 0.04, xi: 0.3, rho: -0.7,
  T: 1, steps: 252,
});
const sims = heston.simulate({ paths: 10000, seed: 1 });
// Each sim has { prices: number[], variances: number[] }
```

### Merton Jump-Diffusion

```ts
import { MertonJump } from 'meridianalgo';

const merton = new MertonJump({
  S0: 100, mu: 0.05, sigma: 0.2,
  lambda: 1,         // 1 jump/year on average
  muJ: -0.1,         // jump log-mean
  sigmaJ: 0.15,      // jump log-stdev
  T: 1, steps: 252,
});
const paths = merton.simulate({ paths: 10000 });
```

### CIR Interest Rate

```ts
import { CIR } from 'meridianalgo';

const cir = new CIR({ r0: 0.03, kappa: 2, theta: 0.04, sigma: 0.1, T: 1, steps: 252 });
console.log(cir.fellerSatisfied());           // true
const paths = cir.simulate({ paths: 1000 });
const bondPrice = cir.bondPrice(0, 5, 0.03);  // closed-form zero-coupon bond
```

## Monte Carlo Engine

Variance reduction via antithetic sampling (in samplers) + control variates.

```ts
import { GBM, MonteCarloEngine } from 'meridianalgo';

const S0 = 100, K = 100, T = 1, r = 0.05, sigma = 0.2;
const gbm = new GBM({ S0, mu: r, sigma, T, steps: 1 });

const engine = new MonteCarloEngine(
  () => gbm.simulateTerminal({ paths: 100000, antithetic: true, seed: 42 }),
  (terminals) => terminals.map(s => Math.max(s - K, 0) * Math.exp(-r * T))
);

const { estimate, stderr, ci95, paths } = engine.run();
```

For control variates: pass `{ control: { values, expected } }` to `engine.run()`. The engine picks the optimal beta automatically.
