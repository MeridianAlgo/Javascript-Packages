import {
  modifiedExpectedShortfall,
  adjustedSharpeRatio,
  tailRatio,
  cornishFisherVaR,
} from '../src/risk';

describe('Tail-risk analytics', () => {
  // A left-skewed, fat-tailed daily return series: many small gains, rare large losses.
  const skewed = [
    ...Array(38).fill(0.008),
    -0.05,
    -0.07,
  ];

  describe('modifiedExpectedShortfall', () => {
    test('returns a positive loss magnitude', () => {
      expect(modifiedExpectedShortfall(skewed, 0.95)).toBeGreaterThan(0);
    });

    test('ES is at least as severe as Cornish-Fisher VaR', () => {
      const es = modifiedExpectedShortfall(skewed, 0.95);
      const v = cornishFisherVaR(skewed, 0.95);
      expect(es).toBeGreaterThanOrEqual(v - 1e-9);
    });

    test('empty input returns 0', () => {
      expect(modifiedExpectedShortfall([], 0.95)).toBe(0);
    });
  });

  describe('adjustedSharpeRatio', () => {
    test('penalises negative skew relative to the plain Sharpe', () => {
      const mean = skewed.reduce((a, b) => a + b, 0) / skewed.length;
      const variance =
        skewed.reduce((a, b) => a + (b - mean) ** 2, 0) / (skewed.length - 1);
      const std = Math.sqrt(variance);
      const plainAnnualSharpe = (mean / std) * Math.sqrt(252);

      const asr = adjustedSharpeRatio(skewed, 0, 252);
      expect(asr).toBeLessThan(plainAnnualSharpe);
    });

    test('returns 0 for zero-variance input', () => {
      expect(adjustedSharpeRatio([0.01, 0.01, 0.01])).toBe(0);
    });
  });

  describe('tailRatio', () => {
    test('is approximately 1 for a symmetric series', () => {
      const symmetric = [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3].map(x => x / 100);
      expect(Math.abs(tailRatio(symmetric, 0.1) - 1)).toBeLessThan(0.2);
    });

    test('exceeds 1 when the right tail dominates', () => {
      const rightHeavy = [-0.5, -0.4, -0.3, 0, 0.3, 0.4, 5].map(x => x / 100);
      expect(tailRatio(rightHeavy, 0.1)).toBeGreaterThan(1);
    });

    test('throws on invalid tail probability', () => {
      expect(() => tailRatio([1, 2, 3], 0.5)).toThrow();
      expect(() => tailRatio([1, 2, 3], 0)).toThrow();
    });
  });
});
