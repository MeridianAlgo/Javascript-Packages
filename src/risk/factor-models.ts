/**
 * Factor models — Fama-French 3/5-factor regression and CAPM.
 *
 * OLS regression of asset excess returns on factor returns:
 *   (R_i - R_f) = α + β_1 F_1 + β_2 F_2 + ... + β_K F_K + ε
 */

export interface FactorRegressionResult {
  /** Intercept (annualized alpha is up to caller). */
  alpha: number;
  /** Factor loadings in the order given. */
  betas: number[];
  /** R-squared. */
  rSquared: number;
  /** Residual standard error. */
  residualStdError: number;
  /** Number of observations. */
  n: number;
}

/**
 * OLS factor regression.
 *
 * @param excessReturns asset excess returns (R_i - R_f)
 * @param factors      array of factor return series (each same length as excessReturns)
 */
export function factorRegression(
  excessReturns: readonly number[],
  factors: readonly (readonly number[])[],
): FactorRegressionResult {
  const n = excessReturns.length;
  const K = factors.length;
  if (n < K + 2) throw new Error('factorRegression: not enough observations');
  for (const f of factors) {
    if (f.length !== n) throw new Error('factorRegression: factor length mismatch');
  }

  // Design matrix X: n × (K+1), first column = 1 (intercept)
  // Solve (X'X) β = X'y via Gaussian elimination.
  const p = K + 1;
  const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty: number[] = new Array(p).fill(0);
  for (let t = 0; t < n; t++) {
    const row: number[] = [1];
    for (let k = 0; k < K; k++) row.push(factors[k][t]);
    for (let i = 0; i < p; i++) {
      Xty[i] += row[i] * excessReturns[t];
      for (let j = 0; j < p; j++) XtX[i][j] += row[i] * row[j];
    }
  }
  const beta = solveLinear(XtX, Xty);

  // Residuals + R²
  let ssRes = 0;
  let ssTot = 0;
  const meanY = excessReturns.reduce((s, x) => s + x, 0) / n;
  for (let t = 0; t < n; t++) {
    let pred = beta[0];
    for (let k = 0; k < K; k++) pred += beta[k + 1] * factors[k][t];
    const r = excessReturns[t] - pred;
    ssRes += r * r;
    ssTot += (excessReturns[t] - meanY) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const residualStdError = Math.sqrt(ssRes / Math.max(n - p, 1));

  return {
    alpha: beta[0],
    betas: beta.slice(1),
    rSquared,
    residualStdError,
    n,
  };
}

/** CAPM convenience wrapper: single factor (market excess). */
export function capmRegression(
  excessReturns: readonly number[],
  marketExcess: readonly number[],
): FactorRegressionResult {
  return factorRegression(excessReturns, [marketExcess]);
}

/** Fama-French 3-factor: market, SMB, HML. */
export function famaFrench3(
  excessReturns: readonly number[],
  mktRf: readonly number[],
  smb: readonly number[],
  hml: readonly number[],
): FactorRegressionResult {
  return factorRegression(excessReturns, [mktRf, smb, hml]);
}

/** Fama-French 5-factor: market, SMB, HML, RMW, CMA. */
export function famaFrench5(
  excessReturns: readonly number[],
  mktRf: readonly number[],
  smb: readonly number[],
  hml: readonly number[],
  rmw: readonly number[],
  cma: readonly number[],
): FactorRegressionResult {
  return factorRegression(excessReturns, [mktRf, smb, hml, rmw, cma]);
}

function solveLinear(A: readonly (readonly number[])[], b: readonly number[]): number[] {
  const n = b.length;
  const M: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let k = 0; k < n; k++) {
    let pivot = k;
    let max = Math.abs(M[k][k]);
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > max) {
        max = Math.abs(M[i][k]);
        pivot = i;
      }
    }
    if (pivot !== k) [M[k], M[pivot]] = [M[pivot], M[k]];
    if (Math.abs(M[k][k]) < 1e-14) throw new Error('factorRegression: singular matrix');
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k];
      for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}
