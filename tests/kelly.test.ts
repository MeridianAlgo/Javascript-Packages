import {
  kellyBet,
  kellyContinuous,
  kellyMultiAsset,
  fractionalKelly,
} from '../src/portfolio/kelly';

describe('Kelly criterion', () => {
  test('coin flip with edge: f = p - q/b', () => {
    // 60% win, 1:1 payoff → f = 0.6 - 0.4 = 0.2
    expect(kellyBet(0.6, 1, 1)).toBeCloseTo(0.2);
  });

  test('continuous Kelly: f = (mu-r)/sigma^2', () => {
    expect(kellyContinuous(0.08, 0.04, 0.02)).toBeCloseTo(1.5);
  });

  test('fractional Kelly scales weights', () => {
    expect(fractionalKelly([1.5, 0.5], 0.5)).toEqual([0.75, 0.25]);
  });

  test('multi-asset Kelly solves Σ⁻¹ μ', () => {
    // Diagonal cov: f_i = mu_i / sigma_i²
    const cov = [
      [0.04, 0],
      [0, 0.01],
    ];
    const mu = [0.08, 0.05];
    const w = kellyMultiAsset(mu, cov, 0);
    expect(w[0]).toBeCloseTo(0.08 / 0.04);
    expect(w[1]).toBeCloseTo(0.05 / 0.01);
  });
});
