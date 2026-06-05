import {
  blackScholesPrice,
  blackScholesGreeks,
  higherOrderGreeks,
  BSInputs,
  OptionType,
} from '../src/options';

const base: BSInputs = { S: 100, K: 105, T: 0.75, r: 0.03, sigma: 0.25, q: 0.01 };
const h = 1e-5;
const bump = (o: BSInputs, k: keyof BSInputs, d: number): BSInputs => ({
  ...o,
  [k]: (o[k] as number) + d,
});

const close = (a: number, b: number, eps = 1e-4) => Math.abs(a - b) < eps;

describe('Higher-order Greeks (finite-difference cross-checks)', () => {
  const type: OptionType = 'call';
  const g = (o: BSInputs) => blackScholesGreeks(o, type);
  const p = (o: BSInputs) => blackScholesPrice(o, type);
  const ho = higherOrderGreeks(base, type);

  test('vanna = d(delta)/d(sigma)', () => {
    const fd = (g(bump(base, 'sigma', h)).delta - g(bump(base, 'sigma', -h)).delta) / (2 * h);
    expect(close(ho.vanna, fd)).toBe(true);
  });

  test('vomma = d(vega)/d(sigma)', () => {
    const fd = (g(bump(base, 'sigma', h)).vega - g(bump(base, 'sigma', -h)).vega) / (2 * h);
    expect(close(ho.vomma, fd, 1e-3)).toBe(true);
  });

  test('speed = d(gamma)/d(spot)', () => {
    const fd = (g(bump(base, 'S', h)).gamma - g(bump(base, 'S', -h)).gamma) / (2 * h);
    expect(close(ho.speed, fd)).toBe(true);
  });

  test('zomma = d(gamma)/d(sigma)', () => {
    const fd = (g(bump(base, 'sigma', h)).gamma - g(bump(base, 'sigma', -h)).gamma) / (2 * h);
    expect(close(ho.zomma, fd)).toBe(true);
  });

  test('dualDelta = d(price)/d(strike)', () => {
    const fd = (p(bump(base, 'K', h)) - p(bump(base, 'K', -h))) / (2 * h);
    expect(close(ho.dualDelta, fd)).toBe(true);
  });

  test('charm = -d(delta)/d(T) (calendar-time decay)', () => {
    const fd = (g(bump(base, 'T', h)).delta - g(bump(base, 'T', -h)).delta) / (2 * h);
    expect(close(ho.charm, -fd)).toBe(true);
  });

  test('color = -d(gamma)/d(T)', () => {
    const fd = (g(bump(base, 'T', h)).gamma - g(bump(base, 'T', -h)).gamma) / (2 * h);
    expect(close(ho.color, -fd)).toBe(true);
  });

  test('veta = -d(vega)/d(T)', () => {
    const fd = (g(bump(base, 'T', h)).vega - g(bump(base, 'T', -h)).vega) / (2 * h);
    expect(close(ho.veta, -fd, 1e-2)).toBe(true);
  });

  test('spot/vol-only Greeks are independent of option type', () => {
    const call = higherOrderGreeks(base, 'call');
    const put = higherOrderGreeks(base, 'put');
    for (const key of ['vanna', 'vomma', 'speed', 'zomma', 'color', 'veta', 'dualGamma', 'ultima'] as const) {
      expect(close(call[key], put[key], 1e-9)).toBe(true);
    }
  });

  test('charm and dualDelta differ between call and put', () => {
    const call = higherOrderGreeks(base, 'call');
    const put = higherOrderGreeks(base, 'put');
    expect(call.charm).not.toBeCloseTo(put.charm, 6);
    expect(call.dualDelta).not.toBeCloseTo(put.dualDelta, 6);
  });

  test('degenerate inputs return all-zero Greeks', () => {
    const expired = higherOrderGreeks({ ...base, T: 0 }, 'call');
    expect(Object.values(expired).every(v => v === 0)).toBe(true);
    const zeroVol = higherOrderGreeks({ ...base, sigma: 0 }, 'put');
    expect(Object.values(zeroVol).every(v => v === 0)).toBe(true);
  });
});
