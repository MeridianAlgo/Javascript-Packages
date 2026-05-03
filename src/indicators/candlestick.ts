/**
 * Candlestick pattern detection.
 *
 * Each detector returns an array same length as input where each element is
 * +1 (bullish signal), -1 (bearish signal), or 0 (no pattern).
 *
 * Conventions:
 *   - body = |close - open|
 *   - upperShadow = high - max(open, close)
 *   - lowerShadow = min(open, close) - low
 *   - bullish bar: close > open; bearish: close < open
 */

export interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

const body = (c: OHLC) => Math.abs(c.close - c.open);
const upperShadow = (c: OHLC) => c.high - Math.max(c.open, c.close);
const lowerShadow = (c: OHLC) => Math.min(c.open, c.close) - c.low;
const range = (c: OHLC) => c.high - c.low;
const isBull = (c: OHLC) => c.close > c.open;
const isBear = (c: OHLC) => c.close < c.open;

/** Doji: body is tiny relative to range (default ≤ 10%). */
export function detectDoji(candles: readonly OHLC[], threshold = 0.1): number[] {
  return candles.map((c) => {
    const r = range(c);
    if (r === 0) return 0;
    return body(c) / r <= threshold ? 1 : 0;
  });
}

/** Hammer: long lower shadow (≥ 2× body), small upper shadow (≤ 10% of range). */
export function detectHammer(candles: readonly OHLC[]): number[] {
  return candles.map((c) => {
    const b = body(c);
    const r = range(c);
    if (b === 0 || r === 0) return 0;
    return lowerShadow(c) >= 2 * b && upperShadow(c) / r <= 0.1 ? 1 : 0;
  });
}

/** Inverted hammer / shooting star geometry: long upper shadow, small lower. */
export function detectShootingStar(candles: readonly OHLC[]): number[] {
  return candles.map((c) => {
    const b = body(c);
    const r = range(c);
    if (b === 0 || r === 0) return 0;
    return upperShadow(c) >= 2 * b && lowerShadow(c) / r <= 0.1 ? -1 : 0;
  });
}

/** Bullish engulfing: bear candle followed by larger bull candle that engulfs body. */
export function detectBullishEngulfing(candles: readonly OHLC[]): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 1; i < candles.length; i++) {
    const a = candles[i - 1];
    const b = candles[i];
    if (isBear(a) && isBull(b) && b.open <= a.close && b.close >= a.open) out[i] = 1;
  }
  return out;
}

/** Bearish engulfing: bull candle followed by larger bear candle that engulfs body. */
export function detectBearishEngulfing(candles: readonly OHLC[]): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 1; i < candles.length; i++) {
    const a = candles[i - 1];
    const b = candles[i];
    if (isBull(a) && isBear(b) && b.open >= a.close && b.close <= a.open) out[i] = -1;
  }
  return out;
}

/** Morning star: bear, small body (gap down), bull closing into first body. */
export function detectMorningStar(candles: readonly OHLC[]): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 2; i < candles.length; i++) {
    const a = candles[i - 2];
    const b = candles[i - 1];
    const c = candles[i];
    if (
      isBear(a) &&
      body(b) < body(a) * 0.5 &&
      isBull(c) &&
      c.close > (a.open + a.close) / 2
    ) {
      out[i] = 1;
    }
  }
  return out;
}

/** Evening star: bull, small body, bear closing into first body. */
export function detectEveningStar(candles: readonly OHLC[]): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 2; i < candles.length; i++) {
    const a = candles[i - 2];
    const b = candles[i - 1];
    const c = candles[i];
    if (
      isBull(a) &&
      body(b) < body(a) * 0.5 &&
      isBear(c) &&
      c.close < (a.open + a.close) / 2
    ) {
      out[i] = -1;
    }
  }
  return out;
}

/** Three white soldiers: 3 consecutive bull candles, each closing higher. */
export function detectThreeWhiteSoldiers(candles: readonly OHLC[]): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 2; i < candles.length; i++) {
    const a = candles[i - 2];
    const b = candles[i - 1];
    const c = candles[i];
    if (isBull(a) && isBull(b) && isBull(c) && b.close > a.close && c.close > b.close) {
      out[i] = 1;
    }
  }
  return out;
}

/** Three black crows: 3 consecutive bear candles, each closing lower. */
export function detectThreeBlackCrows(candles: readonly OHLC[]): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 2; i < candles.length; i++) {
    const a = candles[i - 2];
    const b = candles[i - 1];
    const c = candles[i];
    if (isBear(a) && isBear(b) && isBear(c) && b.close < a.close && c.close < b.close) {
      out[i] = -1;
    }
  }
  return out;
}

/** Hanging man: hammer geometry but in uptrend (caller filters). */
export const detectHangingMan = detectHammer;

/** Marubozu: no shadows on either side (body ≈ range). */
export function detectMarubozu(candles: readonly OHLC[], threshold = 0.05): number[] {
  return candles.map((c) => {
    const r = range(c);
    if (r === 0) return 0;
    if (body(c) / r >= 1 - threshold) return isBull(c) ? 1 : -1;
    return 0;
  });
}

/** Spinning top: small body with long shadows on both sides. */
export function detectSpinningTop(candles: readonly OHLC[]): number[] {
  return candles.map((c) => {
    const b = body(c);
    const r = range(c);
    if (r === 0) return 0;
    return b / r < 0.3 && lowerShadow(c) > b && upperShadow(c) > b ? 1 : 0;
  });
}

/** Piercing line: bear, then bull opening below low and closing above midpoint of prior body. */
export function detectPiercingLine(candles: readonly OHLC[]): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 1; i < candles.length; i++) {
    const a = candles[i - 1];
    const b = candles[i];
    if (
      isBear(a) &&
      isBull(b) &&
      b.open < a.low &&
      b.close > (a.open + a.close) / 2 &&
      b.close < a.open
    ) {
      out[i] = 1;
    }
  }
  return out;
}

/** Dark cloud cover: bull, then bear opening above high and closing below midpoint. */
export function detectDarkCloudCover(candles: readonly OHLC[]): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 1; i < candles.length; i++) {
    const a = candles[i - 1];
    const b = candles[i];
    if (
      isBull(a) &&
      isBear(b) &&
      b.open > a.high &&
      b.close < (a.open + a.close) / 2 &&
      b.close > a.open
    ) {
      out[i] = -1;
    }
  }
  return out;
}

/** Tweezer top: two bars with matching highs (within 0.1% tolerance) ending bullish run. */
export function detectTweezerTop(candles: readonly OHLC[], tol = 0.001): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 1; i < candles.length; i++) {
    const a = candles[i - 1];
    const b = candles[i];
    if (Math.abs(a.high - b.high) / Math.max(a.high, 1e-9) < tol && isBull(a) && isBear(b)) {
      out[i] = -1;
    }
  }
  return out;
}

/** Tweezer bottom: matching lows. */
export function detectTweezerBottom(candles: readonly OHLC[], tol = 0.001): number[] {
  const out: number[] = new Array(candles.length).fill(0);
  for (let i = 1; i < candles.length; i++) {
    const a = candles[i - 1];
    const b = candles[i];
    if (Math.abs(a.low - b.low) / Math.max(a.low, 1e-9) < tol && isBear(a) && isBull(b)) {
      out[i] = 1;
    }
  }
  return out;
}

/** Run all detectors on a candle series; returns map of pattern name -> signal array. */
export function detectAllPatterns(candles: readonly OHLC[]): Record<string, number[]> {
  return {
    doji: detectDoji(candles),
    hammer: detectHammer(candles),
    shootingStar: detectShootingStar(candles),
    bullishEngulfing: detectBullishEngulfing(candles),
    bearishEngulfing: detectBearishEngulfing(candles),
    morningStar: detectMorningStar(candles),
    eveningStar: detectEveningStar(candles),
    threeWhiteSoldiers: detectThreeWhiteSoldiers(candles),
    threeBlackCrows: detectThreeBlackCrows(candles),
    marubozu: detectMarubozu(candles),
    spinningTop: detectSpinningTop(candles),
    piercingLine: detectPiercingLine(candles),
    darkCloudCover: detectDarkCloudCover(candles),
    tweezerTop: detectTweezerTop(candles),
    tweezerBottom: detectTweezerBottom(candles),
  };
}
