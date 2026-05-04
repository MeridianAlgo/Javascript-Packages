/**
 * Pure-JS GRU cell — forward-pass inference only.
 */

export interface GRUWeights {
  /** input-to-hidden: shape [3*hiddenSize, inputSize]. Order: [r, z, n]. */
  Wi: number[][];
  /** hidden-to-hidden: shape [3*hiddenSize, hiddenSize]. */
  Wh: number[][];
  /** input bias: shape [3*hiddenSize]. */
  bi: number[];
  /** hidden bias: shape [3*hiddenSize]. */
  bh: number[];
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const tanh = Math.tanh;

function matVec(M: readonly (readonly number[])[], v: readonly number[]): number[] {
  const out = new Array(M.length).fill(0);
  for (let i = 0; i < M.length; i++) {
    let s = 0;
    const row = M[i];
    for (let j = 0; j < v.length; j++) s += row[j] * v[j];
    out[i] = s;
  }
  return out;
}

export class GRUCell {
  readonly hiddenSize: number;
  readonly inputSize: number;

  constructor(public readonly weights: GRUWeights) {
    const threeH = weights.bi.length;
    if (threeH % 3 !== 0) throw new Error('GRUCell: bias length must be multiple of 3');
    this.hiddenSize = threeH / 3;
    this.inputSize = weights.Wi[0].length;
  }

  step(x: readonly number[], h: readonly number[]): number[] {
    const H = this.hiddenSize;
    const xi = matVec(this.weights.Wi, x);
    const hi = matVec(this.weights.Wh, h);
    const r: number[] = new Array(H);
    const z: number[] = new Array(H);
    const n: number[] = new Array(H);
    for (let k = 0; k < H; k++) {
      r[k] = sigmoid(xi[k] + this.weights.bi[k] + hi[k] + this.weights.bh[k]);
      z[k] = sigmoid(xi[k + H] + this.weights.bi[k + H] + hi[k + H] + this.weights.bh[k + H]);
      n[k] = tanh(xi[k + 2 * H] + this.weights.bi[k + 2 * H] + r[k] * (hi[k + 2 * H] + this.weights.bh[k + 2 * H]));
    }
    const out: number[] = new Array(H);
    for (let k = 0; k < H; k++) out[k] = (1 - z[k]) * n[k] + z[k] * h[k];
    return out;
  }

  forward(sequence: readonly (readonly number[])[]): number[] {
    let h = new Array(this.hiddenSize).fill(0);
    for (const x of sequence) h = this.step(x, h);
    return h;
  }
}

export function randomGRUWeights(inputSize: number, hiddenSize: number, scale = 0.1, seed = 1): GRUWeights {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0x100000000 - 0.5) * 2;
  };
  const threeH = 3 * hiddenSize;
  const Wi: number[][] = Array.from({ length: threeH }, () =>
    Array.from({ length: inputSize }, () => rng() * scale),
  );
  const Wh: number[][] = Array.from({ length: threeH }, () =>
    Array.from({ length: hiddenSize }, () => rng() * scale),
  );
  return { Wi, Wh, bi: new Array(threeH).fill(0), bh: new Array(threeH).fill(0) };
}
