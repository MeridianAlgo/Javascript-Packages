/**
 * Streaming indicator API — incremental nextValue() / replace() for real-time use.
 *
 * Each streaming indicator buffers state internally so it can produce updated
 * values as new bars arrive without recomputing from scratch. `replace()` swaps
 * the most recent value (e.g. when a tick replaces a forming bar).
 */

export interface StreamingIndicator<TIn, TOut> {
  /** Push a new value; returns the indicator output (NaN during warmup). */
  nextValue(value: TIn): TOut;
  /** Replace the most recent value (e.g. update mid-bar). */
  replace(value: TIn): TOut;
  /** Reset internal state. */
  reset(): void;
}

/** Streaming Simple Moving Average. */
export class StreamingSMA implements StreamingIndicator<number, number> {
  private buf: number[] = [];
  private sum = 0;

  constructor(private period: number) {
    if (period <= 0) throw new Error('StreamingSMA: period must be > 0');
  }

  nextValue(x: number): number {
    this.buf.push(x);
    this.sum += x;
    if (this.buf.length > this.period) {
      const removed = this.buf.shift();
      if (removed !== undefined) this.sum -= removed;
    }
    return this.buf.length === this.period ? this.sum / this.period : NaN;
  }

  replace(x: number): number {
    if (this.buf.length === 0) return this.nextValue(x);
    const last = this.buf[this.buf.length - 1];
    this.sum += x - last;
    this.buf[this.buf.length - 1] = x;
    return this.buf.length === this.period ? this.sum / this.period : NaN;
  }

  reset(): void {
    this.buf = [];
    this.sum = 0;
  }
}

/** Streaming Exponential Moving Average. */
export class StreamingEMA implements StreamingIndicator<number, number> {
  private prev = NaN;
  private prevPrev = NaN;
  private k: number;
  private count = 0;

  constructor(private period: number) {
    if (period <= 0) throw new Error('StreamingEMA: period must be > 0');
    this.k = 2 / (period + 1);
  }

  nextValue(x: number): number {
    this.prevPrev = this.prev;
    if (Number.isNaN(this.prev)) this.prev = x;
    else this.prev = x * this.k + this.prev * (1 - this.k);
    this.count++;
    return this.prev;
  }

  replace(x: number): number {
    if (this.count === 0) return this.nextValue(x);
    if (Number.isNaN(this.prevPrev)) this.prev = x;
    else this.prev = x * this.k + this.prevPrev * (1 - this.k);
    return this.prev;
  }

  reset(): void {
    this.prev = NaN;
    this.prevPrev = NaN;
    this.count = 0;
  }
}

/** Streaming RSI (Wilder smoothing). */
export class StreamingRSI implements StreamingIndicator<number, number> {
  private prev = NaN;
  private avgU = 0;
  private avgD = 0;
  private count = 0;
  private lastSnapshot: { prev: number; avgU: number; avgD: number; count: number } | null = null;

  constructor(private period: number = 14) {
    if (period <= 0) throw new Error('StreamingRSI: period must be > 0');
  }

  private snapshot(): void {
    this.lastSnapshot = {
      prev: this.prev,
      avgU: this.avgU,
      avgD: this.avgD,
      count: this.count,
    };
  }

  nextValue(x: number): number {
    this.snapshot();
    if (Number.isNaN(this.prev)) {
      this.prev = x;
      this.count = 1;
      return NaN;
    }
    const ch = x - this.prev;
    const u = ch > 0 ? ch : 0;
    const d = ch < 0 ? -ch : 0;
    if (this.count < this.period) {
      this.avgU += u;
      this.avgD += d;
      this.count++;
      this.prev = x;
      if (this.count === this.period + 1) {
        this.avgU /= this.period;
        this.avgD /= this.period;
        return this.avgD === 0 ? 100 : 100 - 100 / (1 + this.avgU / this.avgD);
      }
      return NaN;
    }
    this.avgU = (this.avgU * (this.period - 1) + u) / this.period;
    this.avgD = (this.avgD * (this.period - 1) + d) / this.period;
    this.prev = x;
    this.count++;
    return this.avgD === 0 ? 100 : 100 - 100 / (1 + this.avgU / this.avgD);
  }

  replace(x: number): number {
    if (this.lastSnapshot === null) return this.nextValue(x);
    this.prev = this.lastSnapshot.prev;
    this.avgU = this.lastSnapshot.avgU;
    this.avgD = this.lastSnapshot.avgD;
    this.count = this.lastSnapshot.count;
    return this.nextValue(x);
  }

  reset(): void {
    this.prev = NaN;
    this.avgU = 0;
    this.avgD = 0;
    this.count = 0;
    this.lastSnapshot = null;
  }
}

/** Streaming MACD: returns { macd, signal, histogram }. */
export class StreamingMACD
  implements StreamingIndicator<number, { macd: number; signal: number; histogram: number }>
{
  private fastEma: StreamingEMA;
  private slowEma: StreamingEMA;
  private signalEma: StreamingEMA;

  constructor(fast = 12, slow = 26, signal = 9) {
    this.fastEma = new StreamingEMA(fast);
    this.slowEma = new StreamingEMA(slow);
    this.signalEma = new StreamingEMA(signal);
  }

  nextValue(x: number): { macd: number; signal: number; histogram: number } {
    const f = this.fastEma.nextValue(x);
    const s = this.slowEma.nextValue(x);
    const macd = f - s;
    const signal = this.signalEma.nextValue(macd);
    return { macd, signal, histogram: macd - signal };
  }

  replace(x: number): { macd: number; signal: number; histogram: number } {
    const f = this.fastEma.replace(x);
    const s = this.slowEma.replace(x);
    const macd = f - s;
    const signal = this.signalEma.replace(macd);
    return { macd, signal, histogram: macd - signal };
  }

  reset(): void {
    this.fastEma.reset();
    this.slowEma.reset();
    this.signalEma.reset();
  }
}

/** Streaming Bollinger Bands. */
export class StreamingBollinger
  implements StreamingIndicator<number, { upper: number; middle: number; lower: number }>
{
  private buf: number[] = [];

  constructor(private period = 20, private k = 2) {}

  nextValue(x: number): { upper: number; middle: number; lower: number } {
    this.buf.push(x);
    if (this.buf.length > this.period) this.buf.shift();
    if (this.buf.length < this.period) return { upper: NaN, middle: NaN, lower: NaN };
    return this.compute();
  }

  replace(x: number): { upper: number; middle: number; lower: number } {
    if (this.buf.length === 0) return this.nextValue(x);
    this.buf[this.buf.length - 1] = x;
    if (this.buf.length < this.period) return { upper: NaN, middle: NaN, lower: NaN };
    return this.compute();
  }

  private compute(): { upper: number; middle: number; lower: number } {
    const mean = this.buf.reduce((s, v) => s + v, 0) / this.period;
    let v = 0;
    for (const b of this.buf) v += (b - mean) ** 2;
    const sd = Math.sqrt(v / this.period);
    return { upper: mean + this.k * sd, middle: mean, lower: mean - this.k * sd };
  }

  reset(): void {
    this.buf = [];
  }
}
