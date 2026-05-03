/**
 * Risk Budgeting / Equal Risk Contribution (ERC) optimizer.
 *
 * Each asset's risk contribution: RC_i = w_i * (Sigma w)_i / sigma_p
 * Risk budgeting: target RC_i / sigma_p = b_i where sum(b_i) = 1.
 * ERC special case: b_i = 1/n.
 *
 * Solver: cyclic coordinate descent on log(weights) — simple, robust, no deps.
 */

export type Matrix = number[][];

function matVec(M: Matrix, v: number[]): number[] {
  const n = v.length;
  const out = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += M[i][j] * v[j];
    out[i] = s;
  }
  return out;
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export interface RiskBudgetResult {
  weights: number[];
  riskContributions: number[];
  portfolioVolatility: number;
  iterations: number;
  converged: boolean;
}

/**
 * Solve risk-budgeting weights (long-only, sum to 1).
 * @param covariance N x N positive semi-definite matrix
 * @param budgets target risk shares (must sum to 1); defaults to ERC.
 */
export function riskBudgetingWeights(
  covariance: Matrix,
  budgets?: readonly number[],
  options: { maxIter?: number; tol?: number } = {}
): RiskBudgetResult {
  const n = covariance.length;
  const b = budgets ? [...budgets] : new Array(n).fill(1 / n);
  if (Math.abs(b.reduce((s, x) => s + x, 0) - 1) > 1e-6)
    throw new Error('riskBudgetingWeights: budgets must sum to 1');

  const { maxIter = 1000, tol = 1e-8 } = options;
  let w = new Array(n).fill(1 / n);
  let iter = 0;
  let prevW: number[];
  let converged = false;

  // Spinu cyclic coordinate descent: at each step solve a quadratic in w_i.
  // cov_ii * w_i^2 + (sum_{j != i} cov_ij * w_j) * w_i - b_i = 0
  // (equivalent first-order condition under unit-budget normalization).
  for (; iter < maxIter; iter++) {
    prevW = [...w];
    for (let i = 0; i < n; i++) {
      let crossSum = 0;
      for (let j = 0; j < n; j++) if (j !== i) crossSum += covariance[i][j] * w[j];
      const a = covariance[i][i];
      if (a <= 0) continue;
      const c = -b[i];
      const disc = crossSum * crossSum - 4 * a * c;
      if (disc < 0) continue;
      w[i] = (-crossSum + Math.sqrt(disc)) / (2 * a);
    }
    const sum = w.reduce((s, x) => s + x, 0);
    if (sum <= 0) break;
    for (let i = 0; i < n; i++) w[i] /= sum;

    let maxDelta = 0;
    for (let i = 0; i < n; i++) maxDelta = Math.max(maxDelta, Math.abs(w[i] - prevW[i]));
    if (maxDelta < tol) {
      converged = true;
      iter++;
      break;
    }
  }

  const finalSw = matVec(covariance, w);
  const sigma2Final = dot(w, finalSw);
  const sigmaP = Math.sqrt(Math.max(sigma2Final, 0));
  const rc = w.map((wi, i) => (wi * finalSw[i]) / Math.max(sigmaP, 1e-12));
  return { weights: w, riskContributions: rc, portfolioVolatility: sigmaP, iterations: iter, converged };
}

/** Equal Risk Contribution shorthand. */
export function equalRiskContribution(covariance: Matrix): RiskBudgetResult {
  return riskBudgetingWeights(covariance);
}
