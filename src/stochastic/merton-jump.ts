/**
 * Merton jump-diffusion model:
 *   dS_t / S_t = (mu - lambda*k) dt + sigma dW_t + (Y - 1) dN_t
 *
 * Jumps Y ~ lognormal(muJ, sigmaJ): ln(Y) ~ N(muJ, sigmaJ^2),
 * so E[Y - 1] = exp(muJ + sigmaJ^2/2) - 1 = k.
 * N_t is a Poisson process with intensity lambda.
 */

import { mulberry32, boxMuller } from './rng';

export interface MertonParams {
  S0: number;
  mu: number;
  sigma: number;
  lambda: number; // jump intensity (jumps/year)
  muJ: number;    // mean of log jump size
  sigmaJ: number; // stdev of log jump size
  T: number;
  steps: number;
}

export interface MertonSimOptions {
  paths: number;
  seed?: number;
}

function poissonInverse(uniform: () => number, lambda: number): number {
  // Inverse-transform sampling for small lambda (per-step).
  // Knuth's algorithm.
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= uniform();
  } while (p > L);
  return k - 1;
}

export class MertonJump {
  constructor(private params: MertonParams) {}

  simulate(options: MertonSimOptions): number[][] {
    const { S0, mu, sigma, lambda, muJ, sigmaJ, T, steps } = this.params;
    const { paths, seed = 42 } = options;
    const dt = T / steps;
    const k = Math.exp(muJ + 0.5 * sigmaJ * sigmaJ) - 1;
    const drift = (mu - lambda * k - 0.5 * sigma * sigma) * dt;
    const vol = sigma * Math.sqrt(dt);
    const lambdaDt = lambda * dt;

    const uniform = mulberry32(seed);
    const normal = boxMuller(uniform);

    const result: number[][] = [];
    for (let p = 0; p < paths; p++) {
      const path = new Array<number>(steps + 1);
      path[0] = S0;
      for (let s = 0; s < steps; s++) {
        const z = normal();
        const nJumps = poissonInverse(uniform, lambdaDt);
        let jumpSum = 0;
        for (let j = 0; j < nJumps; j++) jumpSum += muJ + sigmaJ * normal();
        path[s + 1] = path[s] * Math.exp(drift + vol * z + jumpSum);
      }
      result.push(path);
    }
    return result;
  }
}
