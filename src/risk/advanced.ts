/**
 * Advanced risk metrics:
 *   - Cornish-Fisher VaR (skew/kurt-adjusted)
 *   - Pain Index, CDaR, top-N drawdowns
 *   - Probabilistic Sharpe Ratio (PSR), Min Track Record Length, Sharpe CI
 *   - Gain-to-pain
 */

const SQRT_2 = Math.sqrt(2);

/** Inverse standard-normal CDF (Acklam's algorithm). */
export function inverseNormalCdf(p: number): number {
  if (p <= 0 || p >= 1) throw new Error('inverseNormalCdf: p must be in (0,1)');
  // Beasley-Springer-Moro
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

function mean(arr: readonly number[]): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function moments(arr: readonly number[]): { mu: number; sigma: number; skew: number; kurt: number } {
  const n = arr.length;
  const mu = mean(arr);
  let m2 = 0, m3 = 0, m4 = 0;
  for (let i = 0; i < n; i++) {
    const d = arr[i] - mu;
    const d2 = d * d;
    m2 += d2;
    m3 += d2 * d;
    m4 += d2 * d2;
  }
  m2 /= n;
  m3 /= n;
  m4 /= n;
  const sigma = Math.sqrt(m2);
  const skew = sigma > 0 ? m3 / (sigma ** 3) : 0;
  const kurt = sigma > 0 ? m4 / (sigma ** 4) - 3 : 0; // excess
  return { mu, sigma, skew, kurt };
}

/**
 * Cornish-Fisher modified VaR — adjusts the parametric Gaussian VaR for
 * higher moments (skew, excess kurtosis).
 *
 * @param confidence e.g. 0.95 or 0.99
 * @returns positive number representing loss (i.e. VaR is reported positive)
 */
export function cornishFisherVaR(returns: readonly number[], confidence = 0.95): number {
  const { mu, sigma, skew, kurt } = moments(returns);
  const z = inverseNormalCdf(1 - confidence);
  const t = z + (z * z - 1) * skew / 6 + (z ** 3 - 3 * z) * kurt / 24 - (2 * z ** 3 - 5 * z) * skew * skew / 36;
  return -(mu + sigma * t);
}

/**
 * Pain Index — average drawdown over the period.
 * @param equity cumulative equity (or wealth) curve, length N
 */
export function painIndex(equity: readonly number[]): number {
  if (equity.length === 0) return 0;
  let peak = equity[0];
  let sum = 0;
  for (let i = 0; i < equity.length; i++) {
    if (equity[i] > peak) peak = equity[i];
    sum += (peak - equity[i]) / peak;
  }
  return sum / equity.length;
}

/** Drawdown series for an equity curve. */
export function drawdownSeries(equity: readonly number[]): number[] {
  const dd = new Array<number>(equity.length);
  let peak = equity[0] ?? 0;
  for (let i = 0; i < equity.length; i++) {
    if (equity[i] > peak) peak = equity[i];
    dd[i] = peak > 0 ? (equity[i] - peak) / peak : 0;
  }
  return dd;
}

/**
 * Conditional Drawdown at Risk (CDaR) — average of drawdowns beyond the
 * (1 - alpha) quantile.
 */
export function conditionalDrawdownAtRisk(equity: readonly number[], alpha = 0.95): number {
  const dd = drawdownSeries(equity).map((d) => -d); // positive losses
  const sorted = [...dd].sort((a, b) => a - b);
  const cutoffIdx = Math.floor(alpha * sorted.length);
  const tail = sorted.slice(cutoffIdx);
  if (tail.length === 0) return 0;
  return tail.reduce((s, x) => s + x, 0) / tail.length;
}

export interface DrawdownEvent {
  startIdx: number;
  troughIdx: number;
  endIdx: number; // recovery; -1 if not recovered
  depth: number;
  durationBars: number;
}

/** Top-N drawdowns ranked by depth, with start/trough/recovery indices. */
export function topNDrawdowns(equity: readonly number[], n = 5): DrawdownEvent[] {
  const events: DrawdownEvent[] = [];
  let peak = equity[0] ?? 0;
  let peakIdx = 0;
  let inDD = false;
  let trough = peak;
  let troughIdx = 0;
  for (let i = 1; i < equity.length; i++) {
    if (equity[i] >= peak) {
      if (inDD) {
        events.push({
          startIdx: peakIdx,
          troughIdx,
          endIdx: i,
          depth: (trough - peak) / peak,
          durationBars: i - peakIdx,
        });
        inDD = false;
      }
      peak = equity[i];
      peakIdx = i;
    } else {
      if (!inDD || equity[i] < trough) {
        trough = equity[i];
        troughIdx = i;
      }
      inDD = true;
    }
  }
  if (inDD) {
    events.push({
      startIdx: peakIdx,
      troughIdx,
      endIdx: -1,
      depth: (trough - peak) / peak,
      durationBars: equity.length - 1 - peakIdx,
    });
  }
  return events.sort((a, b) => a.depth - b.depth).slice(0, n);
}

/** Gain-to-pain ratio = sum(returns) / sum(|losses|). */
export function gainToPainRatio(returns: readonly number[]): number {
  let sumReturns = 0;
  let sumLosses = 0;
  for (let i = 0; i < returns.length; i++) {
    sumReturns += returns[i];
    if (returns[i] < 0) sumLosses += -returns[i];
  }
  return sumLosses > 0 ? sumReturns / sumLosses : Infinity;
}

/**
 * Probabilistic Sharpe Ratio (Bailey & Lopez de Prado 2012).
 * Probability the true Sharpe exceeds `benchmarkSR` given the sample.
 */
export function probabilisticSharpeRatio(
  returns: readonly number[],
  benchmarkSR = 0
): number {
  const { mu, sigma, skew, kurt } = moments(returns);
  if (sigma === 0) return 0;
  const sr = mu / sigma;
  const n = returns.length;
  const denom = Math.sqrt((1 - skew * sr + ((kurt - 1) / 4) * sr * sr) / (n - 1));
  if (denom <= 0) return 0;
  const z = (sr - benchmarkSR) / denom;
  return standardNormalCdf(z);
}

function standardNormalCdf(x: number): number {
  // Abramowitz-Stegun
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / SQRT_2;
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}

/**
 * Minimum Track Record Length: minimum N to claim SR > benchmark with
 * (1 - alpha) confidence. Returns N (rounded up).
 */
export function minTrackRecordLength(
  returns: readonly number[],
  benchmarkSR = 0,
  alpha = 0.05
): number {
  const { mu, sigma, skew, kurt } = moments(returns);
  if (sigma === 0) return Infinity;
  const sr = mu / sigma;
  if (sr <= benchmarkSR) return Infinity;
  const z = inverseNormalCdf(1 - alpha);
  const numer = 1 - skew * sr + ((kurt - 1) / 4) * sr * sr;
  return Math.ceil(1 + (numer * z * z) / ((sr - benchmarkSR) ** 2));
}

/** Bootstrap confidence interval for the Sharpe ratio. */
export function sharpeConfidenceInterval(
  returns: readonly number[],
  confidence = 0.95,
  bootstraps = 1000,
  seed = 42
): { lower: number; upper: number; estimate: number } {
  if (returns.length < 30) throw new Error('sharpeConfidenceInterval: need ≥ 30 obs');
  const sr = (arr: readonly number[]): number => {
    const m = mean(arr);
    let v = 0;
    for (let i = 0; i < arr.length; i++) v += (arr[i] - m) ** 2;
    v /= arr.length - 1;
    return v > 0 ? m / Math.sqrt(v) : 0;
  };
  // Mulberry32 for determinism
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const samples: number[] = new Array(bootstraps);
  const n = returns.length;
  for (let b = 0; b < bootstraps; b++) {
    const draw: number[] = new Array(n);
    for (let i = 0; i < n; i++) draw[i] = returns[Math.floor(next() * n)];
    samples[b] = sr(draw);
  }
  samples.sort((a, b) => a - b);
  const tail = (1 - confidence) / 2;
  return {
    lower: samples[Math.floor(tail * bootstraps)],
    upper: samples[Math.min(bootstraps - 1, Math.floor((1 - tail) * bootstraps))],
    estimate: sr(returns),
  };
}
