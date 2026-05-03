/**
 * Time Value of Money (TVM) functions.
 * Excel/spreadsheet-compatible signatures.
 *
 * Sign convention: cash inflows positive, cash outflows negative.
 * `when` = 0 (end of period, default) or 1 (beginning of period / annuity due).
 */

export type WhenType = 0 | 1;

const DEFAULT_WHEN: WhenType = 0;

/**
 * Future value of an investment.
 * @param rate Periodic interest rate (decimal).
 * @param nper Total number of periods.
 * @param pmt Payment per period (default 0).
 * @param pv Present value (default 0).
 * @param when 0 = end of period, 1 = beginning.
 */
export function fv(
  rate: number,
  nper: number,
  pmt = 0,
  pv = 0,
  when: WhenType = DEFAULT_WHEN
): number {
  if (rate === 0) return -(pv + pmt * nper);
  const factor = Math.pow(1 + rate, nper);
  return -(pv * factor + (pmt * (1 + rate * when) * (factor - 1)) / rate);
}

/**
 * Present value of a future cash flow stream.
 */
export function pv(
  rate: number,
  nper: number,
  pmt = 0,
  fvAmount = 0,
  when: WhenType = DEFAULT_WHEN
): number {
  if (rate === 0) return -(fvAmount + pmt * nper);
  const factor = Math.pow(1 + rate, nper);
  return -(fvAmount + (pmt * (1 + rate * when) * (factor - 1)) / rate) / factor;
}

/**
 * Periodic payment for a loan / annuity.
 */
export function pmt(
  rate: number,
  nper: number,
  pvAmount: number,
  fvAmount = 0,
  when: WhenType = DEFAULT_WHEN
): number {
  if (rate === 0) return -(pvAmount + fvAmount) / nper;
  const factor = Math.pow(1 + rate, nper);
  return (
    -(pvAmount * factor + fvAmount) /
    ((1 + rate * when) * (factor - 1)) *
    rate
  );
}

/**
 * Number of periods needed to repay a loan / reach a target.
 */
export function nper(
  rate: number,
  pmtAmount: number,
  pvAmount: number,
  fvAmount = 0,
  when: WhenType = DEFAULT_WHEN
): number {
  if (rate === 0) {
    if (pmtAmount === 0) throw new Error('nper: pmt cannot be 0 when rate is 0');
    return -(pvAmount + fvAmount) / pmtAmount;
  }
  const z = (pmtAmount * (1 + rate * when)) / rate;
  return Math.log((-fvAmount + z) / (pvAmount + z)) / Math.log(1 + rate);
}

/**
 * Interest portion of a payment for a given period.
 */
export function ipmt(
  rate: number,
  per: number,
  nperTotal: number,
  pvAmount: number,
  fvAmount = 0,
  when: WhenType = DEFAULT_WHEN
): number {
  if (per < 1 || per > nperTotal) throw new Error('ipmt: per out of range');
  const totalPmt = pmt(rate, nperTotal, pvAmount, fvAmount, when);
  // remaining balance at start of period `per`
  const fvPrev = fv(rate, per - 1, totalPmt, pvAmount, when);
  let interest = fvPrev * rate;
  if (when === 1 && per > 1) interest /= 1 + rate;
  if (when === 1 && per === 1) interest = 0;
  return interest;
}

/**
 * Principal portion of a payment for a given period.
 */
export function ppmt(
  rate: number,
  per: number,
  nperTotal: number,
  pvAmount: number,
  fvAmount = 0,
  when: WhenType = DEFAULT_WHEN
): number {
  return pmt(rate, nperTotal, pvAmount, fvAmount, when) - ipmt(rate, per, nperTotal, pvAmount, fvAmount, when);
}

/**
 * Solve for periodic interest rate via Newton-Raphson.
 */
export function rate(
  nperTotal: number,
  pmtAmount: number,
  pvAmount: number,
  fvAmount = 0,
  when: WhenType = DEFAULT_WHEN,
  guess = 0.1,
  tol = 1e-8,
  maxIter = 100
): number {
  let r = guess;
  for (let i = 0; i < maxIter; i++) {
    const f = fv(r, nperTotal, pmtAmount, pvAmount, when) - fvAmount;
    // numeric derivative
    const eps = 1e-7;
    const fp = (fv(r + eps, nperTotal, pmtAmount, pvAmount, when) - fvAmount - f) / eps;
    if (Math.abs(fp) < 1e-12) break;
    const rNew = r - f / fp;
    if (Math.abs(rNew - r) < tol) return rNew;
    r = rNew;
  }
  throw new Error('rate: did not converge');
}

/**
 * Net Present Value of a cash flow stream.
 * `cashflows[0]` is at t=0 (no discount), index `t` is at end of period `t`.
 */
export function npv(rate: number, cashflows: readonly number[]): number {
  let total = 0;
  for (let t = 0; t < cashflows.length; t++) {
    total += cashflows[t] / Math.pow(1 + rate, t);
  }
  return total;
}

/**
 * Internal Rate of Return — solves NPV(IRR) = 0.
 * Uses bisection bracket then Newton-Raphson refinement.
 */
export function irr(
  cashflows: readonly number[],
  guess = 0.1,
  tol = 1e-8,
  maxIter = 200
): number {
  if (cashflows.length < 2) throw new Error('irr: need at least 2 cash flows');
  const hasPos = cashflows.some((c) => c > 0);
  const hasNeg = cashflows.some((c) => c < 0);
  if (!hasPos || !hasNeg) throw new Error('irr: need both positive and negative cash flows');

  let r = guess;
  for (let i = 0; i < maxIter; i++) {
    let f = 0;
    let fp = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const denom = Math.pow(1 + r, t);
      f += cashflows[t] / denom;
      if (t > 0) fp += (-t * cashflows[t]) / Math.pow(1 + r, t + 1);
    }
    if (Math.abs(fp) < 1e-14) break;
    const rNew = r - f / fp;
    if (Math.abs(rNew - r) < tol) return rNew;
    r = rNew;
  }
  throw new Error('irr: did not converge');
}

/**
 * Modified Internal Rate of Return.
 * @param cashflows Cash flows.
 * @param financeRate Cost of capital for negative flows.
 * @param reinvestRate Reinvestment rate for positive flows.
 */
export function mirr(
  cashflows: readonly number[],
  financeRate: number,
  reinvestRate: number
): number {
  const n = cashflows.length;
  if (n < 2) throw new Error('mirr: need at least 2 cash flows');

  let pvNeg = 0;
  let fvPos = 0;
  for (let t = 0; t < n; t++) {
    if (cashflows[t] < 0) pvNeg += cashflows[t] / Math.pow(1 + financeRate, t);
    else if (cashflows[t] > 0) fvPos += cashflows[t] * Math.pow(1 + reinvestRate, n - 1 - t);
  }
  if (pvNeg === 0) throw new Error('mirr: no negative cash flows');
  if (fvPos === 0) throw new Error('mirr: no positive cash flows');
  return Math.pow(fvPos / -pvNeg, 1 / (n - 1)) - 1;
}

/**
 * Compound Annual Growth Rate.
 */
export function cagr(beginValue: number, endValue: number, years: number): number {
  if (beginValue <= 0) throw new Error('cagr: beginValue must be > 0');
  if (years <= 0) throw new Error('cagr: years must be > 0');
  return Math.pow(endValue / beginValue, 1 / years) - 1;
}

/**
 * Compound interest final value.
 */
export function compoundInterest(
  principal: number,
  ratePerPeriod: number,
  periods: number,
  compoundsPerPeriod = 1
): number {
  return principal * Math.pow(1 + ratePerPeriod / compoundsPerPeriod, periods * compoundsPerPeriod);
}

/**
 * Discount factor at time t.
 */
export function discountFactor(rate: number, t: number): number {
  return 1 / Math.pow(1 + rate, t);
}

export interface AmortizationRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Loan amortization schedule.
 */
export function amortizationSchedule(
  principal: number,
  ratePerPeriod: number,
  nperTotal: number,
  when: WhenType = DEFAULT_WHEN
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const payment = pmt(ratePerPeriod, nperTotal, principal, 0, when);
  let balance = principal;
  for (let p = 1; p <= nperTotal; p++) {
    const interest = -ipmt(ratePerPeriod, p, nperTotal, principal, 0, when);
    const principalPaid = -ppmt(ratePerPeriod, p, nperTotal, principal, 0, when);
    balance -= principalPaid;
    schedule.push({
      period: p,
      payment: -payment,
      principal: principalPaid,
      interest,
      balance: Math.max(0, balance),
    });
  }
  return schedule;
}
