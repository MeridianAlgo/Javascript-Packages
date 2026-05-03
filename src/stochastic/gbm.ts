/**
 * Geometric Brownian Motion (GBM):
 *   dS_t = mu * S_t dt + sigma * S_t dW_t
 *
 * Exact discretization: S_{t+dt} = S_t * exp((mu - sigma^2/2)*dt + sigma*sqrt(dt)*Z)
 */

import { normalRng } from './rng';

export interface GBMParams {
  S0: number;
  mu: number;
  sigma: number;
  T: number;
  steps: number;
}

export interface SimOptions {
  paths: number;
  antithetic?: boolean;
  seed?: number;
}

export class GBM {
  constructor(private params: GBMParams) {}

  /**
   * Simulate paths. Returns 2D array [paths][steps+1].
   */
  simulate(options: SimOptions): number[][] {
    const { S0, mu, sigma, T, steps } = this.params;
    const { paths, antithetic = false, seed = 42 } = options;
    const dt = T / steps;
    const drift = (mu - 0.5 * sigma * sigma) * dt;
    const vol = sigma * Math.sqrt(dt);

    const totalPaths = antithetic ? paths * 2 : paths;
    const result: number[][] = Array.from({ length: totalPaths }, () => new Array(steps + 1));
    const rng = normalRng(seed);

    for (let p = 0; p < paths; p++) {
      // generate path's normals
      const normals: number[] = new Array(steps);
      for (let s = 0; s < steps; s++) normals[s] = rng();

      const path = result[p];
      path[0] = S0;
      for (let s = 0; s < steps; s++) {
        path[s + 1] = path[s] * Math.exp(drift + vol * normals[s]);
      }

      if (antithetic) {
        const aPath = result[paths + p];
        aPath[0] = S0;
        for (let s = 0; s < steps; s++) {
          aPath[s + 1] = aPath[s] * Math.exp(drift - vol * normals[s]);
        }
      }
    }
    return result;
  }

  /** Terminal-only simulation (faster, less memory). */
  simulateTerminal(options: SimOptions): number[] {
    const { S0, mu, sigma, T } = this.params;
    const { paths, antithetic = false, seed = 42 } = options;
    const drift = (mu - 0.5 * sigma * sigma) * T;
    const vol = sigma * Math.sqrt(T);
    const rng = normalRng(seed);
    const total = antithetic ? paths * 2 : paths;
    const out = new Array<number>(total);
    for (let p = 0; p < paths; p++) {
      const z = rng();
      out[p] = S0 * Math.exp(drift + vol * z);
      if (antithetic) out[paths + p] = S0 * Math.exp(drift - vol * z);
    }
    return out;
  }
}
