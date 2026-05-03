# Yield Curves & Credit Risk

## YieldCurve (Nelson-Siegel)

```ts
import { YieldCurve } from 'meridianalgo';

const curve = YieldCurve.fit([
  { maturity: 0.25, yield: 0.025 },
  { maturity: 1, yield: 0.030 },
  { maturity: 5, yield: 0.040 },
  { maturity: 10, yield: 0.045 },
  { maturity: 30, yield: 0.048 },
]);

curve.spotRate(7);                 // continuous zero rate at 7y
curve.discountFactor(7);           // = exp(-r*7)
curve.forwardRate(5);              // instantaneous forward at 5y
curve.forwardRateBetween(2, 5);    // 2y-5y forward
curve.parameters();                // { b0, b1, b2, tau }
```

Fit uses tau grid-search + OLS on (b0, b1, b2). 4+ observations required.

## Merton Structural Credit Model

Equity = European call on firm assets.

```ts
import { mertonStructural, impliedAssetVol } from 'meridianalgo';

const r = mertonStructural({
  V: 100,        // firm assets
  D: 80,         // debt face
  T: 1,
  r: 0.05,
  sigmaV: 0.3,
});
// { equityValue, distanceToDefault, defaultProb, riskNeutralPD }

const sigma = impliedAssetVol(equityObserved, V, D, T, r);
```

## CDS Pricing & Hazard Bootstrap

```ts
import { priceCDS, bootstrapHazardCurve, survivalProbability } from 'meridianalgo';

const df = (t: number) => Math.exp(-0.03 * t);
const result = priceCDS({
  schedule: { paymentTimes: [0.25, 0.5, 0.75, 1], dayCountFractions: [0.25, 0.25, 0.25, 0.25] },
  recoveryRate: 0.4,
  spread: 0.0125,
  hazardCurve: [{ endTime: 1, lambda: 0.025 }],
  discountFactor: df,
});
// { premiumLegPV, protectionLegPV, netPV, fairSpread }

const hazardCurve = bootstrapHazardCurve([
  { maturity: 1, spread: 0.012, recoveryRate: 0.4, schedule: ... },
  { maturity: 3, spread: 0.018, recoveryRate: 0.4, schedule: ... },
  { maturity: 5, spread: 0.022, recoveryRate: 0.4, schedule: ... },
], df);
```

## Z-Spread

Parallel curve shift to match market price.

```ts
import { zSpread } from 'meridianalgo';

const z = zSpread(cashflows, spotCurveFn, marketPrice);
```

## Expected Loss

```ts
import { expectedLoss, portfolioExpectedLoss, impliedCreditSpread, pdFromSpread } from 'meridianalgo';

expectedLoss({ pd: 0.05, lgd: 0.4, ead: 1_000_000 });   // 20,000
portfolioExpectedLoss([...]);
impliedCreditSpread(0.05, 0.6, 1);   // continuous spread
pdFromSpread(0.03, 0.4, 1);
```
