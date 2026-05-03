import { fitGARCH11, garch11Variances, garch11Forecast } from '../src/garch/garch11';
import { fitEGARCH } from '../src/garch/egarch';
import { fitGJR } from '../src/garch/gjr';
import { normalRng } from '../src/stochastic/rng';

function simulateGARCH11(
  n: number,
  omega: number,
  alpha: number,
  beta: number,
  seed = 1
): number[] {
  const rng = normalRng(seed);
  const r: number[] = new Array(n);
  let sigma2 = omega / (1 - alpha - beta);
  let prevEps = 0;
  for (let t = 0; t < n; t++) {
    sigma2 = omega + alpha * prevEps * prevEps + beta * sigma2;
    const eps = Math.sqrt(sigma2) * rng();
    r[t] = eps;
    prevEps = eps;
  }
  return r;
}

describe('GARCH(1,1)', () => {
  test('fit recovers persistent process', () => {
    const sim = simulateGARCH11(2000, 0.00001, 0.05, 0.92, 42);
    const result = fitGARCH11(sim);
    expect(result.params.alpha).toBeGreaterThan(0);
    expect(result.params.beta).toBeGreaterThan(0.7);
    expect(result.params.alpha + result.params.beta).toBeLessThan(1);
  });

  test('variance recursion non-negative', () => {
    const sim = simulateGARCH11(500, 0.00001, 0.05, 0.92, 7);
    const v = garch11Variances(sim, { omega: 0.00001, alpha: 0.05, beta: 0.92, mu: 0 });
    v.forEach((x) => expect(x).toBeGreaterThan(0));
  });

  test('forecast converges to unconditional', () => {
    const p = { omega: 0.00001, alpha: 0.05, beta: 0.92, mu: 0 };
    const fcst = garch11Forecast(0.0001, 0, p, 100);
    const persistence = p.alpha + p.beta;
    const uncond = p.omega / (1 - persistence);
    expect(Math.abs(fcst[fcst.length - 1] - uncond) / uncond).toBeLessThan(0.5);
  });

  test('rejects too-short series', () => {
    expect(() => fitGARCH11([1, 2, 3])).toThrow();
  });
});

describe('EGARCH', () => {
  test('fit converges', () => {
    const sim = simulateGARCH11(1000, 0.00001, 0.05, 0.92, 13);
    const r = fitEGARCH(sim);
    expect(r.params.beta).toBeGreaterThan(0);
    expect(r.variances.length).toBe(sim.length);
    r.variances.forEach((x) => expect(x).toBeGreaterThan(0));
  });
});

describe('GJR-GARCH', () => {
  test('fit converges, alpha+beta+gamma/2 < 1', () => {
    const sim = simulateGARCH11(1500, 0.00001, 0.05, 0.92, 5);
    const r = fitGJR(sim);
    expect(r.params.alpha + r.params.beta + r.params.gamma / 2).toBeLessThan(1.01);
    r.variances.forEach((x) => expect(x).toBeGreaterThan(0));
  });
});
