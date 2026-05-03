/**
 * Range-based volatility estimators (more efficient than close-to-close).
 *
 * All estimators return *daily* (per-period) variance estimates.
 * Annualize by multiplying by sqrt(252) on standard deviation.
 */

export interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Parkinson (1980): uses high/low range only.
 *   sigma^2 = (1 / (4 * N * ln 2)) * sum_i [ln(H_i / L_i)]^2
 */
export function parkinsonVolatility(bars: readonly OHLC[]): number {
  const n = bars.length;
  if (n === 0) return 0;
  const factor = 1 / (4 * n * Math.LN2);
  let sum = 0;
  for (const b of bars) {
    const r = Math.log(b.high / b.low);
    sum += r * r;
  }
  return Math.sqrt(factor * sum);
}

/**
 * Garman-Klass (1980): uses OHLC, ~7.4x more efficient than close-to-close.
 *   sigma^2 = 1/N * sum_i [0.5*(ln H/L)^2 - (2 ln 2 - 1) * (ln C/O)^2]
 */
export function garmanKlassVolatility(bars: readonly OHLC[]): number {
  const n = bars.length;
  if (n === 0) return 0;
  let sum = 0;
  for (const b of bars) {
    const hl = Math.log(b.high / b.low);
    const co = Math.log(b.close / b.open);
    sum += 0.5 * hl * hl - (2 * Math.LN2 - 1) * co * co;
  }
  return Math.sqrt(sum / n);
}

/**
 * Rogers-Satchell (1991): drift-independent.
 *   sigma^2 = 1/N * sum_i [ln(H/C)*ln(H/O) + ln(L/C)*ln(L/O)]
 */
export function rogersSatchellVolatility(bars: readonly OHLC[]): number {
  const n = bars.length;
  if (n === 0) return 0;
  let sum = 0;
  for (const b of bars) {
    const ho = Math.log(b.high / b.open);
    const hc = Math.log(b.high / b.close);
    const lo = Math.log(b.low / b.open);
    const lc = Math.log(b.low / b.close);
    sum += hc * ho + lc * lo;
  }
  return Math.sqrt(sum / n);
}

/**
 * Yang-Zhang (2000): combines overnight, open-to-close, and Rogers-Satchell.
 * Minimum-variance estimator, unbiased, drift-independent.
 */
export function yangZhangVolatility(bars: readonly OHLC[]): number {
  const n = bars.length;
  if (n < 2) return 0;
  // overnight returns
  const overnight: number[] = new Array(n - 1);
  const openClose: number[] = new Array(n - 1);
  for (let i = 1; i < n; i++) {
    overnight[i - 1] = Math.log(bars[i].open / bars[i - 1].close);
    openClose[i - 1] = Math.log(bars[i].close / bars[i].open);
  }
  const meanOvernight = mean(overnight);
  const meanOpenClose = mean(openClose);
  const sigmaOvernight2 = sumSquaredDeviation(overnight, meanOvernight) / (n - 2);
  const sigmaOpenClose2 = sumSquaredDeviation(openClose, meanOpenClose) / (n - 2);
  const rsVar = rogersSatchellVolatility(bars.slice(1)) ** 2;
  const k = 0.34 / (1.34 + (n + 1) / (n - 1));
  return Math.sqrt(sigmaOvernight2 + k * sigmaOpenClose2 + (1 - k) * rsVar);
}

function mean(arr: number[]): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}
function sumSquaredDeviation(arr: number[], m: number): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - m;
    s += d * d;
  }
  return s;
}

/**
 * HAR-RV (Heterogeneous Autoregressive Realized Variance) — Corsi (2009).
 *
 *   RV_t = beta0 + beta_d * RV_{t-1} + beta_w * RV^(w)_{t-1} + beta_m * RV^(m)_{t-1} + eps_t
 *
 * where RV^(w) is the 5-day average and RV^(m) is the 22-day average.
 * Returns OLS coefficients.
 */
export interface HARRVResult {
  beta0: number;
  betaD: number;
  betaW: number;
  betaM: number;
  fitted: number[];
  residuals: number[];
}

export function fitHARRV(rv: readonly number[]): HARRVResult {
  const n = rv.length;
  if (n < 30) throw new Error('fitHARRV: need at least 30 RV observations');

  const X: number[][] = [];
  const y: number[] = [];
  for (let t = 22; t < n; t++) {
    const rvD = rv[t - 1];
    let rvW = 0;
    for (let i = 1; i <= 5; i++) rvW += rv[t - i];
    rvW /= 5;
    let rvM = 0;
    for (let i = 1; i <= 22; i++) rvM += rv[t - i];
    rvM /= 22;
    X.push([1, rvD, rvW, rvM]);
    y.push(rv[t]);
  }
  const beta = ols(X, y);
  const fitted = X.map((row) => row.reduce((s, v, i) => s + v * beta[i], 0));
  const residuals = y.map((v, i) => v - fitted[i]);
  return { beta0: beta[0], betaD: beta[1], betaW: beta[2], betaM: beta[3], fitted, residuals };
}

/** OLS for k=4 features via normal equations + 4x4 inversion. */
function ols(X: number[][], y: number[]): number[] {
  const k = X[0].length;
  const XtX: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  const Xty: number[] = new Array(k).fill(0);
  for (let i = 0; i < X.length; i++) {
    for (let r = 0; r < k; r++) {
      Xty[r] += X[i][r] * y[i];
      for (let c = 0; c < k; c++) XtX[r][c] += X[i][r] * X[i][c];
    }
  }
  return solveLinear(XtX, Xty);
}

/** Gaussian elimination with partial pivoting. */
function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    // pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    [M[i], M[maxRow]] = [M[maxRow], M[i]];
    if (Math.abs(M[i][i]) < 1e-14) throw new Error('solveLinear: singular matrix');
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) M[k][j] -= factor * M[i][j];
    }
  }
  const x = new Array<number>(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}
