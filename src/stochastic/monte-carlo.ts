/**
 * Unified Monte Carlo engine with variance reduction.
 *
 * Wraps any path generator (function returning terminal values or full paths)
 * and applies:
 *   - antithetic sampling (handled by underlying generator)
 *   - control variates
 *   - confidence interval reporting
 */

export interface MCResult {
  estimate: number;
  stderr: number;
  ci95: [number, number];
  paths: number;
}

export interface MCOptions {
  /** Optional control variate values per path (must match payoff length). */
  control?: { values: number[]; expected: number };
}

/**
 * Estimate E[payoff] from sampled payoff values.
 * Optional control variate reduces variance.
 */
export function monteCarloEstimate(payoffs: number[], options: MCOptions = {}): MCResult {
  const n = payoffs.length;
  if (n === 0) throw new Error('monteCarloEstimate: no payoffs');

  let adjusted = payoffs;
  if (options.control) {
    const { values, expected } = options.control;
    if (values.length !== n) throw new Error('monteCarloEstimate: control length mismatch');
    // optimal beta = Cov(X,Y) / Var(Y)
    const meanX = mean(payoffs);
    const meanY = mean(values);
    let cov = 0;
    let varY = 0;
    for (let i = 0; i < n; i++) {
      const dx = payoffs[i] - meanX;
      const dy = values[i] - meanY;
      cov += dx * dy;
      varY += dy * dy;
    }
    const beta = varY > 0 ? cov / varY : 0;
    adjusted = payoffs.map((x, i) => x - beta * (values[i] - expected));
  }

  const m = mean(adjusted);
  const v = variance(adjusted, m);
  const se = Math.sqrt(v / n);
  return {
    estimate: m,
    stderr: se,
    ci95: [m - 1.96 * se, m + 1.96 * se],
    paths: n,
  };
}

function mean(arr: number[]): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function variance(arr: number[], mu: number): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - mu;
    s += d * d;
  }
  return s / (arr.length - 1);
}

/**
 * MonteCarloEngine — wraps a sampler and a payoff function.
 *
 * @example
 *   const engine = new MonteCarloEngine(
 *     () => gbm.simulateTerminal({ paths: 10000, antithetic: true }),
 *     (terminals) => terminals.map(s => Math.max(s - K, 0) * Math.exp(-r * T))
 *   );
 *   const { estimate, ci95 } = engine.run();
 */
export class MonteCarloEngine<T> {
  constructor(
    private sampler: () => T[],
    private payoff: (samples: T[]) => number[]
  ) {}

  run(options: MCOptions = {}): MCResult {
    const samples = this.sampler();
    const payoffs = this.payoff(samples);
    return monteCarloEstimate(payoffs, options);
  }
}
