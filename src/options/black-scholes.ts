/**
 * Black-Scholes-Merton European option pricing & Greeks.
 *
 * Inputs:
 *   S: spot price
 *   K: strike
 *   T: time to expiry (years)
 *   r: risk-free rate (continuous, decimal)
 *   q: dividend yield (continuous, decimal, default 0)
 *   sigma: volatility (decimal)
 */

export type OptionType = 'call' | 'put';

/** Standard normal PDF. */
export function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Standard normal CDF (Abramowitz-Stegun, ~7e-8 accuracy). */
export function normalCdf(x: number): number {
  // Hart approximation via erf
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  // erf approximation (Abramowitz-Stegun 7.1.26)
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}

export interface BSInputs {
  S: number;
  K: number;
  T: number;
  r: number;
  sigma: number;
  q?: number;
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

function d1d2({ S, K, T, r, sigma, q = 0 }: BSInputs): { d1: number; d2: number } {
  if (T <= 0 || sigma <= 0) {
    // degenerate — handle with small positive eps
    const eps = 1e-12;
    const tt = Math.max(T, eps);
    const sg = Math.max(sigma, eps);
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sg * sg) * tt) / (sg * Math.sqrt(tt));
    return { d1, d2: d1 - sg * Math.sqrt(tt) };
  }
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return { d1, d2 };
}

/** Black-Scholes price for European call/put. */
export function blackScholesPrice(inputs: BSInputs, type: OptionType): number {
  const { S, K, T, r, q = 0 } = inputs;
  if (T <= 0) {
    return type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0);
  }
  const { d1, d2 } = d1d2(inputs);
  if (type === 'call') {
    return S * Math.exp(-q * T) * normalCdf(d1) - K * Math.exp(-r * T) * normalCdf(d2);
  }
  return K * Math.exp(-r * T) * normalCdf(-d2) - S * Math.exp(-q * T) * normalCdf(-d1);
}

/** Full Greeks for a European option. Theta is per year (divide by 365 for per-day). */
export function blackScholesGreeks(inputs: BSInputs, type: OptionType): Greeks {
  const { S, K, T, r, sigma, q = 0 } = inputs;
  if (T <= 0 || sigma <= 0) {
    return { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  }
  const { d1, d2 } = d1d2(inputs);
  const sqrtT = Math.sqrt(T);
  const pdfD1 = normalPdf(d1);
  const eqT = Math.exp(-q * T);
  const erT = Math.exp(-r * T);

  const gamma = (eqT * pdfD1) / (S * sigma * sqrtT);
  const vega = S * eqT * pdfD1 * sqrtT;

  if (type === 'call') {
    const delta = eqT * normalCdf(d1);
    const theta =
      -(S * eqT * pdfD1 * sigma) / (2 * sqrtT) -
      r * K * erT * normalCdf(d2) +
      q * S * eqT * normalCdf(d1);
    const rho = K * T * erT * normalCdf(d2);
    return { delta, gamma, theta, vega, rho };
  }
  const delta = eqT * (normalCdf(d1) - 1);
  const theta =
    -(S * eqT * pdfD1 * sigma) / (2 * sqrtT) +
    r * K * erT * normalCdf(-d2) -
    q * S * eqT * normalCdf(-d1);
  const rho = -K * T * erT * normalCdf(-d2);
  return { delta, gamma, theta, vega, rho };
}

/** Put-call parity check. Returns the absolute deviation. */
export function putCallParity(
  S: number,
  K: number,
  T: number,
  r: number,
  callPrice: number,
  putPrice: number,
  q = 0
): number {
  // C - P = S*e^(-qT) - K*e^(-rT)
  const expected = S * Math.exp(-q * T) - K * Math.exp(-r * T);
  return Math.abs(callPrice - putPrice - expected);
}
