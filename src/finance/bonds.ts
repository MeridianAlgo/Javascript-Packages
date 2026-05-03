/**
 * Bond pricing and analytics.
 *
 * Conventions:
 * - face: face value (par), e.g. 1000.
 * - couponRate: annual coupon rate as decimal (e.g. 0.05 for 5%).
 * - ytm: annual yield to maturity as decimal.
 * - frequency: coupon payments per year (1 = annual, 2 = semi-annual, 4 = quarterly).
 * - yearsToMaturity: time to maturity in years.
 */

export interface BondParams {
  face: number;
  couponRate: number;
  ytm: number;
  yearsToMaturity: number;
  frequency?: number;
}

/**
 * Clean (flat) bond price.
 */
export function cleanPrice(params: BondParams): number {
  const { face, couponRate, ytm, yearsToMaturity, frequency = 2 } = params;
  const n = Math.round(yearsToMaturity * frequency);
  const c = (couponRate * face) / frequency;
  const r = ytm / frequency;
  if (r === 0) return c * n + face;
  const annuity = (c * (1 - Math.pow(1 + r, -n))) / r;
  const principal = face / Math.pow(1 + r, n);
  return annuity + principal;
}

/**
 * Accrued interest for partial coupon period.
 * @param daysSinceLastCoupon Days elapsed since last coupon.
 * @param daysInPeriod Total days in current coupon period.
 */
export function accruedInterest(
  face: number,
  couponRate: number,
  frequency: number,
  daysSinceLastCoupon: number,
  daysInPeriod: number
): number {
  const c = (couponRate * face) / frequency;
  return c * (daysSinceLastCoupon / daysInPeriod);
}

/**
 * Dirty (full / invoice) price = clean price + accrued interest.
 */
export function dirtyPrice(
  params: BondParams,
  daysSinceLastCoupon: number,
  daysInPeriod: number
): number {
  const clean = cleanPrice(params);
  const ai = accruedInterest(
    params.face,
    params.couponRate,
    params.frequency ?? 2,
    daysSinceLastCoupon,
    daysInPeriod
  );
  return clean + ai;
}

/**
 * Yield to maturity from market price (bisection + Newton-Raphson).
 */
export function yieldToMaturity(
  marketPrice: number,
  face: number,
  couponRate: number,
  yearsToMaturity: number,
  frequency = 2,
  tol = 1e-8,
  maxIter = 200
): number {
  let lo = -0.5;
  let hi = 1.0;
  const priceAt = (y: number): number =>
    cleanPrice({ face, couponRate, ytm: y, yearsToMaturity, frequency });

  // ensure bracket
  let pLo = priceAt(lo) - marketPrice;
  let pHi = priceAt(hi) - marketPrice;
  let expand = 0;
  while (pLo * pHi > 0 && expand < 20) {
    hi *= 2;
    pHi = priceAt(hi) - marketPrice;
    expand++;
  }
  if (pLo * pHi > 0) throw new Error('yieldToMaturity: cannot bracket root');

  // bisection
  let y = (lo + hi) / 2;
  for (let i = 0; i < maxIter; i++) {
    y = (lo + hi) / 2;
    const p = priceAt(y) - marketPrice;
    if (Math.abs(p) < tol || (hi - lo) / 2 < tol) return y;
    if (p * pLo < 0) {
      hi = y;
      pHi = p;
    } else {
      lo = y;
      pLo = p;
    }
  }
  return y;
}

/**
 * Macaulay duration (time-weighted average of discounted cash flows).
 */
export function macaulayDuration(params: BondParams): number {
  const { face, couponRate, ytm, yearsToMaturity, frequency = 2 } = params;
  const n = Math.round(yearsToMaturity * frequency);
  const c = (couponRate * face) / frequency;
  const r = ytm / frequency;
  let weightedSum = 0;
  let priceSum = 0;
  for (let t = 1; t <= n; t++) {
    const cf = t === n ? c + face : c;
    const pvCf = cf / Math.pow(1 + r, t);
    weightedSum += t * pvCf;
    priceSum += pvCf;
  }
  return weightedSum / priceSum / frequency;
}

/**
 * Modified duration = Macaulay / (1 + ytm/frequency).
 */
export function modifiedDuration(params: BondParams): number {
  const macD = macaulayDuration(params);
  const frequency = params.frequency ?? 2;
  return macD / (1 + params.ytm / frequency);
}

/**
 * Convexity.
 */
export function convexity(params: BondParams): number {
  const { face, couponRate, ytm, yearsToMaturity, frequency = 2 } = params;
  const n = Math.round(yearsToMaturity * frequency);
  const c = (couponRate * face) / frequency;
  const r = ytm / frequency;
  let sum = 0;
  let priceSum = 0;
  for (let t = 1; t <= n; t++) {
    const cf = t === n ? c + face : c;
    const pvCf = cf / Math.pow(1 + r, t);
    sum += t * (t + 1) * pvCf;
    priceSum += pvCf;
  }
  return sum / (priceSum * Math.pow(1 + r, 2) * frequency * frequency);
}

/**
 * DV01 (price value of 1 basis point) — absolute price change for 1bp yield drop.
 */
export function dv01(params: BondParams): number {
  const bp = 0.0001;
  const pUp = cleanPrice({ ...params, ytm: params.ytm + bp });
  const pDn = cleanPrice({ ...params, ytm: params.ytm - bp });
  return (pDn - pUp) / 2;
}

/**
 * Approximate price change from yield change using duration + convexity.
 */
export function priceChangeApprox(
  params: BondParams,
  yieldChange: number
): number {
  const price = cleanPrice(params);
  const modD = modifiedDuration(params);
  const conv = convexity(params);
  return price * (-modD * yieldChange + 0.5 * conv * yieldChange * yieldChange);
}
