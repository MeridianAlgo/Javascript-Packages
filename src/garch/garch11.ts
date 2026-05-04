/**
 * GARCH(1,1) MLE estimation.
 *
 *   sigma_t^2 = omega + alpha * eps_{t-1}^2 + beta * sigma_{t-1}^2
 *
 * Constraints: omega > 0, alpha >= 0, beta >= 0, alpha + beta < 1.
 *
 * Optimization: Nelder-Mead simplex on transformed parameters
 * to enforce constraints. Pure-JS, no external dependencies.
 */

export interface GARCH11Params {
  omega: number;
  alpha: number;
  beta: number;
  mu: number;
}

export interface GARCH11Result {
  params: GARCH11Params;
  variances: number[];
  logLikelihood: number;
  converged: boolean;
  iterations: number;
}

const TINY = 1e-12;

/** Transform unconstrained -> constrained params. */
function untransform(theta: number[]): GARCH11Params {
  // omega = exp(t0), persistence p = sigmoid(t1), share = sigmoid(t2)
  // alpha = p * share, beta = p * (1 - share); 0 < p < 1
  const omega = Math.exp(theta[0]);
  const persistence = 1 / (1 + Math.exp(-theta[1]));
  const share = 1 / (1 + Math.exp(-theta[2]));
  const alpha = persistence * share;
  const beta = persistence * (1 - share);
  const mu = theta[3];
  return { omega, alpha, beta, mu };
}

function transform(p: GARCH11Params): number[] {
  const persistence = Math.min(p.alpha + p.beta, 1 - 1e-6);
  const share = persistence > 0 ? p.alpha / persistence : 0.5;
  const sigInv = (x: number): number => Math.log(x / (1 - x));
  return [Math.log(p.omega), sigInv(persistence), sigInv(Math.max(Math.min(share, 1 - 1e-6), 1e-6)), p.mu];
}

/** Conditional variance recursion. */
export function garch11Variances(returns: readonly number[], p: GARCH11Params): number[] {
  const n = returns.length;
  const sigma2 = new Array<number>(n);
  // unconditional variance as initial value
  const persistence = p.alpha + p.beta;
  const uncond = persistence < 1 ? p.omega / (1 - persistence) : sampleVariance(returns);
  sigma2[0] = uncond;
  for (let t = 1; t < n; t++) {
    const eps = returns[t - 1] - p.mu;
    sigma2[t] = p.omega + p.alpha * eps * eps + p.beta * sigma2[t - 1];
    if (sigma2[t] < TINY) sigma2[t] = TINY;
  }
  return sigma2;
}

function sampleVariance(arr: readonly number[]): number {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - m;
    s += d * d;
  }
  return s / arr.length;
}

/** Negative log-likelihood (Gaussian innovations). */
export function garch11NegLogLik(returns: readonly number[], p: GARCH11Params): number {
  const sigma2 = garch11Variances(returns, p);
  let nll = 0;
  for (let t = 0; t < returns.length; t++) {
    const eps = returns[t] - p.mu;
    nll += 0.5 * (Math.log(2 * Math.PI * sigma2[t]) + (eps * eps) / sigma2[t]);
  }
  return nll;
}

/** Fit GARCH(1,1) by Nelder-Mead. */
export function fitGARCH11(
  returns: readonly number[],
  initial?: Partial<GARCH11Params>,
  maxIter = 500,
  tol = 1e-8
): GARCH11Result {
  if (returns.length < 30) throw new Error('fitGARCH11: need at least 30 observations');

  const muInit = returns.reduce((a, b) => a + b, 0) / returns.length;
  const varInit = sampleVariance(returns);
  const init: GARCH11Params = {
    omega: initial?.omega ?? varInit * 0.05,
    alpha: initial?.alpha ?? 0.05,
    beta: initial?.beta ?? 0.9,
    mu: initial?.mu ?? muInit,
  };

  const x0 = transform(init);
  const f = (theta: number[]): number => garch11NegLogLik(returns, untransform(theta));
  const result = nelderMead(f, x0, { maxIter, tol });

  const fitted = untransform(result.x);
  return {
    params: fitted,
    variances: garch11Variances(returns, fitted),
    logLikelihood: -result.f,
    converged: result.converged,
    iterations: result.iterations,
  };
}

/** Nelder-Mead simplex (pure-JS). */
export function nelderMead(
  f: (x: number[]) => number,
  x0: number[],
  options: { maxIter?: number; tol?: number; alpha?: number; gamma?: number; rho?: number; sigma?: number } = {}
): { x: number[]; f: number; converged: boolean; iterations: number } {
  const { maxIter = 500, tol = 1e-8, alpha = 1, gamma = 2, rho = 0.5, sigma = 0.5 } = options;
  const n = x0.length;
  // initial simplex
  const simplex: number[][] = [x0.slice()];
  for (let i = 0; i < n; i++) {
    const v = x0.slice();
    v[i] = v[i] !== 0 ? v[i] * 1.05 : 0.00025;
    simplex.push(v);
  }
  const fvals = simplex.map(f);
  let iter = 0;
  for (; iter < maxIter; iter++) {
    // sort
    const order = [...Array(n + 1).keys()].sort((a, b) => fvals[a] - fvals[b]);
    const sorted = order.map((i) => simplex[i]);
    const sortedF = order.map((i) => fvals[i]);
    simplex.length = 0;
    fvals.length = 0;
    simplex.push(...sorted);
    fvals.push(...sortedF);

    // convergence
    if (Math.abs(fvals[n] - fvals[0]) < tol) {
      return { x: simplex[0], f: fvals[0], converged: true, iterations: iter };
    }

    // centroid of all but worst
    const centroid = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) centroid[j] += simplex[i][j];
    for (let j = 0; j < n; j++) centroid[j] /= n;

    // reflect
    const xr = centroid.map((c, j) => c + alpha * (c - simplex[n][j]));
    const fr = f(xr);
    if (fr < fvals[0]) {
      // expand
      const xe = centroid.map((c, j) => c + gamma * (xr[j] - c));
      const fe = f(xe);
      if (fe < fr) {
        simplex[n] = xe;
        fvals[n] = fe;
      } else {
        simplex[n] = xr;
        fvals[n] = fr;
      }
    } else if (fr < fvals[n - 1]) {
      simplex[n] = xr;
      fvals[n] = fr;
    } else {
      // contract
      const xc =
        fr < fvals[n]
          ? centroid.map((c, j) => c + rho * (xr[j] - c))
          : centroid.map((c, j) => c + rho * (simplex[n][j] - c));
      const fc = f(xc);
      if (fc < Math.min(fr, fvals[n])) {
        simplex[n] = xc;
        fvals[n] = fc;
      } else {
        // shrink
        for (let i = 1; i <= n; i++) {
          for (let j = 0; j < n; j++) simplex[i][j] = simplex[0][j] + sigma * (simplex[i][j] - simplex[0][j]);
          fvals[i] = f(simplex[i]);
        }
      }
    }
  }
  return { x: simplex[0], f: fvals[0], converged: false, iterations: iter };
}

/** h-step-ahead variance forecast. */
export function garch11Forecast(
  lastVariance: number,
  lastResidual: number,
  p: GARCH11Params,
  horizon: number
): number[] {
  const persistence = p.alpha + p.beta;
  const out = new Array<number>(horizon);
  let prev = p.omega + p.alpha * lastResidual * lastResidual + p.beta * lastVariance;
  out[0] = prev;
  for (let h = 1; h < horizon; h++) {
    prev = p.omega + persistence * prev;
    out[h] = prev;
    // converges to uncond
  }
  return out;
}
