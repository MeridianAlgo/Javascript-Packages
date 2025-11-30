import { describe, it, expect } from '@jest/globals';
import { AdvancedVolatilityIndicators } from './advanced-volatility';
import { RegimeIndicators } from './regime-detection';
import { MicrostructureIndicators } from './microstructure';
import { FeatureEngineering } from './feature-engineering';

describe('Advanced Indicators', () => {
  const returns = [0.01, -0.02, 0.015, -0.01, 0.02, -0.015, 0.01, 0.005, -0.01, 0.02];

  describe('GARCH', () => {
    it('should calculate GARCH volatility', () => {
      const result = AdvancedVolatilityIndicators.garch(returns);
      expect(result.volatility).toBeDefined();
      expect(result.volatility.length).toBeGreaterThan(0);
      expect(result.params).toBeDefined();
    });
  });

  describe('EWMA Volatility', () => {
    it('should calculate EWMA volatility', () => {
      const result = AdvancedVolatilityIndicators.ewmaVol(returns, 0.94);
      expect(result.length).toBe(returns.length);
      result.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
    });
  });

  describe('Realized Volatility', () => {
    it('should calculate realized volatility', () => {
      const result = AdvancedVolatilityIndicators.realizedVol(returns, 5);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
    });
  });

  describe('HMM Regime Detection', () => {
    it('should detect regimes', () => {
      const result = RegimeIndicators.hmm(returns, 2);
      expect(result.regimes).toBeDefined();
      expect(result.regimes.length).toBe(returns.length);
      result.regimes.forEach(regime => {
        expect(regime).toBeGreaterThanOrEqual(0);
        expect(regime).toBeLessThan(2);
      });
    });
  });

  describe('Change Points', () => {
    it('should detect change points', () => {
      const data = [1, 1, 1, 5, 5, 5, 1, 1, 1];
      const result = RegimeIndicators.changePoints(data, 2);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Feature Engineering', () => {
    it('should create lags', () => {
      const result = FeatureEngineering.lags(returns, [1, 2, 3]);
      expect(result.length).toBe(returns.length - 3);
      expect(result[0].length).toBe(3);
    });

    it('should calculate rolling stats', () => {
      const result = FeatureEngineering.rollingStats(returns, 5);
      expect(result.mean).toBeDefined();
      expect(result.std).toBeDefined();
      expect(result.min).toBeDefined();
      expect(result.max).toBeDefined();
    });

    it('should calculate z-score', () => {
      const result = FeatureEngineering.zscore(returns);
      expect(result.length).toBe(returns.length);
    });

    it('should perform PCA', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12]
      ];
      const result = FeatureEngineering.pca(data);
      expect(result.component).toBeDefined();
      expect(result.variance).toBeDefined();
    });
  });

  describe('Microstructure Indicators', () => {
    it('should calculate VPIN', () => {
      const bars = Array.from({ length: 100 }, (_, i) => ({
        t: new Date(Date.now() + i * 60000),
        o: 100 + Math.random(),
        h: 101 + Math.random(),
        l: 99 + Math.random(),
        c: 100 + Math.random(),
        v: 1000 + Math.random() * 100,
        symbol: 'TEST'
      }));

      const result = MicrostructureIndicators.vpin(bars, 10);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should calculate order imbalance', () => {
      const bars = Array.from({ length: 10 }, (_, i) => ({
        t: new Date(Date.now() + i * 60000),
        o: 100,
        h: 101,
        l: 99,
        c: 100 + (i % 2 === 0 ? 1 : -1),
        v: 1000,
        symbol: 'TEST'
      }));

      const result = MicrostructureIndicators.orderImbalance(bars);
      expect(result.length).toBe(bars.length);
    });
  });
});
