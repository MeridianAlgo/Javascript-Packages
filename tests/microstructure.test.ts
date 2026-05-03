import {
  OrderBook,
  effectiveSpread,
  realizedSpread,
  rollSpread,
  squareRootImpact,
  almgrenChrissExpectedCost,
  TradeQuote,
} from '../src/microstructure';

describe('OrderBook', () => {
  const book = new OrderBook({
    bids: [
      { price: 99.5, size: 100 },
      { price: 99.0, size: 200 },
    ],
    asks: [
      { price: 100.5, size: 150 },
      { price: 101.0, size: 300 },
    ],
  });

  test('mid + quoted spread', () => {
    expect(book.midPrice()).toBeCloseTo(100);
    expect(book.quotedSpread()).toBeCloseTo(1.0);
    expect(book.relativeSpread()).toBeCloseTo(0.01);
  });

  test('microprice tilts toward heavier-pressure side', () => {
    // ask size 150 > bid size 100 → more selling pressure → microprice below mid
    const mp = book.microprice()!;
    expect(mp).toBeLessThan(100);
    expect(mp).toBeGreaterThan(99.5);
  });

  test('imbalance', () => {
    expect(book.imbalance()).toBeCloseTo((100 - 150) / 250);
  });

  test('walk market order — buy', () => {
    const r = book.walkMarketOrder(200);
    // 150 @ 100.5 + 50 @ 101 = 100.625
    expect(r.avgPrice).toBeCloseTo((150 * 100.5 + 50 * 101) / 200);
    expect(r.slippage).toBeGreaterThan(0);
    expect(r.filled).toBe(200);
  });
});

describe('Spread estimators', () => {
  test('effective spread positive when buys hit ask', () => {
    const trades: TradeQuote[] = [
      { price: 100.5, mid: 100, side: 1 },
      { price: 99.5, mid: 100, side: -1 },
    ];
    expect(effectiveSpread(trades)).toBeCloseTo(1.0);
  });

  test('realized spread uses future mid', () => {
    const trades: TradeQuote[] = [
      { price: 100.5, mid: 100, side: 1, midFuture: 100.3 },
    ];
    expect(realizedSpread(trades)).toBeCloseTo(2 * (100.5 - 100.3));
  });

  test('Roll spread on bid-ask bounce', () => {
    // alternating ±0.5 around 100 → strong negative autocov
    const prices = [100.5, 99.5, 100.5, 99.5, 100.5, 99.5, 100.5, 99.5];
    const s = rollSpread(prices);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(2.5);
  });

  test('Roll returns 0 on monotone series', () => {
    const prices = [100, 101, 102, 103, 104];
    expect(rollSpread(prices)).toBe(0);
  });
});

describe('Market impact', () => {
  test('square-root impact scales with sqrt(qty)', () => {
    const small = squareRootImpact({ qty: 10_000, adv: 1_000_000, sigma: 0.02 });
    const big = squareRootImpact({ qty: 40_000, adv: 1_000_000, sigma: 0.02 });
    expect(big / small).toBeCloseTo(2, 5);
  });

  test('Almgren-Chriss expected cost increases with X^2', () => {
    const a = almgrenChrissExpectedCost({ qty: 1000, T: 10, sigma: 0.02, gamma: 1e-4, eta: 1e-4 });
    const b = almgrenChrissExpectedCost({ qty: 2000, T: 10, sigma: 0.02, gamma: 1e-4, eta: 1e-4 });
    expect(b.expectedCost / a.expectedCost).toBeCloseTo(4, 5);
  });
});
