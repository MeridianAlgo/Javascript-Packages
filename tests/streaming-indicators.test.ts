import {
  StreamingSMA,
  StreamingEMA,
  StreamingRSI,
  StreamingMACD,
  StreamingBollinger,
} from '../src/indicators/streaming';

describe('StreamingSMA', () => {
  test('matches batch SMA', () => {
    const xs = [1, 2, 3, 4, 5, 6, 7];
    const sma = new StreamingSMA(3);
    const out = xs.map((x) => sma.nextValue(x));
    expect(out[0]).toBeNaN();
    expect(out[1]).toBeNaN();
    expect(out[2]).toBeCloseTo(2);
    expect(out[3]).toBeCloseTo(3);
    expect(out[6]).toBeCloseTo(6);
  });

  test('replace swaps last value', () => {
    const sma = new StreamingSMA(3);
    sma.nextValue(1);
    sma.nextValue(2);
    sma.nextValue(3); // sma = 2
    const v1 = sma.replace(6); // last 3 should now be 1,2,6 → 3
    expect(v1).toBeCloseTo(3);
  });
});

describe('StreamingEMA', () => {
  test('first value equals input (seed)', () => {
    const ema = new StreamingEMA(5);
    expect(ema.nextValue(10)).toBeCloseTo(10);
  });

  test('replace overrides last update', () => {
    const ema = new StreamingEMA(3);
    ema.nextValue(10);
    ema.nextValue(12); // ema = 12*0.5 + 10*0.5 = 11
    const v = ema.replace(20); // should recompute from prevPrev=10
    expect(v).toBeCloseTo(20 * 0.5 + 10 * 0.5);
  });
});

describe('StreamingRSI', () => {
  test('returns 100 when only gains', () => {
    const rsi = new StreamingRSI(14);
    let r = NaN;
    for (let i = 0; i < 30; i++) r = rsi.nextValue(100 + i);
    expect(r).toBe(100);
  });

  test('produces value between 0 and 100', () => {
    const rsi = new StreamingRSI(14);
    let last = NaN;
    const xs = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i / 3) * 5);
    for (const x of xs) last = rsi.nextValue(x);
    expect(last).toBeGreaterThanOrEqual(0);
    expect(last).toBeLessThanOrEqual(100);
  });
});

describe('StreamingMACD', () => {
  test('produces 3-tuple output', () => {
    const macd = new StreamingMACD();
    let r = { macd: 0, signal: 0, histogram: 0 };
    for (let i = 0; i < 50; i++) r = macd.nextValue(100 + i);
    expect(Number.isFinite(r.macd)).toBe(true);
    expect(Number.isFinite(r.signal)).toBe(true);
    expect(Number.isFinite(r.histogram)).toBe(true);
  });
});

describe('StreamingBollinger', () => {
  test('upper >= middle >= lower', () => {
    const bb = new StreamingBollinger(5, 2);
    let r = { upper: 0, middle: 0, lower: 0 };
    for (let i = 0; i < 20; i++) r = bb.nextValue(100 + Math.random() * 5);
    expect(r.upper).toBeGreaterThanOrEqual(r.middle);
    expect(r.middle).toBeGreaterThanOrEqual(r.lower);
  });
});
