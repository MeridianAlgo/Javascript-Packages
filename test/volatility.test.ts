import { VolatilityIndicators } from '../src/volatility';

describe('VolatilityIndicators', () => {
  const testData = {
    high: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129],
    low: [99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128],
    close: [99.5, 100.5, 101.5, 102.5, 103.5, 104.5, 105.5, 106.5, 107.5, 108.5, 109.5, 110.5, 111.5, 112.5, 113.5, 114.5, 115.5, 116.5, 117.5, 118.5, 119.5, 120.5, 121.5, 122.5, 123.5, 124.5, 125.5, 126.5, 127.5, 128.5],
    open: [99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128]
  };

  describe('Keltner Channels', () => {
    it('calculates Keltner Channels correctly', () => {
      const result = VolatilityIndicators.keltnerChannels(
        testData.high,
        testData.low,
        testData.close,
        20,
        2,
        10
      );

      expect(result).toHaveProperty('upper');
      expect(result).toHaveProperty('middle');
      expect(result).toHaveProperty('lower');
      expect(result.upper).toHaveLength(testData.close.length);
      expect(result.middle).toHaveLength(testData.close.length);
      expect(result.lower).toHaveLength(testData.close.length);

      // Upper should be above middle, middle should be above lower
      for (let i = 0; i < result.upper.length; i++) {
        if (!isNaN(result.upper[i]) && !isNaN(result.middle[i]) && !isNaN(result.lower[i])) {
          expect(result.upper[i]).toBeGreaterThanOrEqual(result.middle[i]);
          expect(result.middle[i]).toBeGreaterThanOrEqual(result.lower[i]);
        }
      }
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => {
        VolatilityIndicators.keltnerChannels([1, 2], [1, 2, 3], [1, 2]);
      }).toThrow('High, low, and close arrays must have the same length');
    });
  });

  describe('Standard Deviation', () => {
    it('calculates standard deviation correctly', () => {
      const result = VolatilityIndicators.standardDeviation(testData.close, 5);

      expect(result).toHaveLength(testData.close.length);
      expect(result[5]).toBeGreaterThanOrEqual(0);
    });

    it('returns empty array for insufficient data', () => {
      const result = VolatilityIndicators.standardDeviation([1, 2], 5);
      expect(result).toEqual([]);
    });
  });

  describe('Variance', () => {
    it('calculates variance correctly', () => {
      const result = VolatilityIndicators.variance(testData.close, 5);

      expect(result).toHaveLength(testData.close.length);
      expect(result[5]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Average Deviation', () => {
    it('calculates average deviation correctly', () => {
      const result = VolatilityIndicators.averageDeviation(testData.close, 5);

      expect(result).toHaveLength(testData.close.length);
      expect(result[5]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Historical Volatility', () => {
    it('calculates historical volatility correctly', () => {
      const result = VolatilityIndicators.historicalVolatility(testData.close, 5, true);

      expect(result).toHaveLength(testData.close.length);
      expect(result[5]).toBeGreaterThanOrEqual(0);
    });

    it('calculates non-annualized volatility', () => {
      const result = VolatilityIndicators.historicalVolatility(testData.close, 5, false);

      expect(result).toHaveLength(testData.close.length);
      expect(result[5]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Parkinson Volatility', () => {
    it('calculates Parkinson volatility correctly', () => {
      const result = VolatilityIndicators.parkinsonVolatility(
        testData.high,
        testData.low,
        5,
        true
      );

      expect(result).toHaveLength(testData.close.length);
      expect(result[5]).toBeGreaterThanOrEqual(0);
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => {
        VolatilityIndicators.parkinsonVolatility([1, 2], [1, 2, 3], 5);
      }).toThrow('High and low arrays must have the same length');
    });
  });

  describe('Garman-Klass Volatility', () => {
    it('calculates Garman-Klass volatility correctly', () => {
      const result = VolatilityIndicators.garmanKlassVolatility(
        testData.open,
        testData.high,
        testData.low,
        testData.close,
        5,
        true
      );

      expect(result).toHaveLength(testData.close.length);
      expect(result[5]).toBeGreaterThanOrEqual(0);
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => {
        VolatilityIndicators.garmanKlassVolatility([1, 2], [1, 2, 3], [1, 2], [1, 2], 5);
      }).toThrow('Open, high, low, and close arrays must have the same length');
    });
  });

  describe('Rogers-Satchell Volatility', () => {
    it('calculates Rogers-Satchell volatility correctly', () => {
      const result = VolatilityIndicators.rogersSatchellVolatility(
        testData.open,
        testData.high,
        testData.low,
        testData.close,
        5,
        true
      );

      expect(result).toHaveLength(testData.close.length);
      expect(result[5]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Yang-Zhang Volatility', () => {
    it('calculates Yang-Zhang volatility correctly', () => {
      const result = VolatilityIndicators.yangZhangVolatility(
        testData.open,
        testData.high,
        testData.low,
        testData.close,
        5,
        true
      );

      expect(result).toHaveLength(testData.close.length);
      expect(result[5]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Volatility Ratio', () => {
    it('calculates volatility ratio correctly', () => {
      const result = VolatilityIndicators.volatilityRatio(testData.close, 5, 10);

      expect(result).toHaveLength(testData.close.length);
      expect(result[10]).toBeGreaterThanOrEqual(0);
    });

    it('throws error for invalid periods', () => {
      expect(() => {
        VolatilityIndicators.volatilityRatio(testData.close, 10, 5);
      }).toThrow('Short period must be less than long period');
    });
  });
});
