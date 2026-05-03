/**
 * EGARCH(1,1) — Nelson (1991).
 *
 *   ln(sigma_t^2) = omega + alpha * (|z_{t-1}| - E|z|) + gamma * z_{t-1} + beta * ln(sigma_{t-1}^2)
 *
 * where z_t = eps_t / sigma_t. Captures asymmetry (leverage) via gamma.
 * No positivity constraint on params (log scale).
 */

import { nelderMead } from './garch11';

export interface EGARCHParams {
  omega: number;
  alpha: number;
  gamma: number;
  beta: number;
  mu: number;
}

export interface EGARCHResult {
  params: EGARCHParams;
  variances: number[];
  logLikelihood: number;
  converged: boolean;
  iterations: number;
}

const SQRT_2_OVER_PI = Math.sqrt(2 / Math.PI);

export function egarchVariances(returns: readonly number[], p: EGARCHParams): number[] {
  const n = returns.length;
  const lnSigma2 = new Array<number>(n);
  // initialize with sample log-variance
  let mean = 0;
  for (let i = 0; i < n; i++) mean += returns[i];
  mean /= n;
  let sampleVar = 0;
  for (let i = 0; i < n; i++) sampleVar += (returns[i] - mean) ** 2;
  sampleVar /= n;
  lnSigma2[0] = Math.log(Math.max(sampleVar, 1e-12));

  for (let t = 1; t < n; t++) {
    const eps = returns[t - 1] - p.mu;
    const sigmaPrev = Math.sqrt(Math.exp(lnSigma2[t - 1]));
    const z = eps / sigmaPrev;
    lnSigma2[t] =
      p.omega + p.alpha * (Math.abs(z) - SQRT_2_OVER_PI) + p.gamma * z + p.beta * lnSigma2[t - 1];
  }
  return lnSigma2.map((v) => Math.exp(v));
}

export function egarchNegLogLik(returns: readonly number[], p: EGARCHParams): number {
  const sigma2 = egarchVariances(returns, p);
  let nll = 0;
  for (let t = 0; t < returns.length; t++) {
    const eps = returns[t] - p.mu;
    nll += 0.5 * (Math.log(2 * Math.PI * sigma2[t]) + (eps * eps) / sigma2[t]);
  }
  return nll;
}

export function fitEGARCH(returns: readonly number[], maxIter = 500, tol = 1e-7): EGARCHResult {
  if (returns.length < 30) throw new Error('fitEGARCH: need at least 30 observations');
  const muInit = returns.reduce((a, b) => a + b, 0) / returns.length;
  const x0 = [-0.1, 0.1, -0.05, 0.95, muInit]; // omega, alpha, gamma, beta, mu
  const f = (x: number[]): number =>
    egarchNegLogLik(returns, { omega: x[0], alpha: x[1], gamma: x[2], beta: x[3], mu: x[4] });
  const result = nelderMead(f, x0, { maxIter, tol });
  const params: EGARCHParams = {
    omega: result.x[0],
    alpha: result.x[1],
    gamma: result.x[2],
    beta: result.x[3],
    mu: result.x[4],
  };
  return {
    params,
    variances: egarchVariances(returns, params),
    logLikelihood: -result.f,
    converged: result.converged,
    iterations: result.iterations,
  };
}
