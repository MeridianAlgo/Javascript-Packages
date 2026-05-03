/**
 * Merton structural credit model.
 *
 * Treats firm equity as a European call on firm assets struck at debt face value.
 *
 *   E_0 = V_0 * N(d1) - D * e^(-rT) * N(d2)
 *
 * where d1 = (ln(V_0/D) + (r + sigma_V^2/2) T) / (sigma_V sqrt(T)),
 *       d2 = d1 - sigma_V sqrt(T).
 *
 * Distance-to-default = d2.  PD = N(-d2).
 */

import { normalCdf } from '../options/black-scholes';

export interface MertonInputs {
  V: number;       // firm asset value
  D: number;       // debt face value
  T: number;       // horizon (years)
  r: number;       // risk-free rate
  sigmaV: number;  // asset volatility
}

export interface MertonOutputs {
  equityValue: number;
  distanceToDefault: number;
  defaultProb: number;
  riskNeutralPD: number;
}

export function mertonStructural(inputs: MertonInputs): MertonOutputs {
  const { V, D, T, r, sigmaV } = inputs;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(V / D) + (r + 0.5 * sigmaV * sigmaV) * T) / (sigmaV * sqrtT);
  const d2 = d1 - sigmaV * sqrtT;
  const equityValue = V * normalCdf(d1) - D * Math.exp(-r * T) * normalCdf(d2);
  const riskNeutralPD = normalCdf(-d2);
  return {
    equityValue,
    distanceToDefault: d2,
    defaultProb: riskNeutralPD,
    riskNeutralPD,
  };
}

/**
 * Solve for implied asset volatility given observed equity value.
 * Newton-Raphson on equityValue(sigmaV) = E_obs.
 */
export function impliedAssetVol(
  observedEquity: number,
  V: number,
  D: number,
  T: number,
  r: number,
  guess = 0.25,
  tol = 1e-7,
  maxIter = 100
): number {
  let sigma = guess;
  for (let i = 0; i < maxIter; i++) {
    const cur = mertonStructural({ V, D, T, r, sigmaV: sigma }).equityValue;
    const eps = 1e-5;
    const up = mertonStructural({ V, D, T, r, sigmaV: sigma + eps }).equityValue;
    const deriv = (up - cur) / eps;
    if (Math.abs(deriv) < 1e-12) break;
    const sNew = sigma - (cur - observedEquity) / deriv;
    if (Math.abs(sNew - sigma) < tol) return sNew;
    sigma = Math.max(sNew, 1e-4);
  }
  throw new Error('impliedAssetVol: did not converge');
}
