import { cppiStrategy, tippStrategy } from '../src/risk/cppi';

describe('CPPI', () => {
  test('floor stays constant', () => {
    const path = cppiStrategy({
      initialValue: 100,
      floorFraction: 0.8,
      multiplier: 4,
      riskyReturns: [0.05, -0.03, 0.04, 0.02],
    });
    for (const f of path.floor) expect(f).toBeCloseTo(80);
    expect(path.value[0]).toBe(100);
  });

  test('protects floor in down market', () => {
    const path = cppiStrategy({
      initialValue: 100,
      floorFraction: 0.9,
      multiplier: 3,
      riskyReturns: [-0.10, -0.15, -0.20, -0.25],
    });
    // CPPI shouldn't go below floor by much (with no leverage > 1)
    for (const v of path.value) expect(v).toBeGreaterThan(80);
  });
});

describe('TIPP', () => {
  test('floor ratchets up', () => {
    const path = tippStrategy({
      initialValue: 100,
      floorFraction: 0.8,
      multiplier: 3,
      riskyReturns: [0.10, 0.05, 0.05, -0.02],
    });
    // floor should be non-decreasing
    for (let i = 1; i < path.floor.length; i++) {
      expect(path.floor[i]).toBeGreaterThanOrEqual(path.floor[i - 1] - 1e-10);
    }
  });
});
