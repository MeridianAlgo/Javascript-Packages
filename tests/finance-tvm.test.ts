import {
  fv,
  pv,
  pmt,
  nper,
  ipmt,
  ppmt,
  rate,
  npv,
  irr,
  mirr,
  cagr,
  compoundInterest,
  discountFactor,
  amortizationSchedule,
} from '../src/finance/tvm';

const close = (a: number, b: number, eps = 1e-4) => Math.abs(a - b) < eps;

describe('TVM', () => {
  test('fv basic — Excel parity', () => {
    // FV(5%/12, 12*10, -100, -100, 0) ≈ 15692.93
    expect(close(fv(0.05 / 12, 120, -100, -100), 15692.9289, 1e-2)).toBe(true);
  });

  test('pv basic — Excel parity', () => {
    // PV(0.05/12, 120, -100, 0, 0) ≈ 9428.135
    expect(close(pv(0.05 / 12, 120, -100, 0), 9428.1351, 1e-2)).toBe(true);
  });

  test('pmt — 30-year mortgage', () => {
    // PMT(0.06/12, 360, 200000) ≈ -1199.10
    expect(close(pmt(0.06 / 12, 360, 200000), -1199.1011, 1e-2)).toBe(true);
  });

  test('nper round-trip', () => {
    const r = 0.05 / 12;
    const p = pmt(r, 360, 200000);
    expect(close(nper(r, p, 200000), 360, 1e-3)).toBe(true);
  });

  test('ipmt + ppmt = pmt', () => {
    const r = 0.05 / 12;
    const n = 360;
    const principal = 200000;
    const p = pmt(r, n, principal);
    for (let per = 1; per <= 5; per++) {
      const ip = ipmt(r, per, n, principal);
      const pp = ppmt(r, per, n, principal);
      expect(close(ip + pp, p, 1e-6)).toBe(true);
    }
  });

  test('rate solves to known answer', () => {
    // pmt(0.05/12, 360, 200000) ≈ -1073.64
    const p = -1073.6432765862;
    const solved = rate(360, p, 200000);
    expect(close(solved, 0.05 / 12, 1e-6)).toBe(true);
  });

  test('npv basic', () => {
    // NPV with cf at t=0 included
    const cf = [-1000, 300, 400, 500, 600];
    const result = npv(0.1, cf);
    // NPV = -1000 + 300/1.1 + 400/1.21 + 500/1.331 + 600/1.4641 ≈ 388.77
    expect(close(result, 388.77, 0.1)).toBe(true);
  });

  test('irr classic', () => {
    const cf = [-1000, 300, 400, 500, 600];
    const r = irr(cf);
    expect(close(npv(r, cf), 0, 1e-6)).toBe(true);
  });

  test('mirr', () => {
    const cf = [-1000, 300, 400, 500, 600];
    const r = mirr(cf, 0.1, 0.12);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThan(0.5);
  });

  test('cagr', () => {
    expect(close(cagr(1000, 2000, 7), 0.10408951, 1e-6)).toBe(true);
  });

  test('compoundInterest', () => {
    expect(close(compoundInterest(1000, 0.05, 10), 1628.8946, 1e-3)).toBe(true);
  });

  test('discountFactor', () => {
    expect(close(discountFactor(0.05, 10), 1 / Math.pow(1.05, 10), 1e-12)).toBe(true);
  });

  test('amortization schedule sums to principal', () => {
    const sch = amortizationSchedule(200000, 0.06 / 12, 360);
    expect(sch.length).toBe(360);
    const totalPrincipal = sch.reduce((s, r) => s + r.principal, 0);
    expect(close(totalPrincipal, 200000, 0.5)).toBe(true);
    expect(close(sch[sch.length - 1].balance, 0, 0.5)).toBe(true);
  });

  test('irr throws when no sign change', () => {
    expect(() => irr([100, 200, 300])).toThrow();
  });
});
