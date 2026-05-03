# Execution & Microstructure

## Execution algorithms

Schedule a parent order into child slices.

### VWAP

```ts
import { vwapSchedule } from 'meridianalgo';

const profile = [0.05, 0.10, 0.15, 0.20, 0.20, 0.15, 0.10, 0.05]; // sums to 1
const sched = vwapSchedule({ totalQty: 100_000, volumeProfile: profile });
// sched[i] = { index, startFrac, endFrac, qty, cumQty, marketShare }
```

Slices proportional to forecasted volume profile (e.g. U-shaped intraday curve).

### TWAP

```ts
import { twapSchedule } from 'meridianalgo';

const sched = twapSchedule({ totalQty: 100_000, buckets: 10 });
// 10 equal slices of 10_000 each
```

### POV (Participation of Volume)

```ts
import { povSchedule } from 'meridianalgo';

const marketVolume = [10_000, 12_000, 15_000, 8_000];
const sched = povSchedule({
  totalQty: 5_000,
  participation: 0.10, // 10% of market volume
  marketVolume,
});
// stops once cumulative qty == 5000
```

### Implementation Shortfall (Almgren-Chriss)

```ts
import { implementationShortfallSchedule } from 'meridianalgo';

const sched = implementationShortfallSchedule({
  totalQty: 100_000,
  buckets: 20,
  sigma: 0.02,        // per-bucket vol
  gamma: 1e-5,        // permanent impact
  eta: 1e-4,          // temporary impact
  riskAversion: 1e-6, // larger → front-load
});
```

Closed-form solution: `x_k = X * sinh(κ(T-t_k)) / sinh(κT)` with `κ = √(λσ²/η)`.
- Higher risk aversion `λ` → front-loaded
- Lower `λ` → approaches TWAP

## Order book

```ts
import { OrderBook } from 'meridianalgo';

const book = new OrderBook({
  bids: [{ price: 99.5, size: 100 }, { price: 99.0, size: 200 }],
  asks: [{ price: 100.5, size: 150 }, { price: 101.0, size: 300 }],
});

book.midPrice();         // 100
book.quotedSpread();     // 1.0
book.relativeSpread();   // 0.01
book.microprice();       // size-weighted mid
book.imbalance();        // (bidSize - askSize) / total
book.walkMarketOrder(200); // { avgPrice, slippage, filled }
```

## Spread estimators

```ts
import { effectiveSpread, realizedSpread, rollSpread } from 'meridianalgo';

const trades = [
  { price: 100.5, mid: 100, side: 1 as const, midFuture: 100.3 },
  { price: 99.5,  mid: 100, side: -1 as const, midFuture: 99.7 },
];
effectiveSpread(trades);  // avg of 2 * D * (P - M)
realizedSpread(trades);   // permanent-component-corrected
rollSpread(prices);       // 2 * sqrt(-cov(ΔP_t, ΔP_{t-1}))
```

## Market impact

```ts
import { squareRootImpact, almgrenChrissExpectedCost } from 'meridianalgo';

squareRootImpact({ qty: 50_000, adv: 1_000_000, sigma: 0.02, c: 1 });
// → c * σ * √(qty/ADV)

almgrenChrissExpectedCost({
  qty: 100_000, T: 20, sigma: 0.02, gamma: 1e-5, eta: 1e-4,
});
// → { expectedCost: 0.5γX² + ηX²/T, variance: σ²X²T/3 }
```
