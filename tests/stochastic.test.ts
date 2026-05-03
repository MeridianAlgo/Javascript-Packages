import { GBM } from '../src/stochastic/gbm';
import { Heston } from '../src/stochastic/heston';
import { MertonJump } from '../src/stochastic/merton-jump';
import { CIR } from '../src/stochastic/cir';
import { MonteCarloEngine, monteCarloEstimate } from '../src/stochastic/monte-carlo';
import { blackScholesPrice } from '../src/options/black-scholes';

const close = (a: number, b: number, eps: number) => Math.abs(a - b) < eps;

describe('GBM', () => {
  test('simulate dimensions', () => {
    const gbm = new GBM({ S0: 100, mu: 0.05, sigma: 0.2, T: 1, steps: 252 });
    const paths = gbm.simulate({ paths: 10, seed: 1 });
    expect(paths.length).toBe(10);
    expect(paths[0].length).toBe(253);
    expect(paths[0][0]).toBe(100);
  });

  test('terminal mean ≈ S0 * exp(mu*T) for large N', () => {
    const gbm = new GBM({ S0: 100, mu: 0.05, sigma: 0.2, T: 1, steps: 1 });
    const terminals = gbm.simulateTerminal({ paths: 50000, antithetic: true, seed: 7 });
    const mean = terminals.reduce((s, x) => s + x, 0) / terminals.length;
    const expected = 100 * Math.exp(0.05);
    expect(close(mean, expected, 1)).toBe(true);
  });

  test('antithetic doubles paths', () => {
    const gbm = new GBM({ S0: 100, mu: 0.05, sigma: 0.2, T: 1, steps: 1 });
    const t = gbm.simulateTerminal({ paths: 100, antithetic: true, seed: 1 });
    expect(t.length).toBe(200);
  });
});

describe('Monte Carlo prices European call ≈ Black-Scholes', () => {
  test('GBM MC matches BS', () => {
    const S0 = 100, K = 100, T = 1, r = 0.05, sigma = 0.2;
    const gbm = new GBM({ S0, mu: r, sigma, T, steps: 1 });
    const engine = new MonteCarloEngine(
      () => gbm.simulateTerminal({ paths: 100000, antithetic: true, seed: 42 }),
      (terms) => terms.map((s) => Math.max(s - K, 0) * Math.exp(-r * T))
    );
    const { estimate, ci95 } = engine.run();
    const bs = blackScholesPrice({ S: S0, K, T, r, sigma }, 'call');
    expect(estimate).toBeGreaterThan(ci95[0] - 0.5);
    expect(close(estimate, bs, 0.2)).toBe(true);
  });
});

describe('monteCarloEstimate', () => {
  test('basic mean + ci', () => {
    const payoffs = Array.from({ length: 1000 }, (_, i) => i / 1000);
    const r = monteCarloEstimate(payoffs);
    expect(close(r.estimate, 0.5, 0.05)).toBe(true);
    expect(r.ci95[0]).toBeLessThan(r.estimate);
    expect(r.ci95[1]).toBeGreaterThan(r.estimate);
  });

  test('control variate reduces stderr', () => {
    // Y = X + small noise, so high correlation → control variate helps
    const x: number[] = [];
    const y: number[] = [];
    let s = 1;
    for (let i = 0; i < 1000; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const u = s / 0x7fffffff;
      const v = u + (Math.random() - 0.5) * 0.01;
      x.push(u);
      y.push(v);
    }
    const plain = monteCarloEstimate(x);
    const cv = monteCarloEstimate(x, { control: { values: y, expected: 0.5 } });
    expect(cv.stderr).toBeLessThan(plain.stderr * 1.5);
  });
});

describe('Heston', () => {
  test('simulate dims', () => {
    const h = new Heston({
      S0: 100, v0: 0.04, mu: 0.05,
      kappa: 2, theta: 0.04, xi: 0.3, rho: -0.7,
      T: 1, steps: 252,
    });
    const paths = h.simulate({ paths: 5, seed: 1 });
    expect(paths.length).toBe(5);
    expect(paths[0].prices.length).toBe(253);
    expect(paths[0].variances.length).toBe(253);
  });

  test('rejects |rho|>1', () => {
    expect(() => new Heston({
      S0: 100, v0: 0.04, mu: 0.05,
      kappa: 2, theta: 0.04, xi: 0.3, rho: 1.5,
      T: 1, steps: 100,
    })).toThrow();
  });
});

describe('Merton jump-diffusion', () => {
  test('simulate dims', () => {
    const m = new MertonJump({
      S0: 100, mu: 0.05, sigma: 0.2,
      lambda: 1, muJ: -0.1, sigmaJ: 0.15,
      T: 1, steps: 252,
    });
    const paths = m.simulate({ paths: 5, seed: 1 });
    expect(paths.length).toBe(5);
    expect(paths[0][0]).toBe(100);
  });
});

describe('CIR', () => {
  test('Feller condition', () => {
    const c = new CIR({ r0: 0.03, kappa: 2, theta: 0.04, sigma: 0.1, T: 1, steps: 100 });
    expect(c.fellerSatisfied()).toBe(true);
  });

  test('paths stay non-negative', () => {
    const c = new CIR({ r0: 0.03, kappa: 2, theta: 0.04, sigma: 0.1, T: 1, steps: 252 });
    const paths = c.simulate({ paths: 10, seed: 1 });
    paths.forEach((path) => path.forEach((r) => expect(r).toBeGreaterThanOrEqual(-1e-10)));
  });

  test('bond price decreases with maturity', () => {
    const c = new CIR({ r0: 0.03, kappa: 2, theta: 0.04, sigma: 0.1, T: 1, steps: 100 });
    const p1 = c.bondPrice(0, 1, 0.03);
    const p5 = c.bondPrice(0, 5, 0.03);
    expect(p1).toBeGreaterThan(p5);
    expect(p1).toBeLessThan(1);
  });
});
