# Finance Module

Time Value of Money (TVM) and Bond analytics. Spreadsheet-compatible signatures (Excel/Google Sheets parity).

## Sign Convention

Cash inflows positive, outflows negative. Matches Excel.

## TVM Functions

```ts
import {
  fv, pv, pmt, nper, ipmt, ppmt, rate,
  npv, irr, mirr,
  cagr, compoundInterest, discountFactor,
  amortizationSchedule,
} from 'meridianalgo';
```

### Core

| Function | Purpose |
|----------|---------|
| `fv(rate, nper, pmt?, pv?, when?)` | Future value |
| `pv(rate, nper, pmt?, fv?, when?)` | Present value |
| `pmt(rate, nper, pv, fv?, when?)` | Periodic payment |
| `nper(rate, pmt, pv, fv?, when?)` | Number of periods |
| `ipmt(rate, per, nper, pv, fv?, when?)` | Interest portion of period payment |
| `ppmt(rate, per, nper, pv, fv?, when?)` | Principal portion |
| `rate(nper, pmt, pv, fv?, when?, guess?)` | Solve interest rate (Newton-Raphson) |

`when`: `0` = end of period (default), `1` = beginning (annuity due).

### Cash Flow Analysis

| Function | Purpose |
|----------|---------|
| `npv(rate, cashflows[])` | Net Present Value (cf[0] at t=0) |
| `irr(cashflows[], guess?)` | Internal Rate of Return |
| `mirr(cashflows[], financeRate, reinvestRate)` | Modified IRR |

### Helpers

- `cagr(begin, end, years)` — Compound Annual Growth Rate
- `compoundInterest(principal, rate, periods, compoundsPerPeriod?)`
- `discountFactor(rate, t)`
- `amortizationSchedule(principal, ratePerPeriod, nper, when?)` — full per-period schedule

### Examples

```ts
// 30-year mortgage, $200k @ 6%
const monthlyPayment = pmt(0.06 / 12, 360, 200000);
// → -1199.10

// Project IRR
const r = irr([-1000, 300, 400, 500, 600]);
// → ~0.1487

// 7-year CAGR
cagr(1000, 2000, 7);
// → 0.10409
```

## Bonds

```ts
import {
  cleanPrice, dirtyPrice, accruedInterest, yieldToMaturity,
  macaulayDuration, modifiedDuration, convexity, dv01,
  priceChangeApprox,
} from 'meridianalgo';
```

`BondParams = { face, couponRate, ytm, yearsToMaturity, frequency? }` — frequency defaults to 2 (semi-annual).

| Function | Returns |
|----------|---------|
| `cleanPrice(params)` | Flat price |
| `dirtyPrice(params, daysSinceLastCoupon, daysInPeriod)` | Invoice price (clean + AI) |
| `accruedInterest(face, couponRate, freq, daysSince, daysInPeriod)` | Accrued coupon |
| `yieldToMaturity(price, face, couponRate, years, freq?)` | YTM (bisection) |
| `macaulayDuration(params)` | Macaulay duration (years) |
| `modifiedDuration(params)` | Modified duration |
| `convexity(params)` | Convexity |
| `dv01(params)` | Price value of 1 bp |
| `priceChangeApprox(params, dy)` | Δprice from duration + convexity |

### Example

```ts
const bond = { face: 1000, couponRate: 0.05, ytm: 0.06, yearsToMaturity: 10, frequency: 2 };
const price = cleanPrice(bond);             // 925.61
const ytm = yieldToMaturity(price, 1000, 0.05, 10, 2); // 0.06
const mod = modifiedDuration(bond);         // ~7.66
const conv = convexity(bond);               // ~74
const bp1 = dv01(bond);                     // ~0.71
```
