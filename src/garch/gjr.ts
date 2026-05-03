/**
 * GJR-GARCH(1,1) — Glosten-Jagannathan-Runkle (1993).
 *
 *   sigma_t^2 = omega + (alpha + gamma * I[eps_{t-1} < 0]) * eps_{t-1}^2 + beta * sigma_{t-1}^2
 *
 * gamma > 0 captures the leverage effect (negative shocks raise vol more).
 * Constraints: omega > 0, alpha >= 0, beta >= 0, alpha + beta + gamma/2 < 1.
 */

import { nelderMead } from './garch11';

export interface GJRParams {
  omega: number;
  alpha: number;
  gamma: number;
  beta: number;
  mu: number;
}

export interface GJRResult {
  params: GJRParams;
  variances: number[];
  logLikelihood: number;
  converged: boolean;
  iterations: number;
}

function untransform(theta: number[]): GJRParams {
  // Force positivity via exp / sigmoid; simple but effective.
  const omega = Math.exp(theta[0]);
  const alpha = Math.exp(theta[1]) / (1 + Math.exp(theta[1])) * 0.4;     // [0, 0.4]
  const gamma = Math.exp(theta[2]) / (1 + Math.exp(theta[2])) * 0.4;     // [0, 0.4]
  const beta = Math.exp(theta[3]) / (1 + Math.exp(theta[3])) * 0.99;     // [0, 0.99]
  return { omega, alpha, gamma, beta, mu: theta[4] };
}

export function gjrVariances(returns: readonly number[], p: GJRParams): number[] {
  const n = returns.length;
  const sigma2 = new Array<number>(n);
  const persistence = p.alpha + p.beta + p.gamma / 2;
  const uncond = persistence < 1 ? p.omega / (1 - persistence) : sampleVar(returns);
  sigma2[0] = uncond;
  for (let t = 1; t < n; t++) {
    const eps = returns[t - 1] - p.mu;
    const indicator = eps < 0 ? 1 : 0;
    sigma2[t] = p.omega + (p.alpha + p.gamma * indicator) * eps * eps + p.beta * sigma2[t - 1];
    if (sigma2[t] < 1e-12) sigma2[t] = 1e-12;
  }
  return sigma2;
}

function sampleVar(arr: readonly number[]): number {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += (arr[i] - m) ** 2;
  return s / arr.length;
}

export function gjrNegLogLik(returns: readonly number[], p: GJRParams): number {
  const sigma2 = gjrVariances(returns, p);
  let nll = 0;
  for (let t = 0; t < returns.length; t++) {
    const eps = returns[t] - p.mu;
    nll += 0.5 * (Math.log(2 * Math.PI * sigma2[t]) + (eps * eps) / sigma2[t]);
  }
  return nll;
}

export function fitGJR(returns: readonly number[], maxIter = 500, tol = 1e-7): GJRResult {
  if (returns.length < 30) throw new Error('fitGJR: need at least 30 observations');
  const muInit = returns.reduce((a, b) => a + b, 0) / returns.length;
  const varInit = sampleVar(returns);

  const x0 = [
    Math.log(varInit * 0.05),
    Math.log(0.05 / (0.4 - 0.05)), // sigmoid inverse
    Math.log(0.05 / (0.4 - 0.05)),
    Math.log(0.85 / (0.99 - 0.85)),
    muInit,
  ];
  const f = (theta: number[]): number => gjrNegLogLik(returns, untransform(theta));
  const result = nelderMead(f, x0, { maxIter, tol });
  const params = untransform(result.x);
  return {
    params,
    variances: gjrVariances(returns, params),
    logLikelihood: -result.f,
    converged: result.converged,
    iterations: result.iterations,
  };
}
