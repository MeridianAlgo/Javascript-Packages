import { PerformanceMetrics } from '../src/performance';

describe('PerformanceMetrics', () => {
  const testReturns = [0.01, 0.02, -0.01, 0.03, 0.015, -0.005, 0.025, 0.01, -0.02, 0.03, 0.02, 0.03, -0.01, 0.04, 0.01, -0.015, 0.03, 0.01, -0.02, 0.03, 0.025, 0.035, 0.0, 0.045, 0.015, -0.01, 0.035, 0.02, -0.015, 0.04];
  const testPrices = [100, 101, 103, 102, 105, 105.5, 108, 110.7, 111.8, 109.6, 112.9, 115.2, 114.0, 118.4, 119.6, 117.8, 121.3, 122.5, 120.0, 123.6, 126.7, 130.1, 130.1, 135.9, 137.9, 136.5, 141.2, 144.0, 141.8, 147.5];
  const benchmarkReturns = [0.008, 0.015, -0.012, 0.025, 0.012, -0.008, 0.02, 0.008, -0.025, 0.025, 0.018, 0.028, -0.008, 0.032, 0.012, -0.012, 0.025, 0.012, -0.02, 0.028, 0.022, 0.032, 0.005, 0.038, 0.015, -0.008, 0.03, 0.018, -0.012, 0.032];

  describe('Sharpe Ratio', () => {
    it('calculates Sharpe ratio correctly', () => {
      const result = PerformanceMetrics.sharpeRatio(testReturns, 0.02, true);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(-10);
      expect(result).toBeLessThan(20);
    });

    it('handles empty returns array', () => {
      const result = PerformanceMetrics.sharpeRatio([], 0.02, true);
      expect(result).toBe(0);
    });
  });

  describe('Sortino Ratio', () => {
    it('calculates Sortino ratio correctly', () => {
      const result = PerformanceMetrics.sortinoRatio(testReturns, 0.02, true);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(-10);
      expect(result).toBeLessThan(20);
    });

    it('returns Infinity for no downside returns', () => {
      const positiveReturns = [0.01, 0.02, 0.03, 0.015, 0.025];
      const result = PerformanceMetrics.sortinoRatio(positiveReturns, 0.02, true);
      expect(result).toBe(Infinity);
    });
  });

  describe('Maximum Drawdown', () => {
    it('calculates maximum drawdown correctly', () => {
      const result = PerformanceMetrics.maxDrawdown(testPrices);
      
      expect(result).toHaveProperty('maxDrawdown');
      expect(result).toHaveProperty('maxDrawdownPercent');
      expect(result).toHaveProperty('drawdownStart');
      expect(result).toHaveProperty('drawdownEnd');
      expect(result).toHaveProperty('recoveryTime');
      
      expect(result.maxDrawdown).toBeGreaterThanOrEqual(0);
      expect(result.maxDrawdownPercent).toBeGreaterThanOrEqual(0);
      expect(result.drawdownStart).toBeGreaterThanOrEqual(0);
      expect(result.drawdownEnd).toBeGreaterThanOrEqual(0);
      expect(result.recoveryTime).toBeGreaterThanOrEqual(0);
    });

    it('handles empty prices array', () => {
      const result = PerformanceMetrics.maxDrawdown([]);
      expect(result.maxDrawdown).toBe(0);
      expect(result.maxDrawdownPercent).toBe(0);
    });
  });

  describe('Calmar Ratio', () => {
    it('calculates Calmar ratio correctly', () => {
      const result = PerformanceMetrics.calmarRatio(testReturns, 5.0);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('handles zero max drawdown', () => {
      const result = PerformanceMetrics.calmarRatio(testReturns, 0);
      expect(result).toBe(0);
    });
  });

  describe('Information Ratio', () => {
    it('calculates information ratio correctly', () => {
      const result = PerformanceMetrics.informationRatio(testReturns, benchmarkReturns);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(-10);
      expect(result).toBeLessThan(20);
    });

    it('handles mismatched array lengths', () => {
      const result = PerformanceMetrics.informationRatio([1, 2], [1, 2, 3]);
      expect(result).toBe(0);
    });
  });

  describe('Value at Risk', () => {
    it('calculates VaR using historical method', () => {
      const result = PerformanceMetrics.valueAtRisk(testReturns, 0.05, 'historical');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('calculates VaR using parametric method', () => {
      const result = PerformanceMetrics.valueAtRisk(testReturns, 0.05, 'parametric');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('handles empty returns array', () => {
      const result = PerformanceMetrics.valueAtRisk([], 0.05, 'historical');
      expect(result).toBe(0);
    });
  });

  describe('Conditional Value at Risk', () => {
    it('calculates CVaR correctly', () => {
      const result = PerformanceMetrics.conditionalValueAtRisk(testReturns, 0.05);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('handles empty returns array', () => {
      const result = PerformanceMetrics.conditionalValueAtRisk([], 0.05);
      expect(result).toBe(0);
    });
  });

  describe('Beta', () => {
    it('calculates beta correctly', () => {
      const result = PerformanceMetrics.beta(testReturns, benchmarkReturns);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(-5);
      expect(result).toBeLessThan(5);
    });

    it('handles mismatched array lengths', () => {
      const result = PerformanceMetrics.beta([1, 2], [1, 2, 3]);
      expect(result).toBe(0);
    });
  });

  describe('Alpha', () => {
    it('calculates alpha correctly', () => {
      const result = PerformanceMetrics.alpha(testReturns, benchmarkReturns, 0.02);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(-1);
      expect(result).toBeLessThan(1);
    });

    it('handles mismatched array lengths', () => {
      const result = PerformanceMetrics.alpha([1, 2], [1, 2, 3], 0.02);
      expect(result).toBe(0);
    });
  });

  describe('Treynor Ratio', () => {
    it('calculates Treynor ratio correctly', () => {
      const result = PerformanceMetrics.treynorRatio(testReturns, 1.2, 0.02);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(-100);
      expect(result).toBeLessThan(100);
    });

    it('handles zero beta', () => {
      const result = PerformanceMetrics.treynorRatio(testReturns, 0, 0.02);
      expect(result).toBe(0);
    });
  });

  describe('Tracking Error', () => {
    it('calculates tracking error correctly', () => {
      const result = PerformanceMetrics.trackingError(testReturns, benchmarkReturns);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('handles mismatched array lengths', () => {
      const result = PerformanceMetrics.trackingError([1, 2], [1, 2, 3]);
      expect(result).toBe(0);
    });
  });

  describe('Win Rate', () => {
    it('calculates win rate correctly', () => {
      const result = PerformanceMetrics.winRate(testReturns);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('handles empty returns array', () => {
      const result = PerformanceMetrics.winRate([]);
      expect(result).toBe(0);
    });
  });

  describe('Average Win/Loss', () => {
    it('calculates average win/loss correctly', () => {
      const result = PerformanceMetrics.averageWinLoss(testReturns);
      
      expect(result).toHaveProperty('averageWin');
      expect(result).toHaveProperty('averageLoss');
      expect(result.averageWin).toBeGreaterThanOrEqual(0);
      expect(result.averageLoss).toBeGreaterThanOrEqual(0);
    });

    it('handles empty returns array', () => {
      const result = PerformanceMetrics.averageWinLoss([]);
      expect(result.averageWin).toBe(0);
      expect(result.averageLoss).toBe(0);
    });
  });

  describe('Profit Factor', () => {
    it('calculates profit factor correctly', () => {
      const result = PerformanceMetrics.profitFactor(testReturns);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('handles empty returns array', () => {
      const result = PerformanceMetrics.profitFactor([]);
      expect(result).toBe(0);
    });
  });

  describe('Performance Analysis', () => {
    it('performs comprehensive analysis', () => {
      const result = PerformanceMetrics.performanceAnalysis(testPrices, undefined, 0.02);
      
      expect(result).toHaveProperty('totalReturn');
      expect(result).toHaveProperty('annualizedReturn');
      expect(result).toHaveProperty('volatility');
      expect(result).toHaveProperty('sharpeRatio');
      expect(result).toHaveProperty('sortinoRatio');
      expect(result).toHaveProperty('maxDrawdown');
      expect(result).toHaveProperty('calmarRatio');
      expect(result).toHaveProperty('winRate');
      expect(result).toHaveProperty('profitFactor');
      expect(result).toHaveProperty('averageWinLoss');
      expect(result).toHaveProperty('var95');
      expect(result).toHaveProperty('cvar95');
    });

    it('performs analysis with benchmark', () => {
      const benchmarkPrices = [100, 100.8, 102.2, 101.0, 103.6, 103.1, 105.1, 107.2, 104.4, 107.0, 109.7];
      const result = PerformanceMetrics.performanceAnalysis(testPrices, benchmarkPrices, 0.02);
      
      expect(result).toHaveProperty('beta');
      expect(result).toHaveProperty('alpha');
      expect(result).toHaveProperty('informationRatio');
      expect(result).toHaveProperty('trackingError');
    });
  });
});
