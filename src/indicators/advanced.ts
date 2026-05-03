/**
 * Advanced technical indicators: Ichimoku, Supertrend, Donchian, Keltner, Aroon,
 * Choppiness, ConnorsRSI, Mass Index, Fisher Transform, Coppock, DPO, Elder Ray, Pivot Points.
 */

export interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

const sma = (xs: readonly number[], n: number): number[] => {
  const out: number[] = new Array(xs.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    sum += xs[i];
    if (i >= n) sum -= xs[i - n];
    if (i >= n - 1) out[i] = sum / n;
  }
  return out;
};

const ema = (xs: readonly number[], n: number): number[] => {
  const out: number[] = new Array(xs.length).fill(NaN);
  if (xs.length === 0) return out;
  const k = 2 / (n + 1);
  out[0] = xs[0];
  for (let i = 1; i < xs.length; i++) out[i] = xs[i] * k + out[i - 1] * (1 - k);
  return out;
};

const rollingMax = (xs: readonly number[], n: number): number[] => {
  const out: number[] = new Array(xs.length).fill(NaN);
  for (let i = n - 1; i < xs.length; i++) {
    let m = -Infinity;
    for (let j = i - n + 1; j <= i; j++) m = Math.max(m, xs[j]);
    out[i] = m;
  }
  return out;
};
const rollingMin = (xs: readonly number[], n: number): number[] => {
  const out: number[] = new Array(xs.length).fill(NaN);
  for (let i = n - 1; i < xs.length; i++) {
    let m = Infinity;
    for (let j = i - n + 1; j <= i; j++) m = Math.min(m, xs[j]);
    out[i] = m;
  }
  return out;
};

const trueRange = (candles: readonly OHLC[]): number[] => {
  const tr: number[] = new Array(candles.length).fill(NaN);
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      tr[i] = candles[i].high - candles[i].low;
    } else {
      const prev = candles[i - 1].close;
      tr[i] = Math.max(
        candles[i].high - candles[i].low,
        Math.abs(candles[i].high - prev),
        Math.abs(candles[i].low - prev),
      );
    }
  }
  return tr;
};

const atr = (candles: readonly OHLC[], n: number): number[] => {
  const tr = trueRange(candles);
  // Wilder smoothing
  const out: number[] = new Array(candles.length).fill(NaN);
  if (candles.length < n) return out;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += tr[i];
  out[n - 1] = sum / n;
  for (let i = n; i < candles.length; i++) {
    out[i] = (out[i - 1] * (n - 1) + tr[i]) / n;
  }
  return out;
};

// ─── Ichimoku ──────────────────────────────────────────────────────────────

export interface IchimokuResult {
  conversion: number[]; // Tenkan-sen
  base: number[];       // Kijun-sen
  spanA: number[];      // Senkou Span A
  spanB: number[];      // Senkou Span B
  lagging: number[];    // Chikou Span
}

export function ichimoku(
  candles: readonly OHLC[],
  conversionPeriod = 9,
  basePeriod = 26,
  spanBPeriod = 52,
  displacement = 26,
): IchimokuResult {
  const high = candles.map((c) => c.high);
  const low = candles.map((c) => c.low);
  const conv: number[] = new Array(candles.length).fill(NaN);
  const base: number[] = new Array(candles.length).fill(NaN);
  const hMaxConv = rollingMax(high, conversionPeriod);
  const lMinConv = rollingMin(low, conversionPeriod);
  const hMaxBase = rollingMax(high, basePeriod);
  const lMinBase = rollingMin(low, basePeriod);
  const hMaxSpanB = rollingMax(high, spanBPeriod);
  const lMinSpanB = rollingMin(low, spanBPeriod);
  for (let i = 0; i < candles.length; i++) {
    if (!Number.isNaN(hMaxConv[i])) conv[i] = (hMaxConv[i] + lMinConv[i]) / 2;
    if (!Number.isNaN(hMaxBase[i])) base[i] = (hMaxBase[i] + lMinBase[i]) / 2;
  }
  // SpanA (shifted forward by displacement): (conv + base) / 2
  const spanA: number[] = new Array(candles.length).fill(NaN);
  const spanB: number[] = new Array(candles.length).fill(NaN);
  for (let i = 0; i < candles.length; i++) {
    const tgt = i + displacement;
    if (tgt < candles.length && !Number.isNaN(conv[i]) && !Number.isNaN(base[i])) {
      spanA[tgt] = (conv[i] + base[i]) / 2;
    }
    if (tgt < candles.length && !Number.isNaN(hMaxSpanB[i])) {
      spanB[tgt] = (hMaxSpanB[i] + lMinSpanB[i]) / 2;
    }
  }
  // Chikou: close shifted backward by displacement
  const lagging: number[] = new Array(candles.length).fill(NaN);
  for (let i = 0; i < candles.length; i++) {
    const tgt = i - displacement;
    if (tgt >= 0) lagging[tgt] = candles[i].close;
  }
  return { conversion: conv, base, spanA, spanB, lagging };
}

// ─── Supertrend ────────────────────────────────────────────────────────────

export interface SupertrendResult {
  value: number[];
  /** +1 = uptrend, -1 = downtrend. */
  direction: number[];
}

export function supertrend(candles: readonly OHLC[], period = 10, multiplier = 3): SupertrendResult {
  const a = atr(candles, period);
  const value: number[] = new Array(candles.length).fill(NaN);
  const direction: number[] = new Array(candles.length).fill(0);
  let upperBand = NaN;
  let lowerBand = NaN;
  let trend = 1;
  for (let i = 0; i < candles.length; i++) {
    if (Number.isNaN(a[i])) continue;
    const hl2 = (candles[i].high + candles[i].low) / 2;
    const upper = hl2 + multiplier * a[i];
    const lower = hl2 - multiplier * a[i];
    if (i === 0 || Number.isNaN(upperBand)) {
      upperBand = upper;
      lowerBand = lower;
    } else {
      upperBand =
        upper < upperBand || candles[i - 1].close > upperBand ? upper : upperBand;
      lowerBand =
        lower > lowerBand || candles[i - 1].close < lowerBand ? lower : lowerBand;
    }
    if (trend === 1 && candles[i].close < lowerBand) trend = -1;
    else if (trend === -1 && candles[i].close > upperBand) trend = 1;
    direction[i] = trend;
    value[i] = trend === 1 ? lowerBand : upperBand;
  }
  return { value, direction };
}

// ─── Donchian ──────────────────────────────────────────────────────────────

export interface DonchianResult {
  upper: number[];
  middle: number[];
  lower: number[];
}

export function donchianChannels(candles: readonly OHLC[], period = 20): DonchianResult {
  const upper = rollingMax(candles.map((c) => c.high), period);
  const lower = rollingMin(candles.map((c) => c.low), period);
  const middle = upper.map((u, i) => (u + lower[i]) / 2);
  return { upper, middle, lower };
}

// ─── Keltner ───────────────────────────────────────────────────────────────

export function keltnerChannels(
  candles: readonly OHLC[],
  period = 20,
  multiplier = 2,
): DonchianResult {
  const closes = candles.map((c) => c.close);
  const e = ema(closes, period);
  const a = atr(candles, period);
  const upper = e.map((m, i) => m + multiplier * a[i]);
  const lower = e.map((m, i) => m - multiplier * a[i]);
  return { upper, middle: e, lower };
}

// ─── Aroon ─────────────────────────────────────────────────────────────────

export function aroon(candles: readonly OHLC[], period = 25): { up: number[]; down: number[] } {
  const up: number[] = new Array(candles.length).fill(NaN);
  const down: number[] = new Array(candles.length).fill(NaN);
  for (let i = period; i < candles.length; i++) {
    let maxIdx = i - period;
    let minIdx = i - period;
    for (let j = i - period; j <= i; j++) {
      if (candles[j].high > candles[maxIdx].high) maxIdx = j;
      if (candles[j].low < candles[minIdx].low) minIdx = j;
    }
    up[i] = (100 * (period - (i - maxIdx))) / period;
    down[i] = (100 * (period - (i - minIdx))) / period;
  }
  return { up, down };
}

// ─── Choppiness Index ──────────────────────────────────────────────────────

export function choppinessIndex(candles: readonly OHLC[], period = 14): number[] {
  const tr = trueRange(candles);
  const out: number[] = new Array(candles.length).fill(NaN);
  for (let i = period - 1; i < candles.length; i++) {
    let sumTR = 0;
    let h = -Infinity;
    let l = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      sumTR += tr[j];
      h = Math.max(h, candles[j].high);
      l = Math.min(l, candles[j].low);
    }
    const range = h - l;
    if (range > 0 && sumTR > 0) {
      out[i] = (100 * Math.log10(sumTR / range)) / Math.log10(period);
    }
  }
  return out;
}

// ─── ConnorsRSI ────────────────────────────────────────────────────────────

const wilderRsi = (xs: readonly number[], n: number): number[] => {
  const out: number[] = new Array(xs.length).fill(NaN);
  if (xs.length <= n) return out;
  let avgU = 0;
  let avgD = 0;
  for (let i = 1; i <= n; i++) {
    const ch = xs[i] - xs[i - 1];
    if (ch > 0) avgU += ch;
    else avgD -= ch;
  }
  avgU /= n;
  avgD /= n;
  out[n] = avgD === 0 ? 100 : 100 - 100 / (1 + avgU / avgD);
  for (let i = n + 1; i < xs.length; i++) {
    const ch = xs[i] - xs[i - 1];
    const u = ch > 0 ? ch : 0;
    const d = ch < 0 ? -ch : 0;
    avgU = (avgU * (n - 1) + u) / n;
    avgD = (avgD * (n - 1) + d) / n;
    out[i] = avgD === 0 ? 100 : 100 - 100 / (1 + avgU / avgD);
  }
  return out;
};

const streak = (xs: readonly number[]): number[] => {
  const out: number[] = new Array(xs.length).fill(0);
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] > xs[i - 1]) out[i] = Math.max(1, out[i - 1] + 1);
    else if (xs[i] < xs[i - 1]) out[i] = Math.min(-1, out[i - 1] - 1);
    else out[i] = 0;
  }
  return out;
};

const percentRank = (xs: readonly number[], n: number): number[] => {
  const out: number[] = new Array(xs.length).fill(NaN);
  for (let i = n; i < xs.length; i++) {
    let count = 0;
    for (let j = i - n; j < i; j++) {
      if (xs[j] < xs[i]) count++;
    }
    out[i] = (100 * count) / n;
  }
  return out;
};

/** Connors RSI = avg(RSI(close,3), RSI(streak,2), percentRank(returns, 100)). */
export function connorsRSI(closes: readonly number[]): number[] {
  const r3 = wilderRsi(closes, 3);
  const s = streak(closes);
  const r2s = wilderRsi(s, 2);
  const rets: number[] = new Array(closes.length).fill(0);
  for (let i = 1; i < closes.length; i++) rets[i] = (closes[i] - closes[i - 1]) / closes[i - 1];
  const pr = percentRank(rets, 100);
  return closes.map((_, i) => {
    if (Number.isNaN(r3[i]) || Number.isNaN(r2s[i]) || Number.isNaN(pr[i])) return NaN;
    return (r3[i] + r2s[i] + pr[i]) / 3;
  });
}

// ─── Mass Index ────────────────────────────────────────────────────────────

export function massIndex(candles: readonly OHLC[], period = 25): number[] {
  const range = candles.map((c) => c.high - c.low);
  const e1 = ema(range, 9);
  const e2 = ema(e1, 9);
  const ratio = e1.map((v, i) => (e2[i] === 0 ? NaN : v / e2[i]));
  const out: number[] = new Array(candles.length).fill(NaN);
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    let valid = true;
    for (let j = i - period + 1; j <= i; j++) {
      if (Number.isNaN(ratio[j])) {
        valid = false;
        break;
      }
      sum += ratio[j];
    }
    if (valid) out[i] = sum;
  }
  return out;
}

// ─── Fisher Transform ──────────────────────────────────────────────────────

export function fisherTransform(candles: readonly OHLC[], period = 10): number[] {
  const high = candles.map((c) => c.high);
  const low = candles.map((c) => c.low);
  const out: number[] = new Array(candles.length).fill(NaN);
  let value = 0;
  let fish = 0;
  for (let i = period - 1; i < candles.length; i++) {
    let h = -Infinity;
    let l = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      h = Math.max(h, high[j]);
      l = Math.min(l, low[j]);
    }
    const price = (high[i] + low[i]) / 2;
    const denom = Math.max(h - l, 1e-9);
    const x = ((price - l) / denom - 0.5) * 2;
    value = 0.66 * Math.max(Math.min(x, 0.999), -0.999) + 0.67 * value;
    const vClamped = Math.max(Math.min(value, 0.999), -0.999);
    fish = 0.5 * Math.log((1 + vClamped) / (1 - vClamped)) + 0.5 * fish;
    out[i] = fish;
  }
  return out;
}

// ─── Coppock ───────────────────────────────────────────────────────────────

export function coppockCurve(closes: readonly number[], roc1 = 14, roc2 = 11, wma = 10): number[] {
  const r1: number[] = closes.map((c, i) => (i >= roc1 ? ((c - closes[i - roc1]) / closes[i - roc1]) * 100 : NaN));
  const r2: number[] = closes.map((c, i) => (i >= roc2 ? ((c - closes[i - roc2]) / closes[i - roc2]) * 100 : NaN));
  const sum: number[] = closes.map((_, i) => (Number.isNaN(r1[i]) || Number.isNaN(r2[i]) ? NaN : r1[i] + r2[i]));
  // weighted moving average
  const out: number[] = new Array(closes.length).fill(NaN);
  const denom = (wma * (wma + 1)) / 2;
  for (let i = wma - 1; i < closes.length; i++) {
    let s = 0;
    let valid = true;
    for (let j = 0; j < wma; j++) {
      const v = sum[i - j];
      if (Number.isNaN(v)) {
        valid = false;
        break;
      }
      s += v * (wma - j);
    }
    if (valid) out[i] = s / denom;
  }
  return out;
}

// ─── DPO (Detrended Price Oscillator) ─────────────────────────────────────

export function dpo(closes: readonly number[], period = 20): number[] {
  const m = sma(closes, period);
  const shift = Math.floor(period / 2 + 1);
  return closes.map((c, i) => {
    const lookback = i - shift;
    if (lookback < 0 || Number.isNaN(m[lookback])) return NaN;
    return c - m[lookback];
  });
}

// ─── Elder Ray ─────────────────────────────────────────────────────────────

export function elderRay(candles: readonly OHLC[], period = 13): { bullPower: number[]; bearPower: number[] } {
  const closes = candles.map((c) => c.close);
  const e = ema(closes, period);
  return {
    bullPower: candles.map((c, i) => c.high - e[i]),
    bearPower: candles.map((c, i) => c.low - e[i]),
  };
}

// ─── Pivot Points (classic) ────────────────────────────────────────────────

export interface PivotLevels {
  pivot: number;
  r1: number; r2: number; r3: number;
  s1: number; s2: number; s3: number;
}

/** Classic floor pivots from prior period H/L/C. */
export function pivotPoints(prevHigh: number, prevLow: number, prevClose: number): PivotLevels {
  const p = (prevHigh + prevLow + prevClose) / 3;
  const r1 = 2 * p - prevLow;
  const s1 = 2 * p - prevHigh;
  const r2 = p + (prevHigh - prevLow);
  const s2 = p - (prevHigh - prevLow);
  const r3 = prevHigh + 2 * (p - prevLow);
  const s3 = prevLow - 2 * (prevHigh - p);
  return { pivot: p, r1, r2, r3, s1, s2, s3 };
}
