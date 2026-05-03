/**
 * Kelly criterion — optimal bet/leverage sizing.
 */

/**
 * Single-bet Kelly fraction:
 *   f* = p/a - q/b
 * where p = win prob, q = 1-p, b = win payoff multiple, a = loss multiple.
 * For a 1:1 bet (lose = stake), a=1, b = b: f* = p - q/b.
 */
export function kellyBet(p: number, b: number, a: number = 1): number {
  if (p < 0 || p > 1) throw new Error('kellyBet: p must be in [0,1]');
  if (b <= 0 || a <= 0) throw new Error('kellyBet: a, b must be > 0');
  return p / a - (1 - p) / b;
}

/**
 * Continuous Kelly for log-normal returns:
 *   f* = (μ - r) / σ²
 * where μ = expected excess return per period, σ² = variance, r = risk-free rate.
 */
export function kellyContinuous(mu: number, sigmaSq: number, r: number = 0): number {
  if (sigmaSq <= 0) throw new Error('kellyContinuous: sigmaSq must be > 0');
  return (mu - r) / sigmaSq;
}

/**
 * Multi-asset Kelly: f* = Σ⁻¹ (μ - r·1)
 * Maximizes expected log-wealth assuming jointly log-normal returns.
 */
export function kellyMultiAsset(
  mu: readonly number[],
  cov: readonly (readonly number[])[],
  r: number = 0,
): number[] {
  const N = mu.length;
  if (cov.length !== N) throw new Error('kellyMultiAsset: dimension mismatch');
  const excess = mu.map((m) => m - r);
  return solveLinear(cov, excess);
}

/**
 * Fractional Kelly — scale full-Kelly weights by `fraction` (typically 0.25–0.5)
 * to reduce drawdown / variance of growth rate.
 */
export function fractionalKelly(weights: readonly number[], fraction: number): number[] {
  if (fraction < 0) throw new Error('fractionalKelly: fraction must be >= 0');
  return weights.map((w) => w * fraction);
}

/** Solve Aw = b via Gaussian elimination with partial pivoting. */
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
    if (Math.abs(M[k][k]) < 1e-14) throw new Error('solveLinear: singular matrix');
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
