import {
  upCaptureRatio,
  downCaptureRatio,
  battingAverage,
  informationRatio,
  trackingError,
  activeShare,
} from '../src/risk/benchmark-analytics';

describe('Benchmark analytics', () => {
  const portfolio = [0.05, -0.02, 0.03, -0.01, 0.04];
  const benchmark = [0.04, -0.03, 0.02, -0.02, 0.03];

  test('up capture ratio', () => {
    const r = upCaptureRatio({ portfolio, benchmark });
    // up periods: idx 0,2,4 → port 0.12 / bench 0.09
    expect(r).toBeCloseTo((0.05 + 0.03 + 0.04) / (0.04 + 0.02 + 0.03));
  });

  test('down capture ratio', () => {
    const r = downCaptureRatio({ portfolio, benchmark });
    // down periods: idx 1,3 → port -0.03 / bench -0.05
    expect(r).toBeCloseTo((-0.02 - 0.01) / (-0.03 - 0.02));
  });

  test('batting average', () => {
    expect(battingAverage({ portfolio, benchmark })).toBe(1.0); // all 5 wins
  });

  test('information ratio finite and positive', () => {
    const ir = informationRatio({ portfolio, benchmark });
    expect(Number.isFinite(ir)).toBe(true);
    expect(ir).toBeGreaterThan(0);
  });

  test('tracking error positive', () => {
    expect(trackingError({ portfolio, benchmark })).toBeGreaterThan(0);
  });

  test('active share: identical = 0', () => {
    expect(activeShare([0.5, 0.5], [0.5, 0.5])).toBeCloseTo(0);
  });

  test('active share: 0.5 * sum |w_p - w_b|', () => {
    expect(activeShare([0.7, 0.3], [0.5, 0.5])).toBeCloseTo(0.2);
  });
});
