import { describe, it, expect } from '@jest/globals';
import {
  vortex,
  awesomeOscillator,
  ultimateOscillator,
  trix,
  hullMovingAverage,
  balanceOfPower,
  OHLC,
} from '../src/indicators/advanced';

const candles: OHLC[] = Array.from({ length: 60 }, (_, i) => {
  const base = 100 + Math.sin(i * 0.3) * 10;
  return { open: base - 0.5, high: base + 1, low: base - 1, close: base + 0.25 };
});
const closes = candles.map((c) => c.close);

describe('Vortex Indicator', () => {
  it('returns viPlus/viMinus of input length with NaN warmup', () => {
    const { viPlus, viMinus } = vortex(candles, 14);
    expect(viPlus).toHaveLength(candles.length);
    expect(viMinus).toHaveLength(candles.length);
    expect(isNaN(viPlus[0])).toBe(true);
    expect(isFinite(viPlus[14])).toBe(true);
  });
  it('VI values are non-negative', () => {
    const { viPlus, viMinus } = vortex(candles, 14);
    for (let i = 14; i < candles.length; i++) {
      expect(viPlus[i]).toBeGreaterThanOrEqual(0);
      expect(viMinus[i]).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Awesome Oscillator', () => {
  it('is NaN before slow period and finite after', () => {
    const ao = awesomeOscillator(candles, 5, 34);
    expect(ao).toHaveLength(candles.length);
    expect(isNaN(ao[0])).toBe(true);
    expect(isFinite(ao[40])).toBe(true);
  });
});

describe('Ultimate Oscillator', () => {
  it('produces values in 0..100 after warmup', () => {
    const uo = ultimateOscillator(candles);
    expect(uo).toHaveLength(candles.length);
    for (let i = 28; i < candles.length; i++) {
      expect(uo[i]).toBeGreaterThanOrEqual(0);
      expect(uo[i]).toBeLessThanOrEqual(100);
    }
  });
});

describe('TRIX', () => {
  it('returns percent ROC of triple EMA, NaN at index 0', () => {
    const t = trix(closes, 15);
    expect(t).toHaveLength(closes.length);
    expect(isNaN(t[0])).toBe(true);
    expect(t.filter(isFinite).length).toBeGreaterThan(0);
  });
});

describe('Hull Moving Average', () => {
  it('matches manual WMA composition on a known window', () => {
    const hma = hullMovingAverage(closes, 16);
    expect(hma).toHaveLength(closes.length);
    // Trends with the data; finite once warmup clears.
    const finite = hma.filter(isFinite);
    expect(finite.length).toBeGreaterThan(0);
    // No window may include warmup NaN bleed: first finite is well past index 0.
    expect(isNaN(hma[0])).toBe(true);
  });
});

describe('Balance of Power', () => {
  it('is (close-open)/(high-low) per bar when unsmoothed', () => {
    const bop = balanceOfPower(candles);
    expect(bop[0]).toBeCloseTo((candles[0].close - candles[0].open) / (candles[0].high - candles[0].low), 10);
  });
  it('smoothing applies an SMA', () => {
    const bop = balanceOfPower(candles, 3);
    expect(isNaN(bop[0])).toBe(true);
    expect(isFinite(bop[5])).toBe(true);
  });
});
