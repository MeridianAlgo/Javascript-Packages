import { describe, it, expect } from '@jest/globals';
import { RiskMetrics } from '../src/risk/metrics';
import { PerformanceMetrics } from '../src/risk/performance';

describe('Risk Metrics', () => {
  const returns = [0.01, -0.02, 0.015, -0.01, 0.02, -0.015, 0.01, 0.005, -0.01, 0.02];
  const equity = [100000, 101000, 98980, 100465, 99460, 101450, 99930, 100930, 101435, 100420, 102430];

  describe('VaR', () => {
    it('should calculate historical VaR', () => {
      const var95 = RiskMetrics.var(returns, 0.95, 'historical');
      expect(var95).toBeLessThan(0);
      expect(var95).toBeGreaterThan(-1);
    });

    it('should calculate parametric VaR', () => {
      const var95 = RiskMetrics.var(returns, 0.95, 'parametric');
      expect(var95).toBeLessThan(0);
    });

    it('should calculate Monte Carlo VaR', () => {
      const var95 = RiskMetrics.var(returns, 0.95, 'monte-carlo');
      expect(var95).toBeLessThan(0);
    });
  });

  describe('CVaR', () => {
    it('should calculate Conditional VaR', () => {
      const cvar95 = RiskMetrics.cvar(returns, 0.95);
      expect(cvar95).toBeLessThan(0);

      const var95 = RiskMetrics.var(returns, 0.95, 'historical');
      expect(cvar95).toBeLessThanOrEqual(var95);
    });
  });

  describe('Max Drawdown', () => {
    it('should calculate maximum drawdown', () => {
      const result = RiskMetrics.maxDrawdown(equity);
      expect(result.value).toBeLessThanOrEqual(0);
      expect(result.start).toBeGreaterThanOrEqual(0);
      expect(result.end).toBeGreaterThanOrEqual(result.start);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Volatility', () => {
    it('should calculate volatility', () => {
      const vol = RiskMetrics.volatility(returns);
      expect(vol).toBeGreaterThan(0);
    });

    it('should annualize volatility', () => {
      const vol = RiskMetrics.volatility(returns, true);
      expect(vol).toBeGreaterThan(0);
    });
  });

  describe('Beta', () => {
    it('should calculate beta', () => {
      const benchmarkReturns = [0.008, -0.015, 0.012, -0.008, 0.018, -0.012, 0.009, 0.004, -0.009, 0.015];
      const beta = RiskMetrics.beta(returns, benchmarkReturns);
      expect(beta).toBeGreaterThan(0);
    });
  });

  describe('Tracking Error', () => {
    it('should calculate tracking error', () => {
      const benchmarkReturns = [0.008, -0.015, 0.012, -0.008, 0.018, -0.012, 0.009, 0.004, -0.009, 0.015];
      const te = RiskMetrics.trackingError(returns, benchmarkReturns);
      expect(te).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Performance Metrics', () => {
  const returns = [0.01, -0.02, 0.015, -0.01, 0.02, -0.015, 0.01, 0.005, -0.01, 0.02];
  const equity = [100000, 101000, 98980, 100465, 99460, 101450, 99930, 100930, 101435, 100420, 102430];

  describe('Sharpe Ratio', () => {
    it('should calculate Sharpe ratio', () => {
      const sharpe = PerformanceMetrics.sharpeRatio(returns, 0.02);
      expect(typeof sharpe).toBe('number');
    });
  });

  describe('Sortino Ratio', () => {
    it('should calculate Sortino ratio', () => {
      const sortino = PerformanceMetrics.sortinoRatio(returns, 0.02);
      expect(typeof sortino).toBe('number');
    });
  });

  describe('Calmar Ratio', () => {
    it('should calculate Calmar ratio', () => {
      const calmar = PerformanceMetrics.calmarRatio(returns, equity);
      expect(typeof calmar).toBe('number');
    });

    it('is non-zero when there is a drawdown and positive mean return (regression)', () => {
      // maxDrawdown().value is negative; the ratio must use its magnitude.
      // Equity dips then recovers to a new high, so there is a real drawdown.
      const eq = [100, 110, 90, 120];
      const rets = [0.1, -0.18, 0.33];
      const calmar = PerformanceMetrics.calmarRatio(rets, eq);
      expect(calmar).not.toBe(0);
      expect(Number.isFinite(calmar)).toBe(true);
    });
  });

  describe('Recovery Factor', () => {
    it('is non-zero with drawdown and positive total return (regression)', () => {
      const eq = [100, 110, 90, 120];
      const rets = [0.1, -0.18, 0.33];
      const rf = PerformanceMetrics.recoveryFactor(rets, eq);
      expect(rf).not.toBe(0);
      expect(Number.isFinite(rf)).toBe(true);
    });
  });

  describe('Information Ratio', () => {
    it('should calculate Information ratio', () => {
      const benchmarkReturns = [0.008, -0.015, 0.012, -0.008, 0.018, -0.012, 0.009, 0.004, -0.009, 0.015];
      const ir = PerformanceMetrics.informationRatio(returns, benchmarkReturns);
      expect(typeof ir).toBe('number');
    });
  });
});
