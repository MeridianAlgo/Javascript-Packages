import { Indicators, IndicatorError } from '../src/indicators';
import { VolumeIndicators } from '../src/volume';
import { MomentumIndicators } from '../src/momentum';
import { VolatilityIndicators } from '../src/volatility';
import { PerformanceMetrics } from '../src/performance';
import { PatternRecognition } from '../src/patterns';

describe('Indicators', () => {
  // Test data - extended to support all indicators
  const testData = {
    prices: [22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29, 22.15, 22.39, 22.25, 22.35, 22.30, 22.40, 22.45, 22.50, 22.55, 22.60, 22.65, 22.70, 22.75, 22.80, 22.85, 22.90, 22.95, 23.00, 23.05, 23.10],
    high: [22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29, 22.15, 22.39, 22.25, 22.35, 22.30, 22.40, 22.45, 22.50, 22.55, 22.60, 22.65, 22.70, 22.75, 22.80, 22.85, 22.90, 22.95, 23.00, 23.05, 23.10],
    low: [22.0, 22.0, 21.9, 22.0, 22.05, 22.0, 22.1, 22.2, 22.1, 22.15, 22.05, 22.1, 22.0, 22.1, 22.05, 22.15, 22.20, 22.25, 22.30, 22.35, 22.40, 22.45, 22.50, 22.55, 22.60, 22.65, 22.70, 22.75, 22.80, 22.85],
    close: [22.15, 22.1, 22.2, 22.22, 22.08, 22.15, 22.2, 22.3, 22.2, 22.1, 22.2, 22.3, 22.25, 22.35, 22.30, 22.40, 22.45, 22.50, 22.55, 22.60, 22.65, 22.70, 22.75, 22.80, 22.85, 22.90, 22.95, 23.00, 23.05, 23.10],
    volume: [1000, 1200, 1500, 1100, 1300, 1400, 1600, 1800, 1700, 1500, 1400, 1600, 1200, 1400, 1300, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900]
  };

  // Helper function to check if array contains only numbers (or NaN)
  const isNumericArray = (arr: any[]): boolean => {
    return arr.every(item => typeof item === 'number' || isNaN(item));
  };

  describe('Input Validation', () => {
    it('throws error for non-array input', () => {
      expect(() => Indicators.sma(null as any, 5)).toThrow(IndicatorError);
      expect(() => Indicators.sma(undefined as any, 5)).toThrow(IndicatorError);
      expect(() => Indicators.sma('not an array' as any, 5)).toThrow(IndicatorError);
    });

    it('throws error for empty array', () => {
      expect(() => Indicators.sma([], 5)).toThrow(IndicatorError);
    });

    it('throws error for invalid period', () => {
      expect(() => Indicators.sma([1, 2, 3], 0)).toThrow(IndicatorError);
      expect(() => Indicators.sma([1, 2, 3], -1)).toThrow(IndicatorError);
      expect(() => Indicators.sma([1, 2, 3], 1.5)).toThrow(IndicatorError);
    });
  });

  describe('Moving Averages', () => {
    it('calculates SMA correctly', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = Indicators.sma(data, 5);
      expect(result).toHaveLength(6);
      expect(result).toEqual([3, 4, 5, 6, 7, 8]);
      expect(isNumericArray(result)).toBe(true);
    });

    it('calculates EMA correctly', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = Indicators.ema(data, 5);
      expect(result).toHaveLength(data.length);
      expect(result[0]).toBe(data[0]);
      expect(isNumericArray(result)).toBe(true);
    });

    it('calculates WMA correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const result = Indicators.wma(data, 3);
      expect(result).toHaveLength(3);
      expect(isNumericArray(result)).toBe(true);
    });

    it('calculates DEMA correctly', () => {
      const result = Indicators.dema(testData.prices, 5);
      expect(result).toHaveLength(testData.prices.length);
      expect(isNumericArray(result)).toBe(true);
    });

    it('calculates TEMA correctly', () => {
      const result = Indicators.tema(testData.prices, 5);
      expect(result).toHaveLength(testData.prices.length);
      expect(isNumericArray(result)).toBe(true);
    });

    it('supports different moving average types', () => {
      const types: Array<'sma' | 'ema' | 'wma' | 'dema' | 'tema'> = ['sma', 'ema', 'wma', 'dema', 'tema'];
      types.forEach(type => {
        const result = Indicators.movingAverage(type, testData.prices, 5);
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(isNumericArray(result)).toBe(true);
      });
    });
  });

  describe('Oscillators', () => {
    it('calculates RSI correctly', () => {
      const result = Indicators.rsi(testData.prices, 14);
      expect(result).toHaveLength(testData.prices.length);
      expect(isNumericArray(result)).toBe(true);
      
      // RSI values should be between 0 and 100 (or NaN for initial values)
      result.forEach(val => {
        if (!isNaN(val)) {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      });
    });

    it('calculates MACD correctly', () => {
      const result = Indicators.macd(testData.prices, 12, 26, 9);
      expect(result).toHaveProperty('macd');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('histogram');
      
      expect(isNumericArray(result.macd)).toBe(true);
      expect(isNumericArray(result.signal)).toBe(true);
      expect(isNumericArray(result.histogram)).toBe(true);
    });

    it('calculates Bollinger Bands correctly', () => {
      const result = Indicators.bollingerBands(testData.prices, 20, 2);
      expect(result).toHaveProperty('upper');
      expect(result).toHaveProperty('middle');
      expect(result).toHaveProperty('lower');
      
      // Upper band should be above middle band
      result.upper.forEach((val, i) => {
        if (!isNaN(val) && !isNaN(result.middle[i])) {
          expect(val).toBeGreaterThanOrEqual(result.middle[i]);
        }
      });
      
      // Lower band should be below middle band
      result.lower.forEach((val, i) => {
        if (!isNaN(val) && !isNaN(result.middle[i])) {
          expect(val).toBeLessThanOrEqual(result.middle[i]);
        }
      });
    });

    it('calculates Stochastic Oscillator correctly', () => {
      const result = Indicators.stochastic(
        testData.high, 
        testData.low, 
        testData.close, 
        14, 3, 3
      );
      
      expect(result).toHaveProperty('k');
      expect(result).toHaveProperty('d');
      
      // %K and %D should be between 0 and 100
      result.k.forEach(val => {
        if (!isNaN(val)) {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      });
      
      result.d.forEach(val => {
        if (!isNaN(val)) {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe('Volatility Indicators', () => {
    it('calculates ATR correctly', () => {
      const result = Indicators.atr(
        testData.high,
        testData.low,
        testData.close,
        14
      );
      
      expect(Array.isArray(result)).toBe(true);
      expect(isNumericArray(result)).toBe(true);
      
      // ATR should always be positive or zero
      result.forEach(val => {
        if (!isNaN(val)) {
          expect(val).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Volume Indicators', () => {
    it('calculates Volume MA correctly', () => {
      const result = Indicators.volumeMA(testData.volume, 5);
      expect(Array.isArray(result)).toBe(true);
      expect(isNumericArray(result)).toBe(true);
      
      // Volume MA should be a smoothed version of the volume
      expect(result.length).toBeLessThanOrEqual(testData.volume.length);
    });

    it('calculates OBV correctly', () => {
      const result = Indicators.obv(testData.close, testData.volume);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(testData.volume.length);
      expect(isNumericArray(result)).toBe(true);
      
      // OBV should generally increase or decrease with price movement
      let increasing = 0;
      for (let i = 1; i < result.length; i++) {
        if (result[i] > result[i - 1]) increasing++;
      }
      expect(increasing).toBeGreaterThan(0);
    });
  });

  describe('Price Channels', () => {
    it('calculates Donchian Channels correctly', () => {
      const result = Indicators.donchianChannels(
        testData.high,
        testData.low,
        20
      );
      
      expect(result).toHaveProperty('upper');
      expect(result).toHaveProperty('middle');
      expect(result).toHaveProperty('lower');
      
      // Upper channel should be the highest high in the period
      // Lower channel should be the lowest low in the period
      // Middle should be the average of upper and lower
      result.upper.forEach((upper, i) => {
        if (!isNaN(upper) && !isNaN(result.lower[i]) && !isNaN(result.middle[i])) {
          expect(upper).toBeGreaterThanOrEqual(result.lower[i]);
          expect(result.middle[i]).toBeCloseTo((upper + result.lower[i]) / 2);
        }
      });
    });

    // Test backward compatibility with priceChannels alias
    it('maintains backward compatibility with priceChannels', () => {
      const result1 = Indicators.donchianChannels(testData.high, testData.low, 20);
      const result2 = Indicators.priceChannels(testData.high, testData.low, 20);
      
      expect(result1.upper).toEqual(result2.upper);
      expect(result1.middle).toEqual(result2.middle);
      expect(result1.lower).toEqual(result2.lower);
    });
  });

  describe('Momentum Indicators', () => {
    it('calculates Williams %R correctly', () => {
      const result = Indicators.williamsR(
        testData.high,
        testData.low,
        testData.close,
        14
      );
      
      expect(Array.isArray(result)).toBe(true);
      expect(isNumericArray(result)).toBe(true);
      
      // Williams %R should be between -100 and 0
      result.forEach(val => {
        if (!isNaN(val)) {
          expect(val).toBeLessThanOrEqual(0);
          expect(val).toBeGreaterThanOrEqual(-100);
        }
      });
    });

    it('calculates CCI correctly', () => {
      const result = Indicators.cci(
        testData.high,
        testData.low,
        testData.close,
        20
      );
      
      expect(Array.isArray(result)).toBe(true);
      expect(isNumericArray(result)).toBe(true);
      
      // CCI can be any number, but extreme values are rare
      // Just check that we have some non-NaN values
      const validValues = result.filter(val => !isNaN(val));
      expect(validValues.length).toBeGreaterThan(0);
    });

    it('calculates ADX correctly', () => {
      const result = Indicators.adx(
        testData.high,
        testData.low,
        testData.close,
        14
      );
      
      expect(result).toHaveProperty('adx');
      expect(result).toHaveProperty('plusDI');
      expect(result).toHaveProperty('minusDI');
      
      // ADX values should be between 0 and 100
      result.adx.forEach(val => {
        if (!isNaN(val)) {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      });
      
      // DI+ and DI- should be positive
      result.plusDI.forEach(val => {
        if (!isNaN(val)) expect(val).toBeGreaterThanOrEqual(0);
      });
      result.minusDI.forEach(val => {
        if (!isNaN(val)) expect(val).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Error Cases', () => {
    it('handles insufficient data', () => {
      // Test with not enough data points
      const shortData = [1, 2, 3];
      expect(Indicators.sma(shortData, 5)).toEqual([]);
      
      // Test with exactly enough data points
      const exactData = [1, 2, 3, 4, 5];
      expect(Indicators.sma(exactData, 5)).toHaveLength(1);
    });
    
    it('handles NaN values in input', () => {
      const dataWithNaN = [1, 2, NaN, 4, 5];
      expect(() => Indicators.sma(dataWithNaN, 2)).toThrow(IndicatorError);
    });
    
    it('handles invalid periods', () => {
      const data = [1, 2, 3, 4, 5];
      expect(() => Indicators.sma(data, 0)).toThrow(IndicatorError);
      expect(() => Indicators.sma(data, -1)).toThrow(IndicatorError);
      expect(() => Indicators.sma(data, 1.5)).toThrow(IndicatorError);
    });
  });
});