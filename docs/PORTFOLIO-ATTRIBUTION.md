# Portfolio Construction & Attribution

## HRP — Hierarchical Risk Parity

```ts
import { hrpAllocate } from 'meridianalgo';

const returns: number[][] = /* T x N matrix of asset returns */;
const { weights, order } = hrpAllocate({ returns });
```

Lopez de Prado (2016): correlation distance → single-linkage clustering → recursive bisection with inverse-variance allocation. Robust to estimation error, no matrix inversion required.

## Kelly criterion

```ts
import { kellyBet, kellyContinuous, kellyMultiAsset, fractionalKelly } from 'meridianalgo';

kellyBet(0.6, 1, 1);                              // discrete: 60% win, 1:1 → 0.2
kellyContinuous(0.08, 0.04, 0.02);                // (μ-r)/σ²
kellyMultiAsset([0.08, 0.05], cov, 0);            // Σ⁻¹ (μ - r·1)
fractionalKelly(weights, 0.5);                    // half Kelly
```

## Brinson-Hood-Beebower attribution

```ts
import { brinsonAttribution } from 'meridianalgo';

const r = brinsonAttribution([
  { name: 'Tech', portfolioWeight: 0.5, benchmarkWeight: 0.4,
    portfolioReturn: 0.10, benchmarkReturn: 0.08 },
  { name: 'Energy', portfolioWeight: 0.5, benchmarkWeight: 0.6,
    portfolioReturn: 0.05, benchmarkReturn: 0.04 },
]);
// r.totals: { allocation, selection, interaction, activeReturn }
```

Decomposition: `active = allocation + selection + interaction`.

## Factor models

```ts
import { capmRegression, famaFrench3, famaFrench5, factorRegression } from 'meridianalgo';

capmRegression(excessReturns, mktRf);
famaFrench3(excessReturns, mktRf, smb, hml);
famaFrench5(excessReturns, mktRf, smb, hml, rmw, cma);
factorRegression(excessReturns, [factor1, factor2, ...]); // arbitrary
// → { alpha, betas, rSquared, residualStdError, n }
```

## Benchmark analytics

```ts
import {
  upCaptureRatio, downCaptureRatio, battingAverage,
  informationRatio, trackingError, activeShare,
} from 'meridianalgo';

upCaptureRatio({ portfolio, benchmark });
informationRatio({ portfolio, benchmark }, 252);   // annualized
activeShare(portfolioWeights, benchmarkWeights);   // Cremers-Petajisto
```

## CPPI / TIPP

```ts
import { cppiStrategy, tippStrategy } from 'meridianalgo';

const cppi = cppiStrategy({
  initialValue: 1_000_000,
  floorFraction: 0.85,
  multiplier: 4,
  riskyReturns,
  safeReturns,  // optional
});

const tipp = tippStrategy({
  initialValue: 1_000_000,
  floorFraction: 0.85,
  multiplier: 4,
  riskyReturns,
});
// each → { value, riskyAlloc, safeAlloc, floor }
```

CPPI: fixed floor. TIPP: floor ratchets up to never fall below `floorFraction × V_t`.
