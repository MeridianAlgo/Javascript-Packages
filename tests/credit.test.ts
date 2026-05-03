import { mertonStructural, impliedAssetVol } from '../src/credit/merton-structural';
import {
  survivalProbability,
  priceCDS,
  bootstrapHazardCurve,
} from '../src/credit/cds';
import { zSpread } from '../src/credit/zspread';
import {
  expectedLoss,
  portfolioExpectedLoss,
  impliedCreditSpread,
  pdFromSpread,
} from '../src/credit/expected-loss';

const close = (a: number, b: number, eps: number) => Math.abs(a - b) < eps;

describe('Merton structural model', () => {
  test('healthy firm has small PD', () => {
    const r = mertonStructural({ V: 100, D: 50, T: 1, r: 0.05, sigmaV: 0.2 });
    expect(r.defaultProb).toBeLessThan(0.01);
    expect(r.equityValue).toBeGreaterThan(50);
  });

  test('distressed firm has high PD', () => {
    const r = mertonStructural({ V: 60, D: 100, T: 1, r: 0.05, sigmaV: 0.4 });
    expect(r.defaultProb).toBeGreaterThan(0.3);
  });

  test('implied asset vol round-trip', () => {
    const params = { V: 100, D: 80, T: 1, r: 0.05, sigmaV: 0.3 };
    const obs = mertonStructural(params).equityValue;
    const sigma = impliedAssetVol(obs, 100, 80, 1, 0.05);
    expect(close(sigma, 0.3, 1e-5)).toBe(true);
  });
});

describe('CDS', () => {
  test('survival decreases with time', () => {
    const curve = [
      { endTime: 1, lambda: 0.02 },
      { endTime: 5, lambda: 0.03 },
    ];
    expect(survivalProbability(curve, 0)).toBe(1);
    expect(survivalProbability(curve, 1)).toBeLessThan(1);
    expect(survivalProbability(curve, 5)).toBeLessThan(survivalProbability(curve, 1));
  });

  test('fair spread = lambda * (1 - R) approximation for flat curve', () => {
    // For low PD and flat hazard lambda, fair spread ≈ lambda * (1 - R)
    const lambda = 0.02;
    const R = 0.4;
    const dcf = 0.25;
    const paymentTimes = [0.25, 0.5, 0.75, 1];
    const dayCountFractions = [dcf, dcf, dcf, dcf];
    const r = 0.03;
    const result = priceCDS({
      schedule: { paymentTimes, dayCountFractions },
      recoveryRate: R,
      spread: 0,
      hazardCurve: [{ endTime: 1, lambda }],
      discountFactor: (t: number) => Math.exp(-r * t),
    });
    expect(close(result.fairSpread, lambda * (1 - R), 0.005)).toBe(true);
  });

  test('hazard bootstrap recovers flat curve', () => {
    const dcf = 0.25;
    const r = 0.03;
    const df = (t: number): number => Math.exp(-r * t);
    const trueLambda = 0.025;

    const buildSchedule = (maturity: number) => {
      const times: number[] = [];
      const dcfs: number[] = [];
      for (let t = 0.25; t <= maturity + 1e-9; t += 0.25) {
        times.push(t);
        dcfs.push(dcf);
      }
      return { paymentTimes: times, dayCountFractions: dcfs };
    };

    const flatSpread = (mat: number): number => {
      const sched = buildSchedule(mat);
      return priceCDS({
        schedule: sched,
        recoveryRate: 0.4,
        spread: 0,
        hazardCurve: [{ endTime: mat, lambda: trueLambda }],
        discountFactor: df,
      }).fairSpread;
    };

    const quotes = [1, 3, 5].map((mat) => ({
      maturity: mat,
      spread: flatSpread(mat),
      recoveryRate: 0.4,
      schedule: buildSchedule(mat),
    }));
    const curve = bootstrapHazardCurve(quotes, df);
    curve.forEach((seg) => expect(close(seg.lambda, trueLambda, 5e-3)).toBe(true));
  });
});

describe('Z-spread', () => {
  test('zero spread when curve already prices at par', () => {
    const cf = [
      { time: 0.5, amount: 25 },
      { time: 1.0, amount: 25 },
      { time: 1.5, amount: 25 },
      { time: 2.0, amount: 1025 },
    ];
    const flatRate = 0.05;
    const curve = (_t: number): number => flatRate;
    const price = cf.reduce((s, c) => s + c.amount * Math.exp(-flatRate * c.time), 0);
    const z = zSpread(cf, curve, price);
    expect(close(z, 0, 1e-6)).toBe(true);
  });

  test('positive z-spread when bond cheap', () => {
    const cf = [
      { time: 0.5, amount: 25 },
      { time: 1.0, amount: 25 },
      { time: 1.5, amount: 25 },
      { time: 2.0, amount: 1025 },
    ];
    const curve = (_t: number): number => 0.05;
    const par = cf.reduce((s, c) => s + c.amount * Math.exp(-0.05 * c.time), 0);
    const z = zSpread(cf, curve, par - 20);
    expect(z).toBeGreaterThan(0);
  });
});

describe('Expected loss', () => {
  test('basic EL = PD * LGD * EAD', () => {
    expect(expectedLoss({ pd: 0.05, lgd: 0.4, ead: 1_000_000 })).toBeCloseTo(20_000, 5);
  });

  test('portfolio EL sums', () => {
    const ex = [
      { pd: 0.05, lgd: 0.4, ead: 1_000_000 },
      { pd: 0.02, lgd: 0.5, ead: 2_000_000 },
    ];
    expect(portfolioExpectedLoss(ex)).toBeCloseTo(40_000, 5);
  });

  test('PD/spread round-trip', () => {
    const pd = 0.05;
    const lgd = 0.6;
    const T = 1;
    const s = impliedCreditSpread(pd, lgd, T);
    const back = pdFromSpread(s, lgd, T);
    expect(close(back, pd, 1e-10)).toBe(true);
  });
});
