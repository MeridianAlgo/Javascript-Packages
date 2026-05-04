/**
 * Feature engineering helpers — lag features, rolling statistics, returns,
 * z-score normalization, and standard time-series transforms.
 */

/** Build lag features: [x_{t-1}, x_{t-2}, ..., x_{t-K}]. */
export function lagFeatures(xs: readonly number[], lags: number): number[][] {
  if (lags <= 0) throw new Error('lagFeatures: lags must be > 0');
  const out: number[][] = [];
  for (let i = lags; i < xs.length; i++) {
    const row: number[] = [];
    for (let k = 1; k <= lags; k++) row.push(xs[i - k]);
    out.push(row);
  }
  return out;
}

/** Rolling mean. */
export function rollingMean(xs: readonly number[], n: number): number[] {
  const out: number[] = new Array(xs.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    sum += xs[i];
    if (i >= n) sum -= xs[i - n];
    if (i >= n - 1) out[i] = sum / n;
  }
  return out;
}

/** Rolling standard deviation. */
export function rollingStd(xs: readonly number[], n: number): number[] {
  const out: number[] = new Array(xs.length).fill(NaN);
  for (let i = n - 1; i < xs.length; i++) {
    let mean = 0;
    for (let j = i - n + 1; j <= i; j++) mean += xs[j];
    mean /= n;
    let v = 0;
    for (let j = i - n + 1; j <= i; j++) v += (xs[j] - mean) ** 2;
    out[i] = Math.sqrt(v / (n - 1));
  }
  return out;
}

/** Log returns. */
export function logReturns(prices: readonly number[]): number[] {
  const out: number[] = new Array(prices.length).fill(NaN);
  for (let i = 1; i < prices.length; i++) out[i] = Math.log(prices[i] / prices[i - 1]);
  return out;
}

/** Simple returns. */
export function simpleReturns(prices: readonly number[]): number[] {
  const out: number[] = new Array(prices.length).fill(NaN);
  for (let i = 1; i < prices.length; i++) out[i] = prices[i] / prices[i - 1] - 1;
  return out;
}

/** Z-score normalization (population stats). */
export function zScore(xs: readonly number[]): number[] {
  const n = xs.length;
  if (n === 0) return [];
  const mean = xs.reduce((s, v) => s + v, 0) / n;
  let v = 0;
  for (const x of xs) v += (x - mean) ** 2;
  const sd = Math.sqrt(v / n);
  if (sd === 0) return new Array(n).fill(0);
  return xs.map((x) => (x - mean) / sd);
}

/** Min-max normalization to [0, 1]. */
export function minMaxScale(xs: readonly number[]): number[] {
  if (xs.length === 0) return [];
  let lo = Infinity;
  let hi = -Infinity;
  for (const x of xs) {
    if (x < lo) lo = x;
    if (x > hi) hi = x;
  }
  const r = hi - lo;
  if (r === 0) return xs.map(() => 0);
  return xs.map((x) => (x - lo) / r);
}

/** First difference (xs[i] - xs[i-1]). */
export function diff(xs: readonly number[], lag = 1): number[] {
  const out: number[] = new Array(xs.length).fill(NaN);
  for (let i = lag; i < xs.length; i++) out[i] = xs[i] - xs[i - lag];
  return out;
}
