import {
  vwapSchedule,
  twapSchedule,
  povSchedule,
  implementationShortfallSchedule,
} from '../src/execution/algorithms';

describe('VWAP schedule', () => {
  test('proportional to volume profile', () => {
    const profile = [0.1, 0.2, 0.4, 0.2, 0.1];
    const sched = vwapSchedule({ totalQty: 10_000, volumeProfile: profile });
    expect(sched).toHaveLength(5);
    expect(sched[2].qty).toBeCloseTo(4000);
    expect(sched[4].cumQty).toBeCloseTo(10_000);
  });

  test('throws if profile does not sum to 1', () => {
    expect(() => vwapSchedule({ totalQty: 1, volumeProfile: [0.5, 0.4] })).toThrow();
  });
});

describe('TWAP schedule', () => {
  test('equal qty per bucket', () => {
    const sched = twapSchedule({ totalQty: 1000, buckets: 4 });
    for (const s of sched) expect(s.qty).toBeCloseTo(250);
    expect(sched[3].cumQty).toBeCloseTo(1000);
  });
});

describe('POV schedule', () => {
  test('participates at fraction of market volume', () => {
    const mv = [1000, 2000, 1500, 500];
    const sched = povSchedule({ totalQty: 500, participation: 0.1, marketVolume: mv });
    // 100 + 200 + 150 + 50 = 500
    expect(sched).toHaveLength(4);
    expect(sched[0].qty).toBeCloseTo(100);
    expect(sched[3].cumQty).toBeCloseTo(500);
  });

  test('partial last slice when fully filled early', () => {
    const mv = [10_000, 10_000, 10_000];
    const sched = povSchedule({ totalQty: 500, participation: 0.1, marketVolume: mv });
    // first slice 1000 capped to 500
    expect(sched).toHaveLength(1);
    expect(sched[0].qty).toBeCloseTo(500);
  });
});

describe('Implementation Shortfall (Almgren-Chriss)', () => {
  test('front-loads when risk aversion is high', () => {
    const high = implementationShortfallSchedule({
      totalQty: 1000,
      buckets: 10,
      sigma: 0.02,
      gamma: 0.0001,
      eta: 0.0001,
      riskAversion: 1e-3,
    });
    const low = implementationShortfallSchedule({
      totalQty: 1000,
      buckets: 10,
      sigma: 0.02,
      gamma: 0.0001,
      eta: 0.0001,
      riskAversion: 1e-9,
    });
    // first slice should be larger when risk aversion is high
    expect(high[0].qty).toBeGreaterThan(low[0].qty);
  });

  test('cumulative quantity equals total', () => {
    const sched = implementationShortfallSchedule({
      totalQty: 1000,
      buckets: 5,
      sigma: 0.02,
      gamma: 0.0001,
      eta: 0.0001,
      riskAversion: 1e-6,
    });
    expect(sched[sched.length - 1].cumQty).toBeCloseTo(1000, 4);
  });
});
