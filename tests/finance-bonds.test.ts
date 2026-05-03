import {
  cleanPrice,
  dirtyPrice,
  accruedInterest,
  yieldToMaturity,
  macaulayDuration,
  modifiedDuration,
  convexity,
  dv01,
  priceChangeApprox,
} from '../src/finance/bonds';

const close = (a: number, b: number, eps = 1e-4) => Math.abs(a - b) < eps;

describe('Bonds', () => {
  test('par bond clean price = face', () => {
    const p = cleanPrice({ face: 1000, couponRate: 0.05, ytm: 0.05, yearsToMaturity: 10, frequency: 2 });
    expect(close(p, 1000, 1e-6)).toBe(true);
  });

  test('discount bond (ytm > coupon) priced below par', () => {
    const p = cleanPrice({ face: 1000, couponRate: 0.04, ytm: 0.06, yearsToMaturity: 10, frequency: 2 });
    expect(p).toBeLessThan(1000);
  });

  test('premium bond (ytm < coupon) priced above par', () => {
    const p = cleanPrice({ face: 1000, couponRate: 0.06, ytm: 0.04, yearsToMaturity: 10, frequency: 2 });
    expect(p).toBeGreaterThan(1000);
  });

  test('YTM round-trip', () => {
    const params = { face: 1000, couponRate: 0.05, ytm: 0.07, yearsToMaturity: 5, frequency: 2 };
    const price = cleanPrice(params);
    const y = yieldToMaturity(price, 1000, 0.05, 5, 2);
    expect(close(y, 0.07, 1e-5)).toBe(true);
  });

  test('accrued interest scales linearly', () => {
    const ai = accruedInterest(1000, 0.05, 2, 90, 180);
    // half a coupon period of $25 = $12.50
    expect(close(ai, 12.5, 1e-6)).toBe(true);
  });

  test('dirty = clean + accrued', () => {
    const params = { face: 1000, couponRate: 0.05, ytm: 0.05, yearsToMaturity: 10, frequency: 2 };
    const clean = cleanPrice(params);
    const dirty = dirtyPrice(params, 90, 180);
    expect(close(dirty - clean, 12.5, 1e-6)).toBe(true);
  });

  test('macaulay > modified duration', () => {
    const params = { face: 1000, couponRate: 0.05, ytm: 0.05, yearsToMaturity: 10, frequency: 2 };
    const macD = macaulayDuration(params);
    const modD = modifiedDuration(params);
    expect(macD).toBeGreaterThan(modD);
    expect(macD).toBeGreaterThan(0);
  });

  test('convexity positive for vanilla bond', () => {
    const params = { face: 1000, couponRate: 0.05, ytm: 0.05, yearsToMaturity: 10, frequency: 2 };
    expect(convexity(params)).toBeGreaterThan(0);
  });

  test('dv01 positive for long bond', () => {
    const params = { face: 1000, couponRate: 0.05, ytm: 0.05, yearsToMaturity: 10, frequency: 2 };
    expect(dv01(params)).toBeGreaterThan(0);
  });

  test('priceChangeApprox matches actual change', () => {
    const params = { face: 1000, couponRate: 0.05, ytm: 0.05, yearsToMaturity: 10, frequency: 2 };
    const dy = 0.001;
    const approx = priceChangeApprox(params, dy);
    const actual = cleanPrice({ ...params, ytm: params.ytm + dy }) - cleanPrice(params);
    expect(close(approx, actual, 0.5)).toBe(true);
  });
});
