/**
 * Benchmark-relative analytics: capture ratios, batting average, info ratio, active share.
 */

export interface BenchmarkInputs {
  /** Periodic portfolio returns. */
  portfolio: readonly number[];
  /** Periodic benchmark returns (same length). */
  benchmark: readonly number[];
}

function checkSameLen(a: readonly number[], b: readonly number[]) {
  if (a.length !== b.length) throw new Error('Length mismatch');
  if (a.length === 0) throw new Error('Empty series');
}

/** Up-market capture: avg portfolio return / avg benchmark return when benchmark > 0. */
export function upCaptureRatio({ portfolio, benchmark }: BenchmarkInputs): number {
  checkSameLen(portfolio, benchmark);
  let p = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < benchmark.length; i++) {
    if (benchmark[i] > 0) {
      p += portfolio[i];
      b += benchmark[i];
      n++;
    }
  }
  if (n === 0 || b === 0) return NaN;
  return p / b;
}

/** Down-market capture: avg portfolio return / avg benchmark return when benchmark < 0. */
export function downCaptureRatio({ portfolio, benchmark }: BenchmarkInputs): number {
  checkSameLen(portfolio, benchmark);
  let p = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < benchmark.length; i++) {
    if (benchmark[i] < 0) {
      p += portfolio[i];
      b += benchmark[i];
      n++;
    }
  }
  if (n === 0 || b === 0) return NaN;
  return p / b;
}

/** Batting average: fraction of periods where portfolio beats benchmark. */
export function battingAverage({ portfolio, benchmark }: BenchmarkInputs): number {
  checkSameLen(portfolio, benchmark);
  let wins = 0;
  for (let i = 0; i < portfolio.length; i++) {
    if (portfolio[i] > benchmark[i]) wins++;
  }
  return wins / portfolio.length;
}

/**
 * Information ratio: mean active return / tracking error.
 * Returns annualized info ratio if `periodsPerYear` provided.
 */
export function informationRatio(
  { portfolio, benchmark }: BenchmarkInputs,
  periodsPerYear?: number,
): number {
  checkSameLen(portfolio, benchmark);
  const active = portfolio.map((p, i) => p - benchmark[i]);
  const mean = active.reduce((s, x) => s + x, 0) / active.length;
  let v = 0;
  for (const x of active) v += (x - mean) ** 2;
  v /= Math.max(active.length - 1, 1);
  const sd = Math.sqrt(v);
  if (sd === 0) return NaN;
  const ir = mean / sd;
  return periodsPerYear ? ir * Math.sqrt(periodsPerYear) : ir;
}

/** Tracking error (stdev of active returns). */
export function trackingError(
  { portfolio, benchmark }: BenchmarkInputs,
  periodsPerYear?: number,
): number {
  checkSameLen(portfolio, benchmark);
  const active = portfolio.map((p, i) => p - benchmark[i]);
  const mean = active.reduce((s, x) => s + x, 0) / active.length;
  let v = 0;
  for (const x of active) v += (x - mean) ** 2;
  v /= Math.max(active.length - 1, 1);
  const sd = Math.sqrt(v);
  return periodsPerYear ? sd * Math.sqrt(periodsPerYear) : sd;
}

/**
 * Active share (Cremers-Petajisto):
 *   ActiveShare = 0.5 * Σ |w_p - w_b|
 * Range 0 (index hugger) to 1 (no overlap with benchmark).
 */
export function activeShare(
  portfolioWeights: readonly number[],
  benchmarkWeights: readonly number[],
): number {
  if (portfolioWeights.length !== benchmarkWeights.length) {
    throw new Error('activeShare: weight vector lengths differ');
  }
  let sum = 0;
  for (let i = 0; i < portfolioWeights.length; i++) {
    sum += Math.abs(portfolioWeights[i] - benchmarkWeights[i]);
  }
  return 0.5 * sum;
}
