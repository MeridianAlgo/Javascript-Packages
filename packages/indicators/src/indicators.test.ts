import { describe, it, expect } from '@jest/globals';
import { Indicators } from './indicators';

describe('Indicators', () => {
  const testData = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];

  describe('SMA', () => {
    it('should calculate simple moving average', () => {
      const result = Indicators.sma(testData, 3);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeCloseTo(101, 1);
    });

    it('should handle empty array', () => {
      const result = Indicators.sma([], 3);
      expect(result).toEqual([]);
    });
  });

  describe('EMA', () => {
    it('should calculate exponential moving average', () => {
      const result = Indicators.ema(testData, 3);
      expect(result.length).toBe(testData.length);
      expect(result[0]).toBe(testData[0]);
    });
  });

  describe('RSI', () => {
    it('should calculate RSI', () => {
      const result = Indicators.rsi(testData, 5);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(val => {
        if (!isNaN(val)) {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe('MACD', () => {
    it('should calculate MACD', () => {
      const result = Indicators.macd(testData, 3, 5, 2);
      expect(result.macd).toBeDefined();
      expect(result.signal).toBeDefined();
      expect(result.histogram).toBeDefined();
    });
  });

  describe('Bollinger Bands', () => {
    it('should calculate Bollinger Bands', () => {
      const result = Indicators.bollingerBands(testData, 5, 2);
      expect(result.upper).toBeDefined();
      expect(result.middle).toBeDefined();
      expect(result.lower).toBeDefined();
      
      // Upper should be >= middle >= lower
      for (let i = 0; i < result.upper.length; i++) {
        if (!isNaN(result.upper[i])) {
          expect(result.upper[i]).toBeGreaterThanOrEqual(result.middle[i]);
          expect(result.middle[i]).toBeGreaterThanOrEqual(result.lower[i]);
        }
      }
    });
  });

  describe('ATR', () => {
    it('should calculate Average True Range', () => {
      const high = [101, 103, 102, 104, 106, 105, 107, 109, 108, 110];
      const low = [99, 101, 100, 102, 104, 103, 105, 107, 106, 108];
      const close = testData;
      
      const result = Indicators.atr(high, low, close, 5);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(val => {
        expect(val).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Stochastic', () => {
    it('should calculate Stochastic Oscillator', () => {
      const high = [101, 103, 102, 104, 106, 105, 107, 109, 108, 110];
      const low = [99, 101, 100, 102, 104, 103, 105, 107, 106, 108];
      const close = testData;
      
      const result = Indicators.stochastic(high, low, close, 5, 3);
      expect(result.k).toBeDefined();
      expect(result.d).toBeDefined();
    });
  });

  describe('OBV', () => {
    it('should calculate On-Balance Volume', () => {
      const volume = [1000, 1200, 1100, 1300, 1400, 1500, 1600, 1700, 1800, 1900];
      const result = Indicators.obv(testData, volume);
      expect(result.length).toBe(testData.length);
    });
  });
});
