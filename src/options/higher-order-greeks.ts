/**
 * Higher-order (second- and third-order) Black-Scholes-Merton Greeks.
 *
 * These sensitivities are widely used in options risk management and
 * volatility trading to capture how the first-order Greeks themselves move as
 * spot, volatility and time change. All formulas assume a European option with
 * continuous dividend yield `q` (default 0) and use the same input convention
 * as {@link blackScholesGreeks}.
 *
 * Inputs (via {@link BSInputs}):
 *   S: spot price
 *   K: strike
 *   T: time to expiry (years)
 *   r: risk-free rate (continuous, decimal)
 *   q: dividend yield (continuous, decimal, default 0)
 *   sigma: volatility (decimal)
 *
 * Time-decay Greeks (charm, color, veta) are expressed per year. Divide by 365
 * for an approximate per-calendar-day figure.
 */

import { BSInputs, OptionType, normalCdf, normalPdf } from './black-scholes';

export interface HigherOrderGreeks {
  /** Vanna: ∂Delta/∂sigma = ∂Vega/∂Spot. */
  vanna: number;
  /** Charm: ∂Delta/∂time (delta decay), per year. */
  charm: number;
  /** Vomma (a.k.a. volga): ∂Vega/∂sigma. */
  vomma: number;
  /** Veta: ∂Vega/∂time, per year. */
  veta: number;
  /** Speed: ∂Gamma/∂Spot (third order). */
  speed: number;
  /** Zomma: ∂Gamma/∂sigma. */
  zomma: number;
  /** Color: ∂Gamma/∂time (gamma decay), per year. */
  color: number;
  /** Ultima: ∂Vomma/∂sigma (third order). */
  ultima: number;
  /** Dual delta: ∂Price/∂Strike. */
  dualDelta: number;
  /** Dual gamma: ∂²Price/∂Strike². */
  dualGamma: number;
}

function d1d2(inputs: BSInputs): { d1: number; d2: number; sqrtT: number } {
  const { S, K, T, r, sigma, q = 0 } = inputs;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  return { d1, d2, sqrtT };
}

/**
 * Compute the full set of higher-order Greeks for a European option.
 *
 * Returns all-zero sensitivities for degenerate inputs (expired option or
 * non-positive volatility), mirroring {@link blackScholesGreeks}.
 */
export function higherOrderGreeks(inputs: BSInputs, type: OptionType): HigherOrderGreeks {
  const { S, K, T, r, sigma, q = 0 } = inputs;
  if (T <= 0 || sigma <= 0 || S <= 0 || K <= 0) {
    return {
      vanna: 0,
      charm: 0,
      vomma: 0,
      veta: 0,
      speed: 0,
      zomma: 0,
      color: 0,
      ultima: 0,
      dualDelta: 0,
      dualGamma: 0,
    };
  }

  const { d1, d2, sqrtT } = d1d2(inputs);
  const pdfD1 = normalPdf(d1);
  const pdfD2 = normalPdf(d2);
  const eqT = Math.exp(-q * T);
  const erT = Math.exp(-r * T);
  const sigSqrtT = sigma * sqrtT;

  const gamma = (eqT * pdfD1) / (S * sigSqrtT);
  const vega = S * eqT * pdfD1 * sqrtT;

  // Second order
  const vanna = -eqT * pdfD1 * (d2 / sigma);
  const vomma = vega * ((d1 * d2) / sigma);
  const zomma = gamma * ((d1 * d2 - 1) / sigma);
  const speed = -(gamma / S) * (d1 / sigSqrtT + 1);

  // Time-decay (per year)
  const charmCommon = eqT * pdfD1 * ((2 * (r - q) * T - d2 * sigSqrtT) / (2 * T * sigSqrtT));
  const charm =
    type === 'call'
      ? q * eqT * normalCdf(d1) - charmCommon
      : -q * eqT * normalCdf(-d1) - charmCommon;

  // veta and color below are expressed as ∂Greek/∂t (calendar-time decay,
  // i.e. -∂/∂τ) so that all three time-decay Greeks (charm, color, veta) share
  // the same sign convention.
  const veta =
    S * eqT * pdfD1 * sqrtT *
    (q + ((r - q) * d1) / sigSqrtT - (1 + d1 * d2) / (2 * T));

  const color =
    eqT * (pdfD1 / (2 * S * T * sigSqrtT)) *
    (2 * q * T + 1 + ((2 * (r - q) * T - d2 * sigSqrtT) / sigSqrtT) * d1);

  // Third order
  const ultima =
    (-vega / (sigma * sigma)) * (d1 * d2 * (1 - d1 * d2) + d1 * d1 + d2 * d2);

  // Strike sensitivities
  const dualDelta = type === 'call' ? -erT * normalCdf(d2) : erT * normalCdf(-d2);
  const dualGamma = (erT * pdfD2) / (K * sigSqrtT);

  return { vanna, charm, vomma, veta, speed, zomma, color, ultima, dualDelta, dualGamma };
}
