// Technical Indicators Module for MeridianAlgo (TypeScript Port)
// Provides common technical analysis indicators

/**
 * Collection of technical analysis indicators
 */
export class Indicators {
  /**
   * Calculate Simple Moving Average
   */
  static sma(data: number[], period: number): number[] {
    if (data.length < period) return [];
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j];
      }
      result.push(sum / period);
    }
    return result;
  }

  /**
   * Calculate Exponential Moving Average
   */
  static ema(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema: number[] = [];
    let prevEma = data[0];
    ema.push(prevEma);
    for (let i = 1; i < data.length; i++) {
      const value = data[i] * k + prevEma * (1 - k);
      ema.push(value);
      prevEma = value;
    }
    return ema;
  }

  /**
   * Calculate Relative Strength Index
   */
  static rsi(data: number[], period = 14): number[] {
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
      const diff = data[i] - data[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    gains /= period;
    losses /= period;
    let rs = gains / (losses || 1);
    rsi[period] = 100 - 100 / (1 + rs);
    for (let i = period + 1; i < data.length; i++) {
      const diff = data[i] - data[i - 1];
      if (diff >= 0) {
        gains = (gains * (period - 1) + diff) / period;
        losses = (losses * (period - 1)) / period;
      } else {
        gains = (gains * (period - 1)) / period;
        losses = (losses * (period - 1) - diff) / period;
      }
      rs = gains / (losses || 1);
      rsi[i] = 100 - 100 / (1 + rs);
    }
    return rsi;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  static macd(data: number[], fast = 12, slow = 26, signal = 9): { macd: number[]; signal: number[]; histogram: number[] } {
    const emaFast = this.ema(data, fast);
    const emaSlow = this.ema(data, slow);
    const macd: number[] = [];
    for (let i = 0; i < data.length; i++) {
      macd.push((emaFast[i] || 0) - (emaSlow[i] || 0));
    }
    const signalLine = this.ema(macd, signal);
    const histogram: number[] = macd.map((v, i) => v - (signalLine[i] || 0));
    return { macd, signal: signalLine, histogram };
  }

  /**
   * Calculate Bollinger Bands
   */
  static bollingerBands(data: number[], period = 20, stdDev = 2): { upper: number[]; middle: number[]; lower: number[] } {
    const middle: number[] = this.sma(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = middle[i - period + 1];
      const std = Math.sqrt(slice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / period);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
    return { upper, middle, lower };
  }

  /**
   * Calculate Stochastic Oscillator
   */
  static stochastic(high: number[], low: number[], close: number[], kPeriod = 14, dPeriod = 3): { k: number[]; d: number[] } {
    const k: number[] = [];
    for (let i = kPeriod - 1; i < close.length; i++) {
      const highestHigh = Math.max(...high.slice(i - kPeriod + 1, i + 1));
      const lowestLow = Math.min(...low.slice(i - kPeriod + 1, i + 1));
      k.push(100 * ((close[i] - lowestLow) / (highestHigh - lowestLow)));
    }
    const d: number[] = this.sma(k, dPeriod);
    return { k, d };
  }

  /**
   * Calculate Average True Range
   */
  static atr(high: number[], low: number[], close: number[], period = 14): number[] {
    const tr: number[] = [];
    for (let i = 0; i < high.length; i++) {
      const prevClose = i > 0 ? close[i - 1] : close[0];
      const tr1 = high[i] - low[i];
      const tr2 = Math.abs(high[i] - prevClose);
      const tr3 = Math.abs(low[i] - prevClose);
      tr.push(Math.max(tr1, tr2, tr3));
    }
    return this.sma(tr, period);
  }

  /**
   * Calculate Volume Simple Moving Average
   */
  static volumeSma(volume: number[], period = 20): number[] {
    return this.sma(volume, period);
  }

  /**
   * Calculate Price Channels (Donchian Channels)
   */
  static priceChannels(high: number[], low: number[], period = 20): { upper: number[]; lower: number[]; middle: number[] } {
    const upper: number[] = [];
    const lower: number[] = [];
    for (let i = period - 1; i < high.length; i++) {
      upper.push(Math.max(...high.slice(i - period + 1, i + 1)));
      lower.push(Math.min(...low.slice(i - period + 1, i + 1)));
    }
    const middle: number[] = upper.map((u, i) => (u + lower[i]) / 2);
    return { upper, lower, middle };
  }

  /**
   * Calculate Williams %R
   */
  static williamsR(high: number[], low: number[], close: number[], period = 14): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < close.length; i++) {
      const highestHigh = Math.max(...high.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...low.slice(i - period + 1, i + 1));
      result.push(-100 * ((highestHigh - close[i]) / (highestHigh - lowestLow)));
    }
    return result;
  }

  /**
   * Calculate Commodity Channel Index
   */
  static cci(high: number[], low: number[], close: number[], period = 20): number[] {
    const typicalPrice: number[] = high.map((h, i) => (h + low[i] + close[i]) / 3);
    const smaTp: number[] = this.sma(typicalPrice, period);
    const meanDeviation: number[] = [];
    for (let i = period - 1; i < typicalPrice.length; i++) {
      const slice = typicalPrice.slice(i - period + 1, i + 1);
      const mean = smaTp[i - period + 1];
      meanDeviation.push(slice.reduce((acc, v) => acc + Math.abs(v - mean), 0) / period);
    }
    const cci: number[] = [];
    for (let i = 0; i < meanDeviation.length; i++) {
      cci.push((typicalPrice[i + period - 1] - smaTp[i]) / (0.015 * meanDeviation[i]));
    }
    return cci;
  }
} 