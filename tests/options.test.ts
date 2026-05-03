import {
  blackScholesPrice,
  blackScholesGreeks,
  putCallParity,
  normalCdf,
  normalPdf,
  impliedVolatility,
  impliedVolNewton,
  impliedVolBrent,
  OptionChain,
} from '../src/options';

const close = (a: number, b: number, eps = 1e-3) => Math.abs(a - b) < eps;

describe('Black-Scholes', () => {
  test('normalCdf at 0 = 0.5', () => {
    expect(close(normalCdf(0), 0.5, 1e-7)).toBe(true);
  });

  test('normalCdf symmetric', () => {
    expect(close(normalCdf(1) + normalCdf(-1), 1, 1e-6)).toBe(true);
  });

  test('normalPdf at 0 = 1/sqrt(2pi)', () => {
    expect(close(normalPdf(0), 1 / Math.sqrt(2 * Math.PI), 1e-12)).toBe(true);
  });

  test('ATM call price (Hull textbook)', () => {
    // S=42, K=40, T=0.5, r=0.1, sigma=0.2 → call ≈ 4.7594
    const c = blackScholesPrice({ S: 42, K: 40, T: 0.5, r: 0.1, sigma: 0.2 }, 'call');
    expect(close(c, 4.7594, 0.01)).toBe(true);
  });

  test('ATM put price (Hull textbook)', () => {
    // same params → put ≈ 0.8086
    const p = blackScholesPrice({ S: 42, K: 40, T: 0.5, r: 0.1, sigma: 0.2 }, 'put');
    expect(close(p, 0.8086, 0.01)).toBe(true);
  });

  test('put-call parity holds', () => {
    const params = { S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2 };
    const c = blackScholesPrice(params, 'call');
    const p = blackScholesPrice(params, 'put');
    const dev = putCallParity(100, 100, 1, 0.05, c, p);
    expect(dev).toBeLessThan(1e-6);
  });

  test('Greeks signs are correct', () => {
    const params = { S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2 };
    const callG = blackScholesGreeks(params, 'call');
    const putG = blackScholesGreeks(params, 'put');
    expect(callG.delta).toBeGreaterThan(0);
    expect(callG.delta).toBeLessThan(1);
    expect(putG.delta).toBeLessThan(0);
    expect(callG.gamma).toBeGreaterThan(0);
    expect(callG.gamma).toBeCloseTo(putG.gamma, 8);
    expect(callG.vega).toBeGreaterThan(0);
    expect(callG.theta).toBeLessThan(0);
  });

  test('expired option = intrinsic', () => {
    expect(blackScholesPrice({ S: 110, K: 100, T: 0, r: 0.05, sigma: 0.2 }, 'call')).toBe(10);
    expect(blackScholesPrice({ S: 90, K: 100, T: 0, r: 0.05, sigma: 0.2 }, 'put')).toBe(10);
  });
});

describe('Implied Volatility', () => {
  test('Newton round-trip', () => {
    const params = { S: 100, K: 100, T: 1, r: 0.05, sigma: 0.25 };
    const price = blackScholesPrice(params, 'call');
    const iv = impliedVolNewton(price, 100, 100, 1, 0.05, 'call');
    expect(close(iv, 0.25, 1e-5)).toBe(true);
  });

  test('Brent round-trip', () => {
    const params = { S: 100, K: 110, T: 0.5, r: 0.03, sigma: 0.4 };
    const price = blackScholesPrice(params, 'put');
    const iv = impliedVolBrent(price, 100, 110, 0.5, 0.03, 'put');
    expect(close(iv, 0.4, 1e-5)).toBe(true);
  });

  test('impliedVolatility wrapper falls back', () => {
    const params = { S: 100, K: 100, T: 1, r: 0.05, sigma: 0.3 };
    const price = blackScholesPrice(params, 'call');
    const iv = impliedVolatility(price, 100, 100, 1, 0.05, 'call');
    expect(close(iv, 0.3, 1e-4)).toBe(true);
  });
});

describe('OptionChain', () => {
  test('compute prices and greeks for chain', () => {
    const chain = new OptionChain({ spot: 100, rate: 0.05 });
    chain.addBulk([
      { strike: 95, expiry: 0.5, type: 'call' },
      { strike: 100, expiry: 0.5, type: 'call' },
      { strike: 105, expiry: 0.5, type: 'call' },
    ]);
    chain.computePrices(0.2).computeImpliedVols().computeGreeks();
    const all = chain.all();
    all.forEach((q) => {
      expect(q.price).toBeGreaterThan(0);
      expect(q.iv).toBeGreaterThan(0);
      expect(q.greeks?.delta).toBeGreaterThan(0);
    });
  });

  test('strikes/expiries unique sorted', () => {
    const chain = new OptionChain({ spot: 100, rate: 0.05 });
    chain.addBulk([
      { strike: 100, expiry: 1, type: 'call' },
      { strike: 95, expiry: 1, type: 'call' },
      { strike: 100, expiry: 0.5, type: 'put' },
    ]);
    expect(chain.strikes()).toEqual([95, 100]);
    expect(chain.expiries()).toEqual([0.5, 1]);
  });
});
