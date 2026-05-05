# Yield Curves Package

The `@meridianalgo/curves` package provides tools for fitting and analyzing yield curves using parametric models like Nelson-Siegel.

## Nelson-Siegel Model

The model defines the yield $y(t)$ for maturity $t$ as:
$y(t) = \beta_0 + \beta_1 \frac{1 - e^{-t/\tau}}{t/\tau} + \beta_2 (\frac{1 - e^{-t/\tau}}{t/\tau} - e^{-t/\tau})$

Where:
- $\beta_0$: Level (long-term rate)
- $\beta_1$: Slope (short-term component)
- $\beta_2$: Curvature (medium-term component)
- $\tau$: Decay factor

## Usage

### Fitting a Curve

```typescript
import { YieldCurve, YieldObservation } from '@meridianalgo/curves';

const observations: YieldObservation[] = [
  { maturity: 0.25, yield: 0.0525 },
  { maturity: 2,    yield: 0.0485 },
  { maturity: 10,   yield: 0.0425 },
  { maturity: 30,   yield: 0.0435 }
];

const curve = YieldCurve.fit(observations);
```

### Querying Rates

```typescript
// Get spot rate for 5-year maturity
const rate5y = curve.spotRate(5);

// Get discount factor
const df = curve.discountFactor(5);

// Get instantaneous forward rate
const fwd = curve.forwardRate(5);

// Get forward rate between two periods (e.g., 1Y1Y forward)
const fwd1y1y = curve.forwardRateBetween(1, 2);
```

## Technical Details

The fitting algorithm uses a robust two-step approach:
1. Grid search over the non-linear decay parameter $\tau$.
2. Ordinary Least Squares (OLS) to find the linear parameters $\beta_0, \beta_1, \beta_2$ for each $\tau$.
3. Selection of the parameters that minimize the Sum of Squared Errors (SSE).
