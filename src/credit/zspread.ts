/**
 * Z-spread: parallel shift to the spot curve such that the discounted bond
 * cash flows equal the market price.
 *
 *   PV = sum_i CF_i / exp((y_i + z) * t_i) = market_price
 */

export interface BondCashflow {
  time: number;
  amount: number;
}

/**
 * Solve Z-spread via bisection on price.
 * @param spotCurve continuous zero rate at maturity t
 */
export function zSpread(
  cashflows: readonly BondCashflow[],
  spotCurve: (t: number) => number,
  marketPrice: number,
  tol = 1e-8,
  maxIter = 200
): number {
  const priceAt = (z: number): number =>
    cashflows.reduce((sum, cf) => sum + cf.amount * Math.exp(-(spotCurve(cf.time) + z) * cf.time), 0);

  let lo = -0.5;
  let hi = 0.5;
  let pLo = priceAt(lo) - marketPrice;
  let pHi = priceAt(hi) - marketPrice;
  let attempts = 0;
  while (pLo * pHi > 0 && attempts < 30) {
    hi *= 2;
    pHi = priceAt(hi) - marketPrice;
    attempts++;
  }
  if (pLo * pHi > 0) throw new Error('zSpread: cannot bracket root');

  let mid = 0;
  for (let i = 0; i < maxIter; i++) {
    mid = (lo + hi) / 2;
    const p = priceAt(mid) - marketPrice;
    if (Math.abs(p) < tol) return mid;
    if (p * pLo < 0) {
      hi = mid;
      pHi = p;
    } else {
      lo = mid;
      pLo = p;
    }
  }
  return mid;
}
