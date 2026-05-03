import { hrpAllocate } from '../src/portfolio/hrp';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('HRP allocation', () => {
  test('weights sum to 1 and are positive', () => {
    const r = rng(42);
    const T = 200;
    const N = 6;
    const returns: number[][] = [];
    for (let t = 0; t < T; t++) {
      const row: number[] = [];
      for (let i = 0; i < N; i++) row.push((r() - 0.5) * 0.04);
      returns.push(row);
    }
    const { weights } = hrpAllocate({ returns });
    expect(weights).toHaveLength(N);
    const sum = weights.reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1, 6);
    for (const w of weights) expect(w).toBeGreaterThan(0);
  });

  test('allocates more weight to lower-vol asset', () => {
    const r = rng(7);
    const T = 300;
    const returns: number[][] = [];
    for (let t = 0; t < T; t++) {
      // asset 0: vol 0.005, asset 1: vol 0.03 (independent), asset 2: vol 0.02
      returns.push([
        (r() - 0.5) * 2 * 0.005,
        (r() - 0.5) * 2 * 0.03,
        (r() - 0.5) * 2 * 0.02,
      ]);
    }
    const { weights } = hrpAllocate({ returns });
    expect(weights[0]).toBeGreaterThan(weights[1]);
    expect(weights[0]).toBeGreaterThan(weights[2]);
  });
});
