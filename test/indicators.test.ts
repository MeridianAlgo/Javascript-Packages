import { Indicators } from '../src/indicators';

describe('Indicators', () => {
  it('calculates SMA correctly', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = Indicators.sma(data, 5);
    expect(result).toEqual([3, 4, 5, 6, 7, 8]);
  });

  it('calculates EMA correctly', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = Indicators.ema(data, 5);
    expect(result.length).toBe(data.length);
    expect(result[0]).toBe(data[0]);
  });

  it('calculates RSI correctly', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const result = Indicators.rsi(data, 14);
    expect(result.length).toBeGreaterThanOrEqual(data.length);
    expect(result[14]).toBeDefined();
  });
}); 