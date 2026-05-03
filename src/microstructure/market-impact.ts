/**
 * Market impact models.
 */

export interface SquareRootImpactInputs {
  /** Order size (shares). */
  qty: number;
  /** Average daily volume (shares). */
  adv: number;
  /** Daily volatility (decimal, e.g. 0.02). */
  sigma: number;
  /** Calibration constant (typically ~0.5–1 for equities). */
  c?: number;
}

/**
 * BARRA / Almgren et al. square-root impact:
 *   impact (bps of price) = c * sigma * sqrt(qty / ADV)
 * Returns relative price impact (e.g. 0.0015 = 15 bps).
 */
export function squareRootImpact({ qty, adv, sigma, c = 1 }: SquareRootImpactInputs): number {
  if (adv <= 0) throw new Error('squareRootImpact: adv must be > 0');
  return c * sigma * Math.sqrt(Math.abs(qty) / adv);
}

export interface AlmgrenChrissImpactInputs {
  /** Total order size. */
  qty: number;
  /** Execution horizon (in bucket units, e.g. minutes). */
  T: number;
  /** Volatility per bucket. */
  sigma: number;
  /** Permanent impact slope (γ). */
  gamma: number;
  /** Temporary impact slope (η). */
  eta: number;
}

/**
 * Almgren-Chriss expected cost (linear impact):
 *   E[cost] = 0.5 * γ * X^2 + η * X^2 / T
 * Returns expected cost in price-units * shares.
 *
 * Variance of cost = (1/3) * σ^2 * X^2 * T  (TWAP approximation; exact value depends on schedule).
 */
export function almgrenChrissExpectedCost(inputs: AlmgrenChrissImpactInputs): {
  expectedCost: number;
  variance: number;
} {
  const { qty, T, sigma, gamma, eta } = inputs;
  if (T <= 0) throw new Error('almgrenChrissExpectedCost: T must be > 0');
  const X = Math.abs(qty);
  const expectedCost = 0.5 * gamma * X * X + (eta * X * X) / T;
  const variance = (1 / 3) * sigma * sigma * X * X * T;
  return { expectedCost, variance };
}
