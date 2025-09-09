import { MomentumIndicators } from '../src/momentum';

describe('MomentumIndicators', () => {
  const testData = {
    prices: [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 110, 112, 111, 113, 115, 114, 116, 118, 117, 119, 120, 122, 121, 123, 125, 124, 126, 128, 127, 129],
    open: [99, 101, 100, 102, 104, 103, 105, 107, 106, 108, 109, 111, 110, 112, 114, 113, 115, 117, 116, 118, 119, 121, 120, 122, 124, 123, 125, 127, 126, 128],
    high: [101, 103, 102, 104, 106, 105, 107, 109, 108, 110, 111, 113, 112, 114, 116, 115, 117, 119, 118, 120, 121, 123, 122, 124, 126, 125, 127, 129, 128, 130],
    low: [98, 100, 99, 101, 103, 102, 104, 106, 105, 107, 108, 110, 109, 111, 113, 112, 114, 116, 115, 117, 118, 120, 119, 121, 123, 122, 124, 126, 125, 127],
    close: [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 110, 112, 111, 113, 115, 114, 116, 118, 117, 119, 120, 122, 121, 123, 125, 124, 126, 128, 127, 129],
    volume: [1000, 1200, 1100, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900]
  };

  describe('ROC', () => {
    it('calculates ROC correctly', () => {
      const result = MomentumIndicators.roc(testData.prices, 5);

      expect(result).toHaveLength(testData.prices.length);
      expect(result[5]).toBeCloseTo(4.0, 1); // (105 - 100) / 100 * 100
    });

    it('returns empty array for insufficient data', () => {
      const result = MomentumIndicators.roc([1, 2], 5);
      expect(result).toEqual([]);
    });
  });

  describe('Momentum', () => {
    it('calculates momentum correctly', () => {
      const result = MomentumIndicators.momentum(testData.prices, 5);

      expect(result).toHaveLength(testData.prices.length);
      expect(result[5]).toBe(4); // 105 - 101
    });
  });

  describe('CMO', () => {
    it('calculates CMO correctly', () => {
      const result = MomentumIndicators.cmo(testData.prices, 14);

      expect(result).toHaveLength(testData.prices.length);
      expect(result[14]).toBeGreaterThanOrEqual(-100);
      expect(result[14]).toBeLessThanOrEqual(100);
    });
  });

  describe('RVI', () => {
    it('calculates RVI correctly', () => {
      const result = MomentumIndicators.rvi(
        testData.open,
        testData.high,
        testData.low,
        testData.close,
        10
      );

      expect(result).toHaveProperty('rvi');
      expect(result).toHaveProperty('signal');
      expect(result.rvi).toHaveLength(testData.close.length);
      expect(result.signal).toHaveLength(27);
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => {
        MomentumIndicators.rvi([1, 2], [1, 2, 3], [1, 2], [1, 2], 10);
      }).toThrow('Open, high, low, and close arrays must have the same length');
    });
  });

  describe('PPO', () => {
    it('calculates PPO correctly', () => {
      const result = MomentumIndicators.ppo(testData.prices, 12, 26, 9);

      expect(result).toHaveProperty('ppo');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('histogram');
      expect(result.ppo).toHaveLength(testData.prices.length);
    });

    it('throws error for invalid periods', () => {
      expect(() => {
        MomentumIndicators.ppo(testData.prices, 26, 12, 9);
      }).toThrow('Fast period must be less than slow period');
    });
  });

  describe('PVO', () => {
    it('calculates PVO correctly', () => {
      const result = MomentumIndicators.pvo(testData.volume, 12, 26, 9);

      expect(result).toHaveProperty('pvo');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('histogram');
      expect(result.pvo).toHaveLength(testData.volume.length);
    });
  });

  describe('DPO', () => {
    it('calculates DPO correctly', () => {
      const result = MomentumIndicators.dpo(testData.prices, 20);

      expect(result).toHaveLength(testData.prices.length);
      expect(result[19]).toBeGreaterThanOrEqual(-10);
      expect(result[19]).toBeLessThanOrEqual(10);
    });
  });

  describe('Chande Forecast Oscillator', () => {
    it('calculates Chande Forecast Oscillator correctly', () => {
      const result = MomentumIndicators.chandeForecastOscillator(testData.prices, 14);

      expect(result).toHaveLength(testData.prices.length);
      expect(result[13]).toBeGreaterThanOrEqual(-5);
      expect(result[13]).toBeLessThanOrEqual(5);
    });
  });

  describe('Coppock Curve', () => {
    it('calculates Coppock Curve correctly', () => {
      const longPrices = Array.from({ length: 50 }, (_, i) => 100 + i * 0.5 + Math.sin(i * 0.1) * 2);
      const result = MomentumIndicators.coppockCurve(longPrices, 14, 11, 10);

      expect(result).toHaveLength(27);
      expect(result[result.length - 1]).toBeGreaterThanOrEqual(-10);
      expect(result[result.length - 1]).toBeLessThanOrEqual(10);
    });
  });

  describe('KST', () => {
    it('calculates KST correctly', () => {
      const longPrices = Array.from({ length: 100 }, (_, i) => 100 + i * 0.5 + Math.sin(i * 0.1) * 2);
      const result = MomentumIndicators.kst(longPrices);

      expect(result).toHaveProperty('kst');
      expect(result).toHaveProperty('signal');
      expect(result.kst).toHaveLength(longPrices.length);
      expect(result.signal).toHaveLength(92);
    });
  });
});
