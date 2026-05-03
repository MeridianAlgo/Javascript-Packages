/**
 * Cox-Ingersoll-Ross (CIR) interest rate / variance model:
 *   dr_t = kappa * (theta - r_t) dt + sigma * sqrt(r_t) dW_t
 *
 * Feller condition: 2*kappa*theta >= sigma^2 keeps r > 0 a.s.
 * Uses full-truncation Euler scheme.
 */

import { normalRng } from './rng';

export interface CIRParams {
  r0: number;
  kappa: number;
  theta: number;
  sigma: number;
  T: number;
  steps: number;
}

export interface CIRSimOptions {
  paths: number;
  seed?: number;
}

export class CIR {
  constructor(private params: CIRParams) {
    if (params.kappa <= 0 || params.theta <= 0 || params.sigma <= 0)
      throw new Error('CIR: kappa, theta, sigma must be > 0');
  }

  /** Returns true if Feller condition holds (process stays strictly positive). */
  fellerSatisfied(): boolean {
    const { kappa, theta, sigma } = this.params;
    return 2 * kappa * theta >= sigma * sigma;
  }

  simulate(options: CIRSimOptions): number[][] {
    const { r0, kappa, theta, sigma, T, steps } = this.params;
    const { paths, seed = 42 } = options;
    const dt = T / steps;
    const sqrtDt = Math.sqrt(dt);
    const rng = normalRng(seed);
    const result: number[][] = [];
    for (let p = 0; p < paths; p++) {
      const path = new Array<number>(steps + 1);
      path[0] = r0;
      for (let s = 0; s < steps; s++) {
        const rCur = Math.max(path[s], 0);
        const z = rng();
        path[s + 1] = path[s] + kappa * (theta - rCur) * dt + sigma * Math.sqrt(rCur) * sqrtDt * z;
      }
      result.push(path);
    }
    return result;
  }

  /**
   * Closed-form bond price under CIR:
   *   P(t,T) = A(t,T) * exp(-B(t,T) * r_t)
   */
  bondPrice(t: number, T: number, rt: number): number {
    const { kappa, theta, sigma } = this.params;
    const tau = T - t;
    const h = Math.sqrt(kappa * kappa + 2 * sigma * sigma);
    const expHT = Math.exp(h * tau);
    const denom = 2 * h + (kappa + h) * (expHT - 1);
    const A = Math.pow((2 * h * Math.exp(((kappa + h) / 2) * tau)) / denom, (2 * kappa * theta) / (sigma * sigma));
    const B = (2 * (expHT - 1)) / denom;
    return A * Math.exp(-B * rt);
  }
}
