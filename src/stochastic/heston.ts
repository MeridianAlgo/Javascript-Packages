/**
 * Heston stochastic volatility model (Euler scheme with full truncation):
 *   dS_t = mu * S_t dt + sqrt(v_t) * S_t dW1_t
 *   dv_t = kappa * (theta - v_t) dt + xi * sqrt(v_t) dW2_t
 *   corr(dW1, dW2) = rho
 *
 * Full truncation: variance is floored at 0 in drift but allowed to be 0
 * in diffusion — most common practical scheme.
 */

import { normalRng } from './rng';

export interface HestonParams {
  S0: number;
  v0: number;
  mu: number;
  kappa: number;  // mean reversion speed
  theta: number;  // long-run variance
  xi: number;     // vol of vol
  rho: number;    // correlation
  T: number;
  steps: number;
}

export interface HestonSimOptions {
  paths: number;
  antithetic?: boolean;
  seed?: number;
}

export interface HestonPath {
  prices: number[];
  variances: number[];
}

export class Heston {
  constructor(private params: HestonParams) {
    if (Math.abs(params.rho) > 1) throw new Error('Heston: |rho| must be ≤ 1');
    if (params.kappa <= 0 || params.theta <= 0 || params.xi <= 0)
      throw new Error('Heston: kappa, theta, xi must be > 0');
  }

  simulate(options: HestonSimOptions): HestonPath[] {
    const { S0, v0, mu, kappa, theta, xi, rho, T, steps } = this.params;
    const { paths, antithetic = false, seed = 42 } = options;
    const dt = T / steps;
    const sqrtDt = Math.sqrt(dt);
    const sqrt1mr2 = Math.sqrt(1 - rho * rho);
    const rng = normalRng(seed);
    const total = antithetic ? paths * 2 : paths;
    const out: HestonPath[] = [];

    for (let p = 0; p < paths; p++) {
      // generate correlated normals for path
      const z1s: number[] = new Array(steps);
      const z2s: number[] = new Array(steps);
      for (let s = 0; s < steps; s++) {
        z1s[s] = rng();
        z2s[s] = rng();
      }

      const sim = (sign: 1 | -1): HestonPath => {
        const prices = new Array<number>(steps + 1);
        const variances = new Array<number>(steps + 1);
        prices[0] = S0;
        variances[0] = v0;
        for (let s = 0; s < steps; s++) {
          const z1 = sign * z1s[s];
          const z2 = sign * z2s[s];
          const dW1 = z1 * sqrtDt;
          const dW2 = (rho * z1 + sqrt1mr2 * z2) * sqrtDt;
          const vCur = Math.max(variances[s], 0);
          const sqrtV = Math.sqrt(vCur);
          variances[s + 1] = variances[s] + kappa * (theta - vCur) * dt + xi * sqrtV * dW2;
          prices[s + 1] = prices[s] * Math.exp((mu - 0.5 * vCur) * dt + sqrtV * dW1);
        }
        return { prices, variances };
      };

      out.push(sim(1));
      if (antithetic) out.push(sim(-1));
    }
    if (out.length !== total) throw new Error('Heston: path count mismatch');
    return out;
  }
}
