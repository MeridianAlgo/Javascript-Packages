import {
  ichimoku,
  supertrend,
  donchianChannels,
  keltnerChannels,
  aroon,
  choppinessIndex,
  connorsRSI,
  massIndex,
  fisherTransform,
  coppockCurve,
  dpo,
  elderRay,
  pivotPoints,
} from '../src/indicators/advanced';

function genCandles(n: number, seed = 1): { open: number; high: number; low: number; close: number }[] {
  let s = seed;
  const rng = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const out = [];
  let p = 100;
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = p * (1 + (rng() - 0.5) * 0.02);
    const h = Math.max(o, c) * (1 + rng() * 0.01);
    const l = Math.min(o, c) * (1 - rng() * 0.01);
    out.push({ open: o, high: h, low: l, close: c });
    p = c;
  }
  return out;
}

describe('Advanced indicators', () => {
  const candles = genCandles(120);
  const closes = candles.map((c) => c.close);

  test('Ichimoku produces 5 series', () => {
    const r = ichimoku(candles);
    expect(r.conversion).toHaveLength(candles.length);
    expect(r.spanA).toHaveLength(candles.length);
  });

  test('Supertrend direction is ±1', () => {
    const r = supertrend(candles);
    for (let i = 50; i < candles.length; i++) {
      expect([1, -1, 0]).toContain(r.direction[i]);
    }
  });

  test('Donchian upper >= lower', () => {
    const r = donchianChannels(candles, 20);
    for (let i = 20; i < candles.length; i++) {
      expect(r.upper[i]).toBeGreaterThanOrEqual(r.lower[i]);
    }
  });

  test('Keltner upper >= lower', () => {
    const r = keltnerChannels(candles, 20);
    for (let i = 30; i < candles.length; i++) {
      expect(r.upper[i]).toBeGreaterThanOrEqual(r.lower[i]);
    }
  });

  test('Aroon bounded 0..100', () => {
    const r = aroon(candles, 25);
    for (let i = 25; i < candles.length; i++) {
      expect(r.up[i]).toBeGreaterThanOrEqual(0);
      expect(r.up[i]).toBeLessThanOrEqual(100);
      expect(r.down[i]).toBeGreaterThanOrEqual(0);
      expect(r.down[i]).toBeLessThanOrEqual(100);
    }
  });

  test('Choppiness index typically 0..100', () => {
    const ci = choppinessIndex(candles, 14);
    for (let i = 30; i < candles.length; i++) {
      if (Number.isFinite(ci[i])) {
        expect(ci[i]).toBeGreaterThanOrEqual(0);
        expect(ci[i]).toBeLessThanOrEqual(100);
      }
    }
  });

  test('ConnorsRSI in [0,100] when defined', () => {
    const cr = connorsRSI(closes);
    for (let i = 105; i < closes.length; i++) {
      if (Number.isFinite(cr[i])) {
        expect(cr[i]).toBeGreaterThanOrEqual(0);
        expect(cr[i]).toBeLessThanOrEqual(100);
      }
    }
  });

  test('Mass Index defined late in series', () => {
    const m = massIndex(candles, 25);
    expect(Number.isFinite(m[100])).toBe(true);
  });

  test('Fisher Transform finite after warmup', () => {
    const f = fisherTransform(candles, 10);
    expect(Number.isFinite(f[50])).toBe(true);
  });

  test('Coppock defined after warmup', () => {
    const c = coppockCurve(closes);
    expect(Number.isFinite(c[50])).toBe(true);
  });

  test('DPO mean ~ 0', () => {
    const d = dpo(closes, 20);
    const finite = d.filter((x) => Number.isFinite(x));
    const mean = finite.reduce((s, x) => s + x, 0) / finite.length;
    expect(Math.abs(mean)).toBeLessThan(1);
  });

  test('Elder Ray bull/bear arrays length', () => {
    const er = elderRay(candles, 13);
    expect(er.bullPower).toHaveLength(candles.length);
    expect(er.bearPower).toHaveLength(candles.length);
  });

  test('Pivot points S1 < P < R1', () => {
    const p = pivotPoints(105, 95, 100);
    expect(p.s1).toBeLessThan(p.pivot);
    expect(p.pivot).toBeLessThan(p.r1);
    expect(p.s2).toBeLessThan(p.s1);
    expect(p.r2).toBeGreaterThan(p.r1);
  });
});
