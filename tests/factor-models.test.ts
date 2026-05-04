import {
  capmRegression,
  famaFrench3,
} from '../src/risk/factor-models';

describe('Factor regression', () => {
  test('recovers known beta in synthetic data', () => {
    const n = 200;
    const mkt: number[] = [];
    const y: number[] = [];
    for (let i = 0; i < n; i++) {
      const m = (Math.sin(i / 7) + Math.cos(i / 3)) * 0.01;
      mkt.push(m);
      y.push(0.001 + 1.5 * m); // alpha=0.001, beta=1.5, no noise
    }
    const r = capmRegression(y, mkt);
    expect(r.alpha).toBeCloseTo(0.001, 6);
    expect(r.betas[0]).toBeCloseTo(1.5, 6);
    expect(r.rSquared).toBeCloseTo(1, 6);
  });

  test('Fama-French 3-factor recovers loadings', () => {
    const n = 300;
    const mkt: number[] = [];
    const smb: number[] = [];
    const hml: number[] = [];
    const y: number[] = [];
    for (let i = 0; i < n; i++) {
      const m = Math.sin(i / 5) * 0.02;
      const s = Math.cos(i / 11) * 0.01;
      const h = Math.sin(i / 17) * 0.015;
      mkt.push(m);
      smb.push(s);
      hml.push(h);
      y.push(1.1 * m + 0.4 * s - 0.3 * h);
    }
    const r = famaFrench3(y, mkt, smb, hml);
    expect(r.betas[0]).toBeCloseTo(1.1, 4);
    expect(r.betas[1]).toBeCloseTo(0.4, 4);
    expect(r.betas[2]).toBeCloseTo(-0.3, 4);
  });
});
