import { describe, it, expect } from '@jest/globals';
import { Indicators } from '../src/indicators/indicators';
import { MomentumIndicators } from '../src/indicators/momentum';
import { VolumeIndicators } from '../src/indicators/volume';

const prices = [44, 44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.15, 43.61,
                44.33, 44.83, 45.1, 45.15, 45.98, 45.83, 45.61, 46.28, 46.28, 46];
const high =   [45, 45.2, 44.5, 44.9, 44.1, 44.7, 45.1, 45.4, 45.5, 44.5,
                45.1, 45.4, 45.5, 46.1, 46.4, 46.3, 46.1, 46.8, 46.8, 46.5];
const low =    [43, 43.5, 43.5, 43.8, 43.1, 43.7, 44.1, 44.5, 44.5, 43.5,
                44.1, 44.5, 44.5, 44.9, 45.4, 45.2, 45.0, 45.8, 45.8, 45.5];
const volume = [1000, 1200, 800, 900, 1100, 1300, 1500, 1400, 1200, 1100,
                1300, 1500, 1400, 1200, 1600, 1400, 1200, 1800, 1700, 1500];

describe('Parabolic SAR', () => {
  it('returns arrays of correct length', () => {
    const { sar, trend } = Indicators.parabolicSAR(high, low);
    expect(sar).toHaveLength(high.length);
    expect(trend).toHaveLength(high.length);
  });

  it('first SAR equals first low', () => {
    const { sar } = Indicators.parabolicSAR(high, low);
    expect(sar[0]).toBe(low[0]);
  });

  it('trend values are up or down', () => {
    const { trend } = Indicators.parabolicSAR(high, low);
    for (const t of trend) expect(['up', 'down']).toContain(t);
  });

  it('handles short arrays', () => {
    const { sar } = Indicators.parabolicSAR([45], [43]);
    expect(sar).toHaveLength(1);
  });

  it('throws on mismatched array lengths', () => {
    expect(() => Indicators.parabolicSAR([45, 46], [43])).toThrow();
  });
});

describe('True Strength Index (TSI)', () => {
  const longPrices = Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i * 0.3) * 10);

  it('returns arrays of prices.length', () => {
    const { tsi, signal } = MomentumIndicators.tsi(longPrices);
    expect(tsi).toHaveLength(longPrices.length);
    expect(signal).toHaveLength(longPrices.length);
  });

  it('first TSI value is NaN', () => {
    const { tsi } = MomentumIndicators.tsi(longPrices);
    expect(isNaN(tsi[0])).toBe(true);
  });

  it('produces finite values after warmup', () => {
    const { tsi } = MomentumIndicators.tsi(longPrices);
    const finite = tsi.filter(v => isFinite(v));
    expect(finite.length).toBeGreaterThan(0);
  });

  it('handles prices shorter than 2', () => {
    const { tsi } = MomentumIndicators.tsi([100]);
    expect(tsi).toHaveLength(1);
    expect(isNaN(tsi[0])).toBe(true);
  });
});

describe('Accumulation/Distribution Line', () => {
  it('returns correct length', () => {
    const ad = VolumeIndicators.adLine(high, low, prices, volume);
    expect(ad).toHaveLength(high.length);
  });

  it('first value is CLV * volume for bar 0', () => {
    const ad = VolumeIndicators.adLine(high, low, prices, volume);
    const range = high[0] - low[0];
    const clv = range !== 0 ? (2 * prices[0] - high[0] - low[0]) / range : 0;
    expect(ad[0]).toBeCloseTo(clv * volume[0], 6);
  });

  it('is cumulative (each value >= or <= previous depending on CLV)', () => {
    const ad = VolumeIndicators.adLine(high, low, prices, volume);
    expect(ad.length).toBe(high.length);
    // Spot-check: ad[1] = ad[0] + clv1*vol1
    const range1 = high[1] - low[1];
    const clv1 = range1 !== 0 ? (2 * prices[1] - high[1] - low[1]) / range1 : 0;
    expect(ad[1]).toBeCloseTo(ad[0] + clv1 * volume[1], 6);
  });

  it('returns empty for empty input', () => {
    expect(VolumeIndicators.adLine([], [], [], [])).toEqual([]);
  });

  it('throws on mismatched lengths', () => {
    expect(() => VolumeIndicators.adLine([1, 2], [1], [1, 2], [1, 2])).toThrow();
  });
});

describe('SMA optimization correctness', () => {
  it('produces same output as naive implementation', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const period = 3;
    const result = Indicators.sma(data, period);
    // Expected: NaN, NaN, 2, 3, 4, 5, 6, 7, 8, 9
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);
    expect(result[2]).toBeCloseTo(2, 10);
    expect(result[9]).toBeCloseTo(9, 10);
  });
});

describe('KAMA per-period ER correctness', () => {
  it('returns correct length with NaN warmup', () => {
    const data = Array.from({ length: 30 }, (_, i) => 100 + i * 0.5);
    const result = Indicators.kama(data, 10);
    expect(result).toHaveLength(data.length);
    // First 9 should be NaN
    for (let i = 0; i < 9; i++) expect(isNaN(result[i])).toBe(true);
    // Rest should be finite
    for (let i = 9; i < result.length; i++) expect(isFinite(result[i])).toBe(true);
  });
});
