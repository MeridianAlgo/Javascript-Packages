import { YieldCurve, fitNelsonSiegel, nelsonSiegelYield } from '../src/curves/yield-curve';

const close = (a: number, b: number, eps: number) => Math.abs(a - b) < eps;

describe('Nelson-Siegel', () => {
  test('fitted curve recovers synthetic data', () => {
    const trueParams = { b0: 0.04, b1: -0.02, b2: 0.01, tau: 1.5 };
    const obs = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30].map((m) => ({
      maturity: m,
      yield: nelsonSiegelYield(trueParams, m),
    }));
    const curve = YieldCurve.fit(obs);
    obs.forEach((o) => {
      expect(close(curve.spotRate(o.maturity), o.yield, 1e-3)).toBe(true);
    });
  });

  test('discount factor < 1 for positive rates', () => {
    const obs = [
      { maturity: 1, yield: 0.03 },
      { maturity: 2, yield: 0.035 },
      { maturity: 5, yield: 0.04 },
      { maturity: 10, yield: 0.045 },
    ];
    const curve = YieldCurve.fit(obs);
    expect(curve.discountFactor(5)).toBeLessThan(1);
    expect(curve.discountFactor(5)).toBeGreaterThan(0);
  });

  test('forward rate between matches definition', () => {
    const obs = [
      { maturity: 1, yield: 0.03 },
      { maturity: 2, yield: 0.035 },
      { maturity: 5, yield: 0.04 },
      { maturity: 10, yield: 0.045 },
    ];
    const curve = YieldCurve.fit(obs);
    const fwd = curve.forwardRateBetween(2, 5);
    // f(2,5) = (y(5)*5 - y(2)*2) / 3
    const expected = (curve.spotRate(5) * 5 - curve.spotRate(2) * 2) / 3;
    expect(close(fwd, expected, 1e-10)).toBe(true);
  });

  test('rejects too-few observations', () => {
    expect(() => fitNelsonSiegel([{ maturity: 1, yield: 0.03 }])).toThrow();
  });
});
