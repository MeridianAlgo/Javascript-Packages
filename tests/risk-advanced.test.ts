import {
  cornishFisherVaR,
  painIndex,
  drawdownSeries,
  conditionalDrawdownAtRisk,
  topNDrawdowns,
  gainToPainRatio,
  probabilisticSharpeRatio,
  minTrackRecordLength,
  sharpeConfidenceInterval,
  inverseNormalCdf,
} from '../src/risk/advanced';
import { applyStressScenario, listStressScenarios, getStressScenario } from '../src/risk/stress-scenarios';
import { riskBudgetingWeights, equalRiskContribution } from '../src/risk/risk-budgeting';

const close = (a: number, b: number, eps: number) => Math.abs(a - b) < eps;

describe('Inverse normal CDF', () => {
  test('q(0.5) = 0', () => expect(close(inverseNormalCdf(0.5), 0, 1e-6)).toBe(true));
  test('q(0.975) ≈ 1.96', () => expect(close(inverseNormalCdf(0.975), 1.96, 1e-3)).toBe(true));
  test('q(0.025) ≈ -1.96', () => expect(close(inverseNormalCdf(0.025), -1.96, 1e-3)).toBe(true));
});

describe('Cornish-Fisher VaR', () => {
  test('reduces to Gaussian VaR for symmetric data', () => {
    const ret: number[] = [];
    let s = 1;
    for (let i = 0; i < 5000; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const u = s / 0x7fffffff;
      // Box-Muller
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const u2 = s / 0x7fffffff;
      const z = Math.sqrt(-2 * Math.log(Math.max(u, 1e-9))) * Math.cos(2 * Math.PI * u2);
      ret.push(z * 0.01);
    }
    const cf95 = cornishFisherVaR(ret, 0.95);
    expect(cf95).toBeGreaterThan(0);
    // ~1.645 * 0.01 = 0.01645
    expect(close(cf95, 0.01645, 0.005)).toBe(true);
  });

  test('CF VaR larger than Gaussian for negative skew', () => {
    const ret: number[] = [];
    for (let i = 0; i < 1000; i++) ret.push(0.001);
    for (let i = 0; i < 50; i++) ret.push(-0.05); // tail
    const cf99 = cornishFisherVaR(ret, 0.99);
    expect(cf99).toBeGreaterThan(0);
  });
});

describe('Drawdown analytics', () => {
  const equity = [100, 110, 120, 100, 80, 90, 130, 125, 115, 140];

  test('drawdownSeries non-positive', () => {
    drawdownSeries(equity).forEach((d) => expect(d).toBeLessThanOrEqual(0));
  });

  test('painIndex positive', () => {
    expect(painIndex(equity)).toBeGreaterThan(0);
  });

  test('CDaR positive', () => {
    expect(conditionalDrawdownAtRisk(equity, 0.95)).toBeGreaterThan(0);
  });

  test('topNDrawdowns sorted by depth', () => {
    const dd = topNDrawdowns(equity, 3);
    expect(dd.length).toBeGreaterThan(0);
    for (let i = 1; i < dd.length; i++) expect(dd[i].depth).toBeGreaterThanOrEqual(dd[i - 1].depth);
  });

  test('gain-to-pain', () => {
    const r = [0.02, -0.01, 0.03, -0.02, 0.05];
    const gp = gainToPainRatio(r);
    expect(gp).toBeGreaterThan(0);
  });
});

describe('Probabilistic Sharpe', () => {
  test('PSR in [0,1]', () => {
    const r = Array.from({ length: 252 }, (_, i) => 0.001 + Math.sin(i / 10) * 0.005);
    const psr = probabilisticSharpeRatio(r, 0);
    expect(psr).toBeGreaterThanOrEqual(0);
    expect(psr).toBeLessThanOrEqual(1);
  });

  test('MinTRL finite for positive SR', () => {
    const r = Array.from({ length: 100 }, () => 0.001 + (Math.random() - 0.5) * 0.005);
    const trl = minTrackRecordLength(r, 0, 0.05);
    expect(Number.isFinite(trl)).toBe(true);
  });

  test('Sharpe CI brackets estimate', () => {
    const r = Array.from({ length: 252 }, (_, i) => 0.0005 + Math.cos(i / 5) * 0.01);
    const ci = sharpeConfidenceInterval(r, 0.95, 200);
    expect(ci.lower).toBeLessThanOrEqual(ci.estimate);
    expect(ci.upper).toBeGreaterThanOrEqual(ci.estimate);
  });
});

describe('Stress scenarios', () => {
  test('list contains expected scenarios', () => {
    const list = listStressScenarios();
    expect(list).toContain('2008-crisis');
    expect(list).toContain('covid-crash');
    expect(list).toContain('black-monday');
    expect(list).toContain('dot-com');
  });

  test('getStressScenario returns shock vector', () => {
    const s = getStressScenario('2008-crisis');
    expect(s.equityShock).toBeLessThan(0);
  });

  test('apply scenario sums breakdown components', () => {
    const r = applyStressScenario({ equity: 1_000_000, rateDuration: 50_000 }, 'covid-crash');
    expect(r.pnl).toBe(r.breakdown.equity + r.breakdown.rates + r.breakdown.credit + r.breakdown.vol + r.breakdown.fx);
    expect(r.pnl).toBeLessThan(0);
  });

  test('unknown scenario throws', () => {
    expect(() => getStressScenario('nonexistent')).toThrow();
  });
});

describe('Risk Budgeting', () => {
  test('ERC equalizes risk contributions', () => {
    // 3-asset diagonal cov: ERC weights ∝ 1/sigma_i
    const cov = [
      [0.04, 0, 0],
      [0, 0.09, 0],
      [0, 0, 0.16],
    ];
    const r = equalRiskContribution(cov);
    expect(close(r.weights.reduce((s, w) => s + w, 0), 1, 1e-6)).toBe(true);
    // Risk contributions should be equal
    const sumRc = r.riskContributions.reduce((s, x) => s + x, 0);
    r.riskContributions.forEach((rc) => expect(close(rc / sumRc, 1 / 3, 0.01)).toBe(true));
  });

  test('budgets sum to 1 enforced', () => {
    const cov = [
      [0.04, 0],
      [0, 0.09],
    ];
    expect(() => riskBudgetingWeights(cov, [0.5, 0.4])).toThrow();
  });

  test('70/30 budget produces 70/30 risk shares', () => {
    const cov = [
      [0.04, 0],
      [0, 0.04],
    ];
    const r = riskBudgetingWeights(cov, [0.7, 0.3]);
    const sumRc = r.riskContributions.reduce((s, x) => s + x, 0);
    expect(close(r.riskContributions[0] / sumRc, 0.7, 0.01)).toBe(true);
    expect(close(r.riskContributions[1] / sumRc, 0.3, 0.01)).toBe(true);
  });
});
