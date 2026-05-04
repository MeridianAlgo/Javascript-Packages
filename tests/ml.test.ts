import {
  LSTMCell,
  randomLSTMWeights,
  GRUCell,
  randomGRUWeights,
  walkForward,
  lagFeatures,
  rollingMean,
  rollingStd,
  logReturns,
  zScore,
  minMaxScale,
  diff,
  trainHMM,
  viterbi,
} from '../src/ml';

describe('LSTMCell', () => {
  test('produces hidden state of correct size', () => {
    const w = randomLSTMWeights(3, 4);
    const cell = new LSTMCell(w);
    const seq = [
      [0.1, 0.2, 0.3],
      [0.2, 0.1, 0.0],
      [0.3, 0.4, 0.5],
    ];
    const { h, c } = cell.forward(seq);
    expect(h).toHaveLength(4);
    expect(c).toHaveLength(4);
    for (const v of h) expect(Number.isFinite(v)).toBe(true);
  });
});

describe('GRUCell', () => {
  test('produces hidden state of correct size', () => {
    const w = randomGRUWeights(2, 3);
    const cell = new GRUCell(w);
    const seq = [[0.1, 0.2], [0.3, 0.4]];
    const h = cell.forward(seq);
    expect(h).toHaveLength(3);
  });
});

describe('Walk-forward validation', () => {
  test('expanding window: simple linear model', () => {
    const n = 100;
    const X: number[][] = [];
    const y: number[] = [];
    for (let i = 0; i < n; i++) {
      X.push([i, i * i]);
      y.push(2 * i + 0.5 * i * i);
    }
    const result = walkForward(X, y, {
      initialTrainSize: 50,
      testSize: 10,
      mode: 'expanding',
      fit: () => ({ a: 2, b: 0.5 }),
      predict: (m, testX) => testX.map((row) => m.a * row[0] + m.b * row[1]),
    });
    expect(result.folds.length).toBeGreaterThan(0);
    for (const f of result.folds) expect(f.mse).toBeCloseTo(0, 6);
  });
});

describe('Feature engineering', () => {
  test('lagFeatures', () => {
    const r = lagFeatures([1, 2, 3, 4, 5], 2);
    expect(r).toEqual([
      [2, 1],
      [3, 2],
      [4, 3],
    ]);
  });

  test('rollingMean / rollingStd', () => {
    const m = rollingMean([1, 2, 3, 4, 5], 3);
    expect(m[2]).toBeCloseTo(2);
    expect(m[4]).toBeCloseTo(4);
    const s = rollingStd([1, 2, 3, 4, 5], 3);
    expect(s[2]).toBeCloseTo(1);
  });

  test('logReturns', () => {
    const r = logReturns([100, 110]);
    expect(r[1]).toBeCloseTo(Math.log(1.1));
  });

  test('zScore mean ~0 std ~1', () => {
    const z = zScore([1, 2, 3, 4, 5]);
    const mean = z.reduce((s, v) => s + v, 0) / z.length;
    expect(mean).toBeCloseTo(0, 6);
  });

  test('minMaxScale to [0,1]', () => {
    const out = minMaxScale([10, 20, 30]);
    expect(out[0]).toBeCloseTo(0);
    expect(out[2]).toBeCloseTo(1);
  });

  test('diff', () => {
    expect(diff([10, 12, 15, 14])[3]).toBe(-1);
  });
});

describe('HMM regime detection', () => {
  test('Viterbi decodes 2-state synthetic regime', () => {
    // Generate 2-regime data: low-vol then high-vol
    const lowVol: number[] = [];
    const highVol: number[] = [];
    let s1 = 1;
    let s2 = 2;
    const rng = (st: { v: number }) => {
      st.v = (st.v * 1103515245 + 12345) & 0x7fffffff;
      return (st.v / 0x7fffffff - 0.5) * 2;
    };
    const r1 = { v: s1 };
    const r2 = { v: s2 };
    for (let i = 0; i < 100; i++) lowVol.push(rng(r1) * 0.005);
    for (let i = 0; i < 100; i++) highVol.push(rng(r2) * 0.05);
    const obs = [...lowVol, ...highVol];
    const { params } = trainHMM(obs, 2, { maxIter: 50 });
    const path = viterbi(obs, params);
    expect(path).toHaveLength(obs.length);
    // Most low-vol period should be in one state, high-vol in the other
    const earlyState = path.slice(0, 80);
    const lateState = path.slice(120);
    const earlyMode = earlyState[0];
    const lateMode = lateState[0];
    const earlyMatch = earlyState.filter((s) => s === earlyMode).length;
    const lateMatch = lateState.filter((s) => s === lateMode).length;
    expect(earlyMatch / earlyState.length).toBeGreaterThan(0.7);
    expect(lateMatch / lateState.length).toBeGreaterThan(0.7);
  });
});
