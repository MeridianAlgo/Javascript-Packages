/**
 * YieldCurve — fits a Nelson-Siegel (or NS-Svensson) parametric curve to
 * observed yield/maturity pairs and provides spot rates, forward rates,
 * and discount factors.
 *
 * Nelson-Siegel:
 *   y(t) = b0 + b1 * (1 - e^(-t/tau)) / (t/tau)
 *               + b2 * ((1 - e^(-t/tau)) / (t/tau) - e^(-t/tau))
 *
 * b0 = level, b1 = slope, b2 = curvature, tau = decay.
 */

export interface NelsonSiegelParams {
  b0: number;
  b1: number;
  b2: number;
  tau: number;
}

export interface YieldObservation {
  maturity: number; // years
  yield: number;    // continuous, decimal
}

/** Nelson-Siegel yield function. */
export function nelsonSiegelYield(params: NelsonSiegelParams, t: number): number {
  if (t <= 0) return params.b0 + params.b1;
  const x = t / params.tau;
  const expMx = Math.exp(-x);
  const term = (1 - expMx) / x;
  return params.b0 + params.b1 * term + params.b2 * (term - expMx);
}

/**
 * Fit Nelson-Siegel via grid-search on tau then OLS on b0/b1/b2.
 * Robust enough for typical sovereign curves; for production, use a numerical
 * optimizer (Levenberg-Marquardt).
 */
export function fitNelsonSiegel(
  observations: readonly YieldObservation[],
  tauGrid: readonly number[] = defaultTauGrid()
): NelsonSiegelParams {
  if (observations.length < 4) throw new Error('fitNelsonSiegel: need at least 4 observations');

  let bestSse = Infinity;
  let best: NelsonSiegelParams = { b0: 0, b1: 0, b2: 0, tau: tauGrid[0] };

  for (const tau of tauGrid) {
    const params = solveLinearNS(observations, tau);
    if (!params) continue;
    const sse = sumSquaredError(observations, params);
    if (sse < bestSse) {
      bestSse = sse;
      best = params;
    }
  }
  return best;
}

function defaultTauGrid(): number[] {
  const grid: number[] = [];
  for (let t = 0.1; t <= 10; t += 0.1) grid.push(t);
  return grid;
}

/**
 * Given fixed tau, fit (b0, b1, b2) by OLS on the linear system.
 * Each observation: y_i = b0 + b1 * f1_i + b2 * f2_i + eps
 */
function solveLinearNS(
  obs: readonly YieldObservation[],
  tau: number
): NelsonSiegelParams | null {
  const n = obs.length;
  const X: number[][] = []; // n x 3
  const yVec: number[] = [];
  for (const o of obs) {
    const t = Math.max(o.maturity, 1e-6);
    const x = t / tau;
    const expMx = Math.exp(-x);
    const term = (1 - expMx) / x;
    X.push([1, term, term - expMx]);
    yVec.push(o.yield);
  }
  // Normal equations: (X^T X) beta = X^T y
  const XtX: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const Xty: number[] = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    for (let r = 0; r < 3; r++) {
      Xty[r] += X[i][r] * yVec[i];
      for (let c = 0; c < 3; c++) XtX[r][c] += X[i][r] * X[i][c];
    }
  }
  const beta = solve3x3(XtX, Xty);
  if (!beta) return null;
  return { b0: beta[0], b1: beta[1], b2: beta[2], tau };
}

function solve3x3(A: number[][], b: number[]): number[] | null {
  // Cramer's rule for a 3x3 system.
  const det = (m: number[][]): number =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det(A);
  if (Math.abs(D) < 1e-14) return null;
  const out = [0, 0, 0];
  for (let col = 0; col < 3; col++) {
    const M = A.map((row) => row.slice());
    for (let r = 0; r < 3; r++) M[r][col] = b[r];
    out[col] = det(M) / D;
  }
  return out;
}

function sumSquaredError(obs: readonly YieldObservation[], p: NelsonSiegelParams): number {
  let s = 0;
  for (const o of obs) {
    const fitted = nelsonSiegelYield(p, o.maturity);
    const e = fitted - o.yield;
    s += e * e;
  }
  return s;
}

export class YieldCurve {
  constructor(private params: NelsonSiegelParams) {}

  /** Build from observations. */
  static fit(observations: readonly YieldObservation[]): YieldCurve {
    return new YieldCurve(fitNelsonSiegel(observations));
  }

  parameters(): NelsonSiegelParams {
    return { ...this.params };
  }

  /** Continuously-compounded spot/zero rate at maturity t. */
  spotRate(t: number): number {
    return nelsonSiegelYield(this.params, t);
  }

  /** Discount factor for cash flow at time t. */
  discountFactor(t: number): number {
    return Math.exp(-this.spotRate(t) * t);
  }

  /**
   * Instantaneous forward rate at time t.
   * f(t) = y(t) + t * dy/dt  (analytical via finite-diff for simplicity)
   */
  forwardRate(t: number, eps = 1e-5): number {
    const y = this.spotRate(t);
    const dy = (this.spotRate(t + eps) - this.spotRate(Math.max(t - eps, 1e-9))) / (2 * eps);
    return y + t * dy;
  }

  /** Forward rate from t1 to t2 (continuous). */
  forwardRateBetween(t1: number, t2: number): number {
    if (t2 <= t1) throw new Error('forwardRateBetween: t2 must be > t1');
    return (this.spotRate(t2) * t2 - this.spotRate(t1) * t1) / (t2 - t1);
  }
}
