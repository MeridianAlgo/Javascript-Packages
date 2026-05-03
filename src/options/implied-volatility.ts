/**
 * Implied volatility solvers.
 * Newton-Raphson with Brent fallback for robustness.
 */

import { blackScholesPrice, blackScholesGreeks, OptionType, BSInputs } from './black-scholes';

export interface IVOptions {
  tol?: number;
  maxIter?: number;
  initialGuess?: number;
}

/**
 * Newton-Raphson IV — fast when it works.
 * Throws if it doesn't converge.
 */
export function impliedVolNewton(
  marketPrice: number,
  S: number,
  K: number,
  T: number,
  r: number,
  type: OptionType,
  q = 0,
  options: IVOptions = {}
): number {
  const { tol = 1e-7, maxIter = 100, initialGuess = 0.2 } = options;
  let sigma = initialGuess;

  for (let i = 0; i < maxIter; i++) {
    const inputs: BSInputs = { S, K, T, r, sigma, q };
    const price = blackScholesPrice(inputs, type);
    const { vega } = blackScholesGreeks(inputs, type);
    const diff = price - marketPrice;
    if (Math.abs(diff) < tol) return sigma;
    if (vega < 1e-12) break;
    sigma = sigma - diff / vega;
    if (sigma <= 0) sigma = 1e-4;
    if (sigma > 5) sigma = 5;
  }
  throw new Error('impliedVolNewton: did not converge');
}

/**
 * Brent's method on bracket [low, high]. Robust — guaranteed convergence
 * if root is bracketed.
 */
export function impliedVolBrent(
  marketPrice: number,
  S: number,
  K: number,
  T: number,
  r: number,
  type: OptionType,
  q = 0,
  options: IVOptions & { low?: number; high?: number } = {}
): number {
  const { tol = 1e-7, maxIter = 200, low = 1e-4, high = 5 } = options;

  const f = (sigma: number): number =>
    blackScholesPrice({ S, K, T, r, sigma, q }, type) - marketPrice;

  let a = low;
  let b = high;
  let fa = f(a);
  let fb = f(b);
  if (fa * fb > 0) throw new Error('impliedVolBrent: root not bracketed');

  if (Math.abs(fa) < Math.abs(fb)) {
    [a, b] = [b, a];
    [fa, fb] = [fb, fa];
  }

  let c = a;
  let fc = fa;
  let s = b;
  let d = b - a;
  let mflag = true;

  for (let i = 0; i < maxIter; i++) {
    if (Math.abs(fb) < tol) return b;
    if (fa !== fc && fb !== fc) {
      // inverse quadratic interpolation
      s =
        (a * fb * fc) / ((fa - fb) * (fa - fc)) +
        (b * fa * fc) / ((fb - fa) * (fb - fc)) +
        (c * fa * fb) / ((fc - fa) * (fc - fb));
    } else {
      // secant
      s = b - (fb * (b - a)) / (fb - fa);
    }
    const cond1 = !((s > (3 * a + b) / 4 && s < b) || (s < (3 * a + b) / 4 && s > b));
    const cond2 = mflag && Math.abs(s - b) >= Math.abs(b - c) / 2;
    const cond3 = !mflag && Math.abs(s - b) >= Math.abs(c - d) / 2;
    if (cond1 || cond2 || cond3) {
      s = (a + b) / 2;
      mflag = true;
    } else {
      mflag = false;
    }
    const fs = f(s);
    d = c;
    c = b;
    fc = fb;
    if (fa * fs < 0) {
      b = s;
      fb = fs;
    } else {
      a = s;
      fa = fs;
    }
    if (Math.abs(fa) < Math.abs(fb)) {
      [a, b] = [b, a];
      [fa, fb] = [fb, fa];
    }
  }
  return b;
}

/**
 * Implied volatility — tries Newton first, falls back to Brent.
 */
export function impliedVolatility(
  marketPrice: number,
  S: number,
  K: number,
  T: number,
  r: number,
  type: OptionType,
  q = 0,
  options: IVOptions = {}
): number {
  try {
    return impliedVolNewton(marketPrice, S, K, T, r, type, q, options);
  } catch {
    return impliedVolBrent(marketPrice, S, K, T, r, type, q, options);
  }
}
