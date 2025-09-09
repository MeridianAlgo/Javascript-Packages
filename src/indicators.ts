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

/**
 * Custom error class for indicator-related errors
 */
export class IndicatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IndicatorError';
    Object.setPrototypeOf(this, IndicatorError.prototype);
  }
}

/**
 * Type for moving average calculation methods
 */
type MovingAverageType = 'sma' | 'ema' | 'wma' | 'dema' | 'tema' | 'kama' | 't3';

/**
 * Collection of technical analysis indicators with robust error handling
 * and multiple calculation methods.
 */
export class Indicators {
  /**
   * Validates input parameters for indicator functions
   * @private
   */
  private static _validateInput(
    data: number[], 
    period: number, 
    minPeriod = 1, 
    requireMultiplePoints = true
  ): void {
    if (!Array.isArray(data)) {
      throw new IndicatorError('Input data must be an array of numbers');
    }
    
    if (data.length === 0) {
      throw new IndicatorError('Input data array cannot be empty');
    }
    
    if (data.some(isNaN)) {
      throw new IndicatorError('Input data contains invalid (NaN) values');
    }
    
    if (typeof period !== 'number' || isNaN(period) || period < minPeriod) {
      throw new IndicatorError(`Period must be a number >= ${minPeriod}`);
    }
    
    if (requireMultiplePoints && data.length < period) {
      throw new IndicatorError(`Insufficient data points. Need at least ${period} data points, got ${data.length}`);
    }
  }

  /**
   * Calculate Simple Moving Average (SMA)
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation
   * @returns Array of SMA values
   */
  static sma(data: number[], period: number): number[] {
    try {
      this._validateInput(data, period, 1);
      
      if (data.length < period) {
        return [];
      }
      
      const result: number[] = [];
      for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
          sum += data[j];
        }
        result.push(sum / period);
      }
      return result;
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in SMA calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation
   * @returns Array of EMA values
   */
  static ema(data: number[], period: number): number[] {
    try {
      this._validateInput(data, period, 1);
      
      if (data.length === 0) return [];
      
      const k = 2 / (period + 1);
      const ema: number[] = [data[0]]; // First value is the same as the first data point
      
      for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
      }
      
      return ema;
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in EMA calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Calculate Weighted Moving Average (WMA)
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation
   * @returns Array of WMA values
   */
  static wma(data: number[], period: number): number[] {
    try {
      this._validateInput(data, period);
      
      if (data.length < period) return [];
      
      const result: number[] = [];
      const weight = period * (period + 1) / 2; // Sum of weights
      
      for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += data[i - period + 1 + j] * (j + 1);
        }
        result.push(sum / weight);
      }
      
      return result;
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in WMA calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Calculate Double Exponential Moving Average (DEMA)
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation
   * @returns Array of DEMA values
   */
  static dema(data: number[], period: number): number[] {
    try {
      this._validateInput(data, period);
      
      const ema1 = this.ema(data, period);
      const ema2 = this.ema(ema1, period);
      
      return ema1.map((val, i) => 2 * val - ema2[i]);
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in DEMA calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Calculate Triple Exponential Moving Average (TEMA)
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation
   * @returns Array of TEMA values
   */
  static tema(data: number[], period: number): number[] {
    try {
      this._validateInput(data, period);
      
      const ema1 = this.ema(data, period);
      const ema2 = this.ema(ema1, period);
      const ema3 = this.ema(ema2, period);
      
      return ema1.map((val, i) => 3 * val - 3 * ema2[i] + ema3[i]);
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in TEMA calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Calculate Kaufman's Adaptive Moving Average (KAMA)
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation
   * @param fast - Fast EMA period (default: 2)
   * @param slow - Slow EMA period (default: 30)
   * @returns Array of KAMA values
   */
  static kama(data: number[], period: number, fast: number = 2, slow: number = 30): number[] {
    try {
      this._validateInput(data, period);
      
      if (fast >= slow) {
        throw new IndicatorError('Fast period must be less than slow period');
      }
      
      if (data.length < period) return [];
      
      const kama: number[] = [data[0]]; // Initialize with first price
      
      // Calculate efficiency ratio (ER)
      const change = Math.abs(data[data.length - 1] - data[0]);
      const volatility = data.slice(1).reduce((sum, val, i) => sum + Math.abs(val - data[i]), 0);
      const er = volatility !== 0 ? change / volatility : 0;
      
      // Calculate smoothing constant (SC)
      const fastSC = 2 / (fast + 1);
      const slowSC = 2 / (slow + 1);
      const sc = Math.pow(er * (fastSC - slowSC) + slowSC, 2);
      
      // Calculate KAMA
      for (let i = 1; i < data.length; i++) {
        kama.push(kama[i - 1] + sc * (data[i] - kama[i - 1]));
      }
      
      return kama;
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in KAMA calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Calculate T3 Moving Average
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation
   * @param volumeFactor - Volume factor (default: 0.7)
   * @returns Array of T3 values
   */
  static t3(data: number[], period: number, volumeFactor: number = 0.7): number[] {
    try {
      this._validateInput(data, period);
      
      if (volumeFactor <= 0 || volumeFactor >= 1) {
        throw new IndicatorError('Volume factor must be between 0 and 1');
      }
      
      const ema1 = this.ema(data, period);
      const ema2 = this.ema(ema1, period);
      const ema3 = this.ema(ema2, period);
      const ema4 = this.ema(ema3, period);
      const ema5 = this.ema(ema4, period);
      const ema6 = this.ema(ema5, period);
      
      const c1 = -Math.pow(volumeFactor, 3);
      const c2 = 3 * Math.pow(volumeFactor, 2) + 3 * Math.pow(volumeFactor, 3);
      const c3 = -6 * Math.pow(volumeFactor, 2) - 3 * volumeFactor - 3 * Math.pow(volumeFactor, 3);
      const c4 = 1 + 3 * volumeFactor + Math.pow(volumeFactor, 3) + 3 * Math.pow(volumeFactor, 2);
      
      const t3: number[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < 6 * (period - 1)) {
          t3.push(NaN);
        } else {
          t3.push(c1 * ema6[i] + c2 * ema5[i] + c3 * ema4[i] + c4 * ema3[i]);
        }
      }
      
      return t3;
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in T3 calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Generic moving average function that supports multiple types
   * @param type - Type of moving average ('sma', 'ema', 'wma', 'dema', 'tema', 'kama', 't3')
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation
   * @param args - Additional arguments specific to the moving average type
   * @returns Array of moving average values
   */
  static movingAverage(
    type: MovingAverageType,
    data: number[],
    period: number,
    ...args: any[]
  ): number[] {
    switch (type.toLowerCase() as MovingAverageType) {
      case 'sma':
        return this.sma(data, period);
      case 'ema':
        return this.ema(data, period);
      case 'wma':
        return this.wma(data, period);
      case 'dema':
        return this.dema(data, period);
      case 'tema':
        return this.tema(data, period);
      case 'kama':
        return this.kama(data, period, ...args);
      case 't3':
        return this.t3(data, period, ...args);
      default:
        throw new IndicatorError(`Unsupported moving average type: ${type}`);
    }
  }

  /**
   * Calculate Relative Strength Index (RSI)
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation (default: 14)
   * @param maType - Type of moving average to use ('sma', 'ema', etc.)
   * @returns Array of RSI values
   */
  static rsi(data: number[], period: number = 14, maType: MovingAverageType = 'ema'): number[] {
    try {
      this._validateInput(data, period, 2);
      
      if (data.length < period + 1) return [];
      
      const deltas: number[] = [];
      for (let i = 1; i < data.length; i++) {
        deltas.push(data[i] - data[i - 1]);
      }
      
      const gains = deltas.map(d => Math.max(0, d));
      const losses = deltas.map(d => Math.abs(Math.min(0, d)));
      
      // Use the specified moving average type for smoothing
      const avgGain = this.movingAverage(maType, gains, period);
      const avgLoss = this.movingAverage(maType, losses, period);
      
      const rsi: number[] = [];
      for (let i = 0; i < avgGain.length; i++) {
        const rs = avgLoss[i] === 0 ? Infinity : avgGain[i] / avgLoss[i];
        rsi.push(100 - (100 / (1 + rs)));
      }
      
      // Add leading NaN values to match input length
      return new Array(data.length - rsi.length).fill(NaN).concat(rsi);
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in RSI calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * @param data - Array of price data
   * @param fast - Fast EMA period (default: 12)
   * @param slow - Slow EMA period (default: 26)
   * @param signal - Signal line period (default: 9)
   * @param maType - Type of moving average to use ('ema' or 'sma')
   * @returns Object containing MACD line, signal line, and histogram
   */
  static macd(
    data: number[], 
    fast: number = 12, 
    slow: number = 26, 
    signal: number = 9,
    maType: MovingAverageType = 'ema'
  ): { macd: number[]; signal: number[]; histogram: number[] } {
    try {
      this._validateInput(data, Math.max(fast, slow, signal));
      
      if (fast >= slow) {
        throw new IndicatorError('Fast period must be less than slow period');
      }
      
      // Calculate MACD line (fast MA - slow MA)
      const fastMA = this.movingAverage(maType, data, fast);
      const slowMA = this.movingAverage(maType, data, slow);
      
      // Align the arrays and calculate MACD
      const offset = Math.abs(fastMA.length - slowMA.length);
      const macd: number[] = [];
      
      for (let i = 0; i < Math.min(fastMA.length, slowMA.length); i++) {
        macd.push(fastMA[i + (fastMA.length > slowMA.length ? offset : 0)] - 
                 slowMA[i + (slowMA.length > fastMA.length ? offset : 0)]);
      }
      
      // Calculate signal line (MA of MACD)
      const signalLine = this.movingAverage(maType, macd, signal);
      
      // Calculate histogram (MACD - Signal)
      const histogram: number[] = [];
      const signalOffset = macd.length - signalLine.length;
      
      for (let i = 0; i < signalLine.length; i++) {
        histogram.push(macd[i + signalOffset] - signalLine[i]);
      }
      
      // Pad the beginning with NaN to match input length
      const padLength = data.length - macd.length;
      const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);
      
      return {
        macd: padArray(macd),
        signal: padArray(signalLine),
        histogram: padArray(histogram)
      };
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in MACD calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate Bollinger Bands
   * @param data - Array of price data
   * @param period - Number of periods to use for calculation (default: 20)
   * @param stdDev - Number of standard deviations for the bands (default: 2)
   * @param maType - Type of moving average to use for the middle band
   * @returns Object containing upper, middle, and lower band values
   */
  static bollingerBands(
    data: number[], 
    period: number = 20, 
    stdDev: number = 2,
    maType: MovingAverageType = 'sma'
  ): { upper: number[]; middle: number[]; lower: number[] } {
    try {
      this._validateInput(data, period);
      
      if (data.length < period) {
        const empty = [];
        return { upper: empty, middle: empty, lower: empty };
      }
      
      const middle = this.movingAverage(maType, data, period);
      const upper: number[] = [];
      const lower: number[] = [];
      
      for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = middle[i - period + 1];
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        const std = Math.sqrt(variance);
        
        upper.push(mean + stdDev * std);
        lower.push(mean - stdDev * std);
      }
      
      // Pad the beginning with NaN to match input length
      const padLength = data.length - upper.length;
      const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);
      
      return {
        upper: padArray(upper),
        middle: padArray(middle.slice(period - 1)),
        lower: padArray(lower)
      };
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in Bollinger Bands calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate Stochastic Oscillator
   * @param high - Array of high prices
   * @param low - Array of low prices
   * @param close - Array of closing prices
   * @param kPeriod - %K period (default: 14)
   * @param dPeriod - %D period (default: 3)
   * @param smooth - Smoothing period for %K (default: 1)
   * @returns Object containing %K and %D values
   */
  static stochastic(
    high: number[], 
    low: number[], 
    close: number[], 
    kPeriod: number = 14, 
    dPeriod: number = 3,
    smooth: number = 1
  ): { k: number[]; d: number[] } {
    try {
      if (high.length !== low.length || high.length !== close.length) {
        throw new IndicatorError('High, low, and close arrays must have the same length');
      }
      
      this._validateInput(high, kPeriod);
      this._validateInput(high, dPeriod);
      
      if (high.length < kPeriod) {
        return { k: [], d: [] };
      }
      
      // Calculate %K
      const k: number[] = [];
      for (let i = kPeriod - 1; i < close.length; i++) {
        const highSlice = high.slice(i - kPeriod + 1, i + 1);
        const lowSlice = low.slice(i - kPeriod + 1, i + 1);
        
        const highestHigh = Math.max(...highSlice);
        const lowestLow = Math.min(...lowSlice);
        const range = highestHigh - lowestLow;
        
        const currentClose = close[i];
        const stochK = range !== 0 ? 100 * ((currentClose - lowestLow) / range) : 0;
        k.push(Math.min(100, Math.max(0, stochK))); // Clamp between 0 and 100
      }
      
      // Smooth %K if needed
      let smoothedK = k;
      if (smooth > 1) {
        smoothedK = this.sma(k, smooth);
      }
      
      // Calculate %D (signal line)
      const d = this.sma(smoothedK, dPeriod);
      
      // Pad the beginning with NaN to match input length
      const padLength = close.length - smoothedK.length;
      const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);
      
      return {
        k: padArray(smoothedK),
        d: padArray(d)
      };
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in Stochastic Oscillator calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate Average True Range (ATR)
   * @param high - Array of high prices
   * @param low - Array of low prices
   * @param close - Array of closing prices
   * @param period - Number of periods to use for calculation (default: 14)
   * @param maType - Type of moving average to use (default: 'sma')
   * @returns Array of ATR values
   */
  static atr(
    high: number[], 
    low: number[], 
    close: number[], 
    period: number = 14,
    maType: MovingAverageType = 'sma'
  ): number[] {
    try {
      if (high.length !== low.length || high.length !== close.length) {
        throw new IndicatorError('High, low, and close arrays must have the same length');
      }
      
      this._validateInput(high, period);
      
      if (high.length < 2) return [];
      
      // Calculate True Range (TR)
      const tr: number[] = [high[0] - low[0]]; // First TR is just high - low
      
      for (let i = 1; i < high.length; i++) {
        const tr1 = high[i] - low[i];
        const tr2 = Math.abs(high[i] - close[i - 1]);
        const tr3 = Math.abs(low[i] - close[i - 1]);
        tr.push(Math.max(tr1, tr2, tr3));
      }
      
      // Calculate ATR using the specified moving average
      return this.movingAverage(maType, tr, period);
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in ATR calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate Volume Moving Average
   * @param volume - Array of volume values
   * @param period - Number of periods to use for calculation (default: 20)
   * @param maType - Type of moving average to use (default: 'sma')
   * @returns Array of volume moving average values
   */
  static volumeMA(volume: number[], period: number = 20, maType: MovingAverageType = 'sma'): number[] {
    try {
      this._validateInput(volume, period);
      return this.movingAverage(maType, volume, period);
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in Volume MA calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Calculate On-Balance Volume (OBV)
   * @param close - Array of closing prices
   * @param volume - Array of volume values
   * @returns Array of OBV values
   */
  static obv(close: number[], volume: number[]): number[] {
    try {
      if (close.length !== volume.length) {
        throw new IndicatorError('Close and volume arrays must have the same length');
      }
      
      if (close.length === 0) return [];
      
      const obv: number[] = [volume[0]]; // Start with the first volume
      
      for (let i = 1; i < close.length; i++) {
        if (close[i] > close[i - 1]) {
          // If price went up, add volume
          obv.push(obv[i - 1] + volume[i]);
        } else if (close[i] < close[i - 1]) {
          // If price went down, subtract volume
          obv.push(obv[i - 1] - volume[i]);
        } else {
          // If price didn't change, keep the same OBV
          obv.push(obv[i - 1]);
        }
      }
      
      return obv;
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in OBV calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate Donchian Channels (Price Channels)
   * @param high - Array of high prices
   * @param low - Array of low prices
   * @param period - Number of periods to use for calculation (default: 20)
   * @returns Object containing upper, middle, and lower channel values
   */
  static donchianChannels(
    high: number[], 
    low: number[], 
    period: number = 20
  ): { upper: number[]; middle: number[]; lower: number[] } {
    try {
      if (high.length !== low.length) {
        throw new IndicatorError('High and low arrays must have the same length');
      }
      
      this._validateInput(high, period);
      
      if (high.length < period) {
        const empty: number[] = [];
        return { upper: empty, middle: empty, lower: empty };
      }
      
      const upper: number[] = [];
      const lower: number[] = [];
      
      for (let i = period - 1; i < high.length; i++) {
        const highSlice = high.slice(i - period + 1, i + 1);
        const lowSlice = low.slice(i - period + 1, i + 1);
        
        upper.push(Math.max(...highSlice));
        lower.push(Math.min(...lowSlice));
      }
      
      const middle = upper.map((u, i) => (u + lower[i]) / 2);
      
      // Pad the beginning with NaN to match input length
      const padLength = high.length - upper.length;
      const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);
      
      return {
        upper: padArray(upper),
        middle: padArray(middle),
        lower: padArray(lower)
      };
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in Donchian Channels calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Alias for backward compatibility
  static priceChannels = this.donchianChannels;

  /**
   * Calculate Williams %R
   * @param high - Array of high prices
   * @param low - Array of low prices
   * @param close - Array of closing prices
   * @param period - Number of periods to use for calculation (default: 14)
   * @returns Array of Williams %R values
   */
  static williamsR(high: number[], low: number[], close: number[], period: number = 14): number[] {
    try {
      if (high.length !== low.length || high.length !== close.length) {
        throw new IndicatorError('High, low, and close arrays must have the same length');
      }
      
      this._validateInput(high, period);
      
      if (high.length < period) return [];
      
      const result: number[] = [];
      
      for (let i = period - 1; i < close.length; i++) {
        const highSlice = high.slice(i - period + 1, i + 1);
        const lowSlice = low.slice(i - period + 1, i + 1);
        
        const highestHigh = Math.max(...highSlice);
        const lowestLow = Math.min(...lowSlice);
        const range = highestHigh - lowestLow;
        
        if (range === 0) {
          result.push(0); // Avoid division by zero
        } else {
          result.push((-100 * (highestHigh - close[i])) / range);
        }
      }
      
      // Pad the beginning with NaN to match input length
      const padLength = close.length - result.length;
      return new Array(padLength).fill(NaN).concat(result);
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in Williams %R calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate Commodity Channel Index (CCI)
   * @param high - Array of high prices
   * @param low - Array of low prices
   * @param close - Array of closing prices
   * @param period - Number of periods to use for calculation (default: 20)
   * @returns Array of CCI values
   */
  static cci(high: number[], low: number[], close: number[], period: number = 20): number[] {
    try {
      if (high.length !== low.length || high.length !== close.length) {
        throw new IndicatorError('High, low, and close arrays must have the same length');
      }
      
      this._validateInput(high, period);
      
      if (high.length < period) return [];
      
      // Calculate Typical Price
      const typicalPrice: number[] = [];
      for (let i = 0; i < high.length; i++) {
        typicalPrice.push((high[i] + low[i] + close[i]) / 3);
      }
      
      // Calculate SMA of Typical Price
      const smaTp = this.sma(typicalPrice, period);
      
      // Calculate Mean Deviation
      const meanDeviation: number[] = [];
      for (let i = period - 1; i < typicalPrice.length; i++) {
        const slice = typicalPrice.slice(i - period + 1, i + 1);
        const mean = smaTp[i - period + 1];
        const sumDeviation = slice.reduce((sum, val) => sum + Math.abs(val - mean), 0);
        meanDeviation.push(sumDeviation / period);
      }
      
      // Calculate CCI
      const cci: number[] = [];
      for (let i = 0; i < meanDeviation.length; i++) {
        const tpIndex = i + period - 1;
        const deviation = meanDeviation[i];
        
        if (deviation === 0) {
          cci.push(0); // Avoid division by zero
        } else {
          cci.push((typicalPrice[tpIndex] - smaTp[i]) / (0.015 * deviation));
        }
      }
      
      // Pad the beginning with NaN to match input length
      const padLength = high.length - cci.length;
      return new Array(padLength).fill(NaN).concat(cci);
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in CCI calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Calculate Average Directional Index (ADX)
   * @param high - Array of high prices
   * @param low - Array of low prices
   * @param close - Array of closing prices
   * @param period - Number of periods to use for calculation (default: 14)
   * @returns Object containing ADX, +DI, and -DI values
   */
  static adx(
    high: number[], 
    low: number[], 
    close: number[], 
    period: number = 14
  ): { adx: number[]; plusDI: number[]; minusDI: number[] } {
    try {
      if (high.length !== low.length || high.length !== close.length) {
        throw new IndicatorError('High, low, and close arrays must have the same length');
      }
      
      this._validateInput(high, period);
      
      if (high.length < period * 2) {
        const empty: number[] = [];
        return { adx: empty, plusDI: empty, minusDI: empty };
      }
      
      // Calculate +DM, -DM, and True Range
      const plusDM: number[] = [0];
      const minusDM: number[] = [0];
      const tr: number[] = [high[0] - low[0]]; // First TR is just high - low
      
      for (let i = 1; i < high.length; i++) {
        // Calculate directional movements
        const upMove = high[i] - high[i - 1];
        const downMove = low[i - 1] - low[i];
        
        // +DM is the up move if it's greater than the down move and positive
        plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
        
        // -DM is the down move if it's greater than the up move and positive
        minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
        
        // True Range is the greatest of:
        // 1. Current High - Current Low
        // 2. Current High - Previous Close (absolute value)
        // 3. Current Low - Previous Close (absolute value)
        const tr1 = high[i] - low[i];
        const tr2 = Math.abs(high[i] - close[i - 1]);
        const tr3 = Math.abs(low[i] - close[i - 1]);
        tr.push(Math.max(tr1, tr2, tr3));
      }
      
      // Smooth the DMs and TR
      const smoothTR = this.ema(tr, period);
      const smoothPlusDM = this.ema(plusDM, period);
      const smoothMinusDM = this.ema(minusDM, period);
      
      // Calculate +DI and -DI
      const plusDI: number[] = [];
      const minusDI: number[] = [];
      
      for (let i = 0; i < smoothTR.length; i++) {
        plusDI.push(smoothTR[i] !== 0 ? (100 * smoothPlusDM[i]) / smoothTR[i] : 0);
        minusDI.push(smoothTR[i] !== 0 ? (100 * smoothMinusDM[i]) / smoothTR[i] : 0);
      }
      
      // Calculate DX and ADX
      const dx: number[] = [];
      
      for (let i = 0; i < plusDI.length; i++) {
        const sumDI = plusDI[i] + minusDI[i];
        const diffDI = Math.abs(plusDI[i] - minusDI[i]);
        dx.push(sumDI !== 0 ? (100 * diffDI) / sumDI : 0);
      }
      
      const adx = this.ema(dx, period);
      
      // Pad the beginning with NaN to match input length
      const padLength = high.length - adx.length;
      const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);
      
      return {
        adx: padArray(adx),
        plusDI: padArray(plusDI.slice(0, adx.length)),
        minusDI: padArray(minusDI.slice(0, adx.length))
      };
    } catch (error) {
      if (error instanceof IndicatorError) throw error;
      throw new IndicatorError(`Error in ADX calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}