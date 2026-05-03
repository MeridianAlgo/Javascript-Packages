import {
  parkinsonVolatility,
  garmanKlassVolatility,
  rogersSatchellVolatility,
  yangZhangVolatility,
  fitHARRV,
  OHLC,
} from '../src/indicators/range-vol';

function makeBars(n: number, sigma = 0.01): OHLC[] {
  const bars: OHLC[] = [];
  let prev = 100;
  let state = 1;
  const next = (): number => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  for (let i = 0; i < n; i++) {
    const ret = (next() - 0.5) * 2 * sigma;
    const open = prev;
    const close = open * Math.exp(ret);
    const intra = sigma * 1.5;
    const high = Math.max(open, close) * Math.exp(next() * intra);
    const low = Math.min(open, close) * Math.exp(-next() * intra);
    bars.push({ open, high, low, close });
    prev = close;
  }
  return bars;
}

describe('Range-based volatility estimators', () => {
  const bars = makeBars(500, 0.01);

  test('Parkinson positive and ~ realized', () => {
    const v = parkinsonVolatility(bars);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(0.1);
  });

  test('Garman-Klass positive', () => {
    expect(garmanKlassVolatility(bars)).toBeGreaterThan(0);
  });

  test('Rogers-Satchell positive', () => {
    expect(rogersSatchellVolatility(bars)).toBeGreaterThan(0);
  });

  test('Yang-Zhang positive', () => {
    expect(yangZhangVolatility(bars)).toBeGreaterThan(0);
  });

  test('Estimators in same ballpark', () => {
    const p = parkinsonVolatility(bars);
    const gk = garmanKlassVolatility(bars);
    const rs = rogersSatchellVolatility(bars);
    expect(Math.abs(p - gk) / p).toBeLessThan(0.5);
    expect(Math.abs(p - rs) / p).toBeLessThan(0.5);
  });
});

describe('HAR-RV', () => {
  test('fit basic + coefficients sane', () => {
    // synthetic AR(1)-ish RV
    const rv: number[] = [];
    let v = 0.0001;
    for (let i = 0; i < 200; i++) {
      v = 0.95 * v + 0.05 * 0.0001 + (Math.random() - 0.5) * 1e-6;
      rv.push(Math.max(v, 1e-8));
    }
    const r = fitHARRV(rv);
    expect(r.fitted.length).toBe(rv.length - 22);
    expect(r.residuals.length).toBe(rv.length - 22);
    expect(Number.isFinite(r.beta0)).toBe(true);
    expect(Number.isFinite(r.betaD)).toBe(true);
    expect(Number.isFinite(r.betaW)).toBe(true);
    expect(Number.isFinite(r.betaM)).toBe(true);
  });

  test('rejects too-short series', () => {
    expect(() => fitHARRV([1, 2, 3])).toThrow();
  });
});
