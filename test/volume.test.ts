import { VolumeIndicators } from '../src/volume';

describe('VolumeIndicators', () => {
  const testData = {
    high: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129],
    low: [99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128],
    close: [99.5, 100.5, 101.5, 102.5, 103.5, 104.5, 105.5, 106.5, 107.5, 108.5, 109.5, 110.5, 111.5, 112.5, 113.5, 114.5, 115.5, 116.5, 117.5, 118.5, 119.5, 120.5, 121.5, 122.5, 123.5, 124.5, 125.5, 126.5, 127.5, 128.5],
    volume: [1000, 1200, 1100, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900]
  };

  describe('VWAP', () => {
    it('calculates VWAP correctly', () => {
      const result = VolumeIndicators.vwap(
        testData.high,
        testData.low,
        testData.close,
        testData.volume
      );

      expect(result).toHaveLength(testData.close.length);
      expect(result[0]).toBeGreaterThan(0);
      expect(result[result.length - 1]).toBeGreaterThan(result[0]);
    });

    it('calculates VWAP with period', () => {
      const result = VolumeIndicators.vwap(
        testData.high,
        testData.low,
        testData.close,
        testData.volume,
        5
      );

      expect(result).toHaveLength(testData.close.length);
      expect(result[0]).toBeNaN();
      expect(result[3]).toBeNaN();
      expect(result[4]).toBeGreaterThan(0);
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => {
        VolumeIndicators.vwap([1, 2], [1, 2, 3], [1, 2], [1, 2]);
      }).toThrow('High, low, close, and volume arrays must have the same length');
    });
  });

  describe('VWMA', () => {
    it('calculates VWMA correctly', () => {
      const result = VolumeIndicators.vwma(testData.close, testData.volume, 5);

      expect(result).toHaveLength(testData.close.length - 4);
      expect(result[0]).toBeGreaterThan(0);
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => {
        VolumeIndicators.vwma([1, 2], [1, 2, 3], 5);
      }).toThrow('Prices and volume arrays must have the same length');
    });
  });

  describe('MFI', () => {
    it('calculates MFI correctly', () => {
      const result = VolumeIndicators.mfi(
        testData.high,
        testData.low,
        testData.close,
        testData.volume,
        14
      );

      expect(result).toHaveLength(testData.close.length);
      expect(result[14]).toBeGreaterThanOrEqual(0);
      expect(result[14]).toBeLessThanOrEqual(100);
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => {
        VolumeIndicators.mfi([1, 2], [1, 2, 3], [1, 2], [1, 2]);
      }).toThrow('High, low, close, and volume arrays must have the same length');
    });
  });

  describe('CMF', () => {
    it('calculates CMF correctly', () => {
      const result = VolumeIndicators.cmf(
        testData.high,
        testData.low,
        testData.close,
        testData.volume,
        20
      );

      expect(result).toHaveLength(testData.close.length);
      expect(result[19]).toBeGreaterThanOrEqual(-1);
      expect(result[19]).toBeLessThanOrEqual(1);
    });
  });

  describe('VPT', () => {
    it('calculates VPT correctly', () => {
      const result = VolumeIndicators.vpt(testData.close, testData.volume);

      expect(result).toHaveLength(testData.close.length);
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).not.toBe(0);
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => {
        VolumeIndicators.vpt([1, 2], [1, 2, 3]);
      }).toThrow('Close and volume arrays must have the same length');
    });
  });

  describe('NVI', () => {
    it('calculates NVI correctly', () => {
      const result = VolumeIndicators.nvi(testData.close, testData.volume);

      expect(result).toHaveLength(testData.close.length);
      expect(result[0]).toBe(1000);
      expect(result[result.length - 1]).toBeGreaterThan(0);
    });
  });

  describe('PVI', () => {
    it('calculates PVI correctly', () => {
      const result = VolumeIndicators.pvi(testData.close, testData.volume);

      expect(result).toHaveLength(testData.close.length);
      expect(result[0]).toBe(1000);
      expect(result[result.length - 1]).toBeGreaterThan(0);
    });
  });

  describe('EMV', () => {
    it('calculates EMV correctly', () => {
      const result = VolumeIndicators.emv(
        testData.high,
        testData.low,
        testData.volume,
        14
      );

      expect(result).toHaveLength(testData.high.length - 14);
      expect(result[13]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Volume Oscillator', () => {
    it('calculates volume oscillator correctly', () => {
      const result = VolumeIndicators.volumeOscillator(testData.volume, 5, 10);

      expect(result).toHaveLength(testData.volume.length);
      expect(result[9]).toBeGreaterThanOrEqual(-1000);
      expect(result[9]).toBeLessThanOrEqual(1000);
    });

    it('throws error for invalid periods', () => {
      expect(() => {
        VolumeIndicators.volumeOscillator(testData.volume, 10, 5);
      }).toThrow('Short period must be less than long period');
    });
  });
});
