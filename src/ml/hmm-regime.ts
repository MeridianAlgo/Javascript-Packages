/**
 * Gaussian HMM for market regime detection.
 *
 * K-state HMM with Gaussian emissions on 1-D return series.
 * Trained via Baum-Welch (forward-backward EM); decoded via Viterbi.
 *
 * For multivariate observations, see the matrix variant (not provided here).
 */

export interface HMMParams {
  /** Initial state distribution: π[k]. */
  pi: number[];
  /** Transition matrix: A[i][j] = P(s_t=j | s_{t-1}=i). */
  A: number[][];
  /** Emission means (one per state). */
  mu: number[];
  /** Emission std devs (one per state). */
  sigma: number[];
}

const SQRT_2PI = Math.sqrt(2 * Math.PI);

function gaussianPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / Math.max(sigma, 1e-9);
  return Math.exp(-0.5 * z * z) / (Math.max(sigma, 1e-9) * SQRT_2PI);
}

/** Forward algorithm with scaling. Returns log-likelihood and scaled forward variables. */
function forwardScaled(
  obs: readonly number[],
  params: HMMParams,
): { alpha: number[][]; c: number[]; logLik: number } {
  const T = obs.length;
  const K = params.pi.length;
  const alpha: number[][] = Array.from({ length: T }, () => new Array(K).fill(0));
  const c: number[] = new Array(T).fill(0);
  for (let k = 0; k < K; k++) alpha[0][k] = params.pi[k] * gaussianPdf(obs[0], params.mu[k], params.sigma[k]);
  c[0] = alpha[0].reduce((s, v) => s + v, 0);
  if (c[0] > 0) for (let k = 0; k < K; k++) alpha[0][k] /= c[0];
  for (let t = 1; t < T; t++) {
    for (let j = 0; j < K; j++) {
      let s = 0;
      for (let i = 0; i < K; i++) s += alpha[t - 1][i] * params.A[i][j];
      alpha[t][j] = s * gaussianPdf(obs[t], params.mu[j], params.sigma[j]);
    }
    c[t] = alpha[t].reduce((s, v) => s + v, 0);
    if (c[t] > 0) for (let j = 0; j < K; j++) alpha[t][j] /= c[t];
  }
  let logLik = 0;
  for (let t = 0; t < T; t++) logLik += Math.log(Math.max(c[t], 1e-300));
  return { alpha, c, logLik };
}

function backwardScaled(
  obs: readonly number[],
  params: HMMParams,
  c: readonly number[],
): number[][] {
  const T = obs.length;
  const K = params.pi.length;
  const beta: number[][] = Array.from({ length: T }, () => new Array(K).fill(0));
  for (let k = 0; k < K; k++) beta[T - 1][k] = 1 / Math.max(c[T - 1], 1e-300);
  for (let t = T - 2; t >= 0; t--) {
    for (let i = 0; i < K; i++) {
      let s = 0;
      for (let j = 0; j < K; j++) {
        s += params.A[i][j] * gaussianPdf(obs[t + 1], params.mu[j], params.sigma[j]) * beta[t + 1][j];
      }
      beta[t][i] = s / Math.max(c[t], 1e-300);
    }
  }
  return beta;
}

/** Train Gaussian HMM via Baum-Welch EM. */
export function trainHMM(
  obs: readonly number[],
  k: number,
  options: { maxIter?: number; tolerance?: number; seed?: number } = {},
): { params: HMMParams; logLik: number; iterations: number } {
  const maxIter = options.maxIter ?? 100;
  const tol = options.tolerance ?? 1e-5;
  const seed = options.seed ?? 1;
  // Initialize: spread means across observation range, equal sigma, uniform pi/A.
  let lo = Infinity;
  let hi = -Infinity;
  for (const x of obs) {
    if (x < lo) lo = x;
    if (x > hi) hi = x;
  }
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0x100000000);
  };
  const mu: number[] = Array.from({ length: k }, (_, i) => lo + ((hi - lo) * (i + 0.5)) / k + (rng() - 0.5) * 0.01);
  const meanAll = obs.reduce((acc, v) => acc + v, 0) / obs.length;
  const varAll = obs.reduce((acc, v) => acc + (v - meanAll) ** 2, 0) / obs.length;
  const sigma: number[] = new Array(k).fill(Math.sqrt(varAll));
  const pi: number[] = new Array(k).fill(1 / k);
  const A: number[][] = Array.from({ length: k }, () => new Array(k).fill(1 / k));

  let prevLL = -Infinity;
  let iterations = 0;
  for (let it = 0; it < maxIter; it++) {
    iterations = it + 1;
    const params: HMMParams = { pi: [...pi], A: A.map((r) => [...r]), mu: [...mu], sigma: [...sigma] };
    const { alpha, c, logLik } = forwardScaled(obs, params);
    const beta = backwardScaled(obs, params, c);
    const T = obs.length;
    // gamma[t][k] = alpha[t][k] * beta[t][k] / sum_j ...
    const gamma: number[][] = Array.from({ length: T }, () => new Array(k).fill(0));
    for (let t = 0; t < T; t++) {
      let denom = 0;
      for (let kk = 0; kk < k; kk++) {
        gamma[t][kk] = alpha[t][kk] * beta[t][kk];
        denom += gamma[t][kk];
      }
      if (denom > 0) for (let kk = 0; kk < k; kk++) gamma[t][kk] /= denom;
    }
    // xi[t][i][j] for t=0..T-2
    const xiSum: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
    const gammaSum: number[] = new Array(k).fill(0);
    for (let t = 0; t < T - 1; t++) {
      let denom = 0;
      const matrix: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          matrix[i][j] = alpha[t][i] * params.A[i][j] * gaussianPdf(obs[t + 1], params.mu[j], params.sigma[j]) * beta[t + 1][j];
          denom += matrix[i][j];
        }
      }
      if (denom > 0) {
        for (let i = 0; i < k; i++) {
          for (let j = 0; j < k; j++) xiSum[i][j] += matrix[i][j] / denom;
        }
      }
      for (let i = 0; i < k; i++) gammaSum[i] += gamma[t][i];
    }
    // M-step
    for (let kk = 0; kk < k; kk++) pi[kk] = gamma[0][kk];
    for (let i = 0; i < k; i++) {
      const denom = gammaSum[i];
      for (let j = 0; j < k; j++) {
        A[i][j] = denom > 0 ? xiSum[i][j] / denom : 1 / k;
      }
    }
    for (let kk = 0; kk < k; kk++) {
      let num = 0;
      let den = 0;
      for (let t = 0; t < T; t++) {
        num += gamma[t][kk] * obs[t];
        den += gamma[t][kk];
      }
      mu[kk] = den > 0 ? num / den : mu[kk];
    }
    for (let kk = 0; kk < k; kk++) {
      let num = 0;
      let den = 0;
      for (let t = 0; t < T; t++) {
        num += gamma[t][kk] * (obs[t] - mu[kk]) ** 2;
        den += gamma[t][kk];
      }
      sigma[kk] = den > 0 ? Math.sqrt(Math.max(num / den, 1e-12)) : sigma[kk];
    }
    if (Math.abs(logLik - prevLL) < tol) {
      return { params, logLik, iterations };
    }
    prevLL = logLik;
  }
  const params: HMMParams = { pi, A, mu, sigma };
  return { params, logLik: prevLL, iterations };
}

/** Viterbi decoder: returns most-likely state path. */
export function viterbi(obs: readonly number[], params: HMMParams): number[] {
  const T = obs.length;
  const K = params.pi.length;
  const logA = params.A.map((row) => row.map((v) => Math.log(Math.max(v, 1e-300))));
  const delta: number[][] = Array.from({ length: T }, () => new Array(K).fill(-Infinity));
  const psi: number[][] = Array.from({ length: T }, () => new Array(K).fill(0));
  for (let k = 0; k < K; k++) {
    delta[0][k] =
      Math.log(Math.max(params.pi[k], 1e-300)) +
      Math.log(Math.max(gaussianPdf(obs[0], params.mu[k], params.sigma[k]), 1e-300));
  }
  for (let t = 1; t < T; t++) {
    for (let j = 0; j < K; j++) {
      let best = -Infinity;
      let bestI = 0;
      for (let i = 0; i < K; i++) {
        const v = delta[t - 1][i] + logA[i][j];
        if (v > best) {
          best = v;
          bestI = i;
        }
      }
      delta[t][j] = best + Math.log(Math.max(gaussianPdf(obs[t], params.mu[j], params.sigma[j]), 1e-300));
      psi[t][j] = bestI;
    }
  }
  let lastState = 0;
  let bestF = -Infinity;
  for (let k = 0; k < K; k++) {
    if (delta[T - 1][k] > bestF) {
      bestF = delta[T - 1][k];
      lastState = k;
    }
  }
  const path = new Array(T).fill(0);
  path[T - 1] = lastState;
  for (let t = T - 2; t >= 0; t--) path[t] = psi[t + 1][path[t + 1]];
  return path;
}
