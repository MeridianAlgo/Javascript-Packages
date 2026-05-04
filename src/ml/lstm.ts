/**
 * Pure-JS LSTM cell + sequence wrapper.
 *
 * Implementation note: this is a forward-pass-only inference layer with random
 * (or user-supplied) weights. Training is not included; for training, use a
 * dedicated framework (TFJS, ONNX runtime). The intent is to support
 * lightweight loading of pre-trained weights for forecasting.
 */

export interface LSTMWeights {
  /** input-to-hidden: shape [4*hiddenSize, inputSize]. Order: [i, f, g, o]. */
  Wi: number[][];
  /** hidden-to-hidden: shape [4*hiddenSize, hiddenSize]. */
  Wh: number[][];
  /** bias: shape [4*hiddenSize]. */
  b: number[];
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

export class LSTMCell {
  readonly hiddenSize: number;
  readonly inputSize: number;

  constructor(public readonly weights: LSTMWeights) {
    const fourH = weights.b.length;
    if (fourH % 4 !== 0) throw new Error('LSTMCell: bias length must be multiple of 4');
    this.hiddenSize = fourH / 4;
    this.inputSize = weights.Wi[0].length;
    if (weights.Wi.length !== fourH) throw new Error('LSTMCell: Wi rows must equal 4*hidden');
    if (weights.Wh.length !== fourH) throw new Error('LSTMCell: Wh rows must equal 4*hidden');
    if (weights.Wh[0].length !== this.hiddenSize) {
      throw new Error('LSTMCell: Wh cols must equal hiddenSize');
    }
  }

  /** Forward step: returns new (h, c). */
  step(x: readonly number[], h: readonly number[], c: readonly number[]): { h: number[]; c: number[] } {
    const H = this.hiddenSize;
    const gates = matVec(this.weights.Wi, x);
    const gatesH = matVec(this.weights.Wh, h);
    for (let i = 0; i < gates.length; i++) gates[i] += gatesH[i] + this.weights.b[i];
    const iG: number[] = new Array(H);
    const fG: number[] = new Array(H);
    const gG: number[] = new Array(H);
    const oG: number[] = new Array(H);
    for (let k = 0; k < H; k++) {
      iG[k] = sigmoid(gates[k]);
      fG[k] = sigmoid(gates[k + H]);
      gG[k] = tanh(gates[k + 2 * H]);
      oG[k] = sigmoid(gates[k + 3 * H]);
    }
    const cNew: number[] = new Array(H);
    const hNew: number[] = new Array(H);
    for (let k = 0; k < H; k++) {
      cNew[k] = fG[k] * c[k] + iG[k] * gG[k];
      hNew[k] = oG[k] * tanh(cNew[k]);
    }
    return { h: hNew, c: cNew };
  }

  /** Run on a sequence; returns final hidden state. */
  forward(sequence: readonly (readonly number[])[]): { h: number[]; c: number[] } {
    let h = new Array(this.hiddenSize).fill(0);
    let c = new Array(this.hiddenSize).fill(0);
    for (const x of sequence) {
      const next = this.step(x, h, c);
      h = next.h;
      c = next.c;
    }
    return { h, c };
  }
}

/** Initialize LSTM weights with small random values (for testing / cold-start inference). */
export function randomLSTMWeights(inputSize: number, hiddenSize: number, scale = 0.1, seed = 1): LSTMWeights {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0x100000000 - 0.5) * 2;
  };
  const fourH = 4 * hiddenSize;
  const Wi: number[][] = Array.from({ length: fourH }, () =>
    Array.from({ length: inputSize }, () => rng() * scale),
  );
  const Wh: number[][] = Array.from({ length: fourH }, () =>
    Array.from({ length: hiddenSize }, () => rng() * scale),
  );
  const b = new Array(fourH).fill(0);
  return { Wi, Wh, b };
}
