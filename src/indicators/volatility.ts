/**
 * Volatility Technical Indicators
 * 
 * This module provides volatility-based technical analysis indicators including
 * Keltner Channels, Donchian Channels, Standard Deviation, and other volatility metrics.
 * 
 * @fileoverview Volatility indicators for technical analysis
 * @author MeridianAlgo
 * @version 1.0.0
 */

import { Indicators } from './indicators';

/**
 * Keltner Channels
 * 
 * Keltner Channels are volatility-based envelopes set above and below an exponential
 * moving average. The channels are typically set 2 standard deviations away from
 * the EMA, and the indicator is used to identify overbought and oversold conditions.
 * 
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of closing prices
 * @param period - Number of periods for EMA calculation (default: 20)
 * @param multiplier - Standard deviation multiplier (default: 2)
 * @param atrPeriod - ATR period for calculation (default: 10)
 * @returns Object containing upper, middle, and lower channel values
 * 
 * @example
 * ```typescript
 * const high = [100, 101, 102, 103, 104];
 * const low = [99, 100, 101, 102, 103];
 * const close = [99.5, 100.5, 101.5, 102.5, 103.5];
 * const keltner = VolatilityIndicators.keltnerChannels(high, low, close);
 * ```
 */
export function keltnerChannels(
  high: number[], 
  low: number[], 
  close: number[],
  period: number = 20,
  multiplier: number = 2,
  atrPeriod: number = 10
): { upper: number[]; middle: number[]; lower: number[] } {
  if (high.length !== low.length || high.length !== close.length) {
    throw new Error('High, low, and close arrays must have the same length');
  }

  if (high.length < period) {
    return { upper: [], middle: [], lower: [] };
  }

  const middle = Indicators.ema(close, period);
  const atr = Indicators.atr(high, low, close, atrPeriod);

  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < middle.length; i++) {
    const atrValue = atr[i] || 0;
    upper.push(middle[i] + (multiplier * atrValue));
    lower.push(middle[i] - (multiplier * atrValue));
  }

  // Pad the beginning with NaN to match input length
  const padLength = close.length - upper.length;
  const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);

  return {
    upper: padArray(upper),
    middle: padArray(middle),
    lower: padArray(lower)
  };
}

/**
 * Standard Deviation
 * 
 * Calculates the standard deviation of price data over a specified period.
 * This is useful for measuring price volatility and creating volatility-based indicators.
 * 
 * @param prices - Array of price data
 * @param period - Number of periods for calculation (default: 20)
 * @returns Array of standard deviation values
 */
export function standardDeviation(prices: number[], period: number = 20): number[] {
  if (prices.length < period) return [];

  const stdDevValues: number[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, val) => sum + val, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    stdDevValues.push(Math.sqrt(variance));
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - stdDevValues.length;
  return new Array(padLength).fill(NaN).concat(stdDevValues);
}

/**
 * Variance
 * 
 * Calculates the variance of price data over a specified period.
 * Variance is the square of standard deviation and measures price dispersion.
 * 
 * @param prices - Array of price data
 * @param period - Number of periods for calculation (default: 20)
 * @returns Array of variance values
 */
export function variance(prices: number[], period: number = 20): number[] {
  if (prices.length < period) return [];

  const varianceValues: number[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, val) => sum + val, 0) / period;
    const varValue = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    varianceValues.push(varValue);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - varianceValues.length;
  return new Array(padLength).fill(NaN).concat(varianceValues);
}

/**
 * Average Deviation
 * 
 * Calculates the average deviation (mean absolute deviation) of price data
 * over a specified period. This provides a measure of price volatility.
 * 
 * @param prices - Array of price data
 * @param period - Number of periods for calculation (default: 20)
 * @returns Array of average deviation values
 */
export function averageDeviation(prices: number[], period: number = 20): number[] {
  if (prices.length < period) return [];

  const avgDevValues: number[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, val) => sum + val, 0) / period;
    const avgDev = slice.reduce((sum, val) => sum + Math.abs(val - mean), 0) / period;
    avgDevValues.push(avgDev);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - avgDevValues.length;
  return new Array(padLength).fill(NaN).concat(avgDevValues);
}

/**
 * Historical Volatility
 * 
 * Calculates the historical volatility of price data using the standard deviation
 * of logarithmic returns over a specified period.
 * 
 * @param prices - Array of price data
 * @param period - Number of periods for calculation (default: 20)
 * @param annualized - Whether to annualize the volatility (default: true)
 * @returns Array of historical volatility values
 */
export function historicalVolatility(
  prices: number[], 
  period: number = 20, 
  annualized: boolean = true
): number[] {
  if (prices.length < period + 1) return [];

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }

  const volatilityValues: number[] = [];

  for (let i = period - 1; i < returns.length; i++) {
    const slice = returns.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, val) => sum + val, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (period - 1);
    const stdDev = Math.sqrt(variance);
    
    let volatility = stdDev;
    if (annualized) {
      // Annualize by multiplying by square root of trading periods per year (252)
      volatility *= Math.sqrt(252);
    }
    
    volatilityValues.push(volatility);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - volatilityValues.length;
  return new Array(padLength).fill(NaN).concat(volatilityValues);
}

/**
 * Parkinson Volatility
 * 
 * Parkinson volatility uses high and low prices to estimate volatility.
 * It's more efficient than close-to-close volatility as it uses more information.
 * 
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param period - Number of periods for calculation (default: 20)
 * @param annualized - Whether to annualize the volatility (default: true)
 * @returns Array of Parkinson volatility values
 */
export function parkinsonVolatility(
  high: number[], 
  low: number[], 
  period: number = 20, 
  annualized: boolean = true
): number[] {
  if (high.length !== low.length) {
    throw new Error('High and low arrays must have the same length');
  }

  if (high.length < period) return [];

  const volatilityValues: number[] = [];

  for (let i = period - 1; i < high.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += Math.pow(Math.log(high[j] / low[j]), 2);
    }
    
    let volatility = Math.sqrt(sum / (4 * Math.log(2) * period));
    
    if (annualized) {
      volatility *= Math.sqrt(252);
    }
    
    volatilityValues.push(volatility);
  }

  // Pad the beginning with NaN to match input length
  const padLength = high.length - volatilityValues.length;
  return new Array(padLength).fill(NaN).concat(volatilityValues);
}

/**
 * Garman-Klass Volatility
 * 
 * Garman-Klass volatility uses open, high, low, and close prices to estimate volatility.
 * It's more efficient than Parkinson volatility as it uses all OHLC data.
 * 
 * @param open - Array of opening prices
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of closing prices
 * @param period - Number of periods for calculation (default: 20)
 * @param annualized - Whether to annualize the volatility (default: true)
 * @returns Array of Garman-Klass volatility values
 */
export function garmanKlassVolatility(
  open: number[], 
  high: number[], 
  low: number[], 
  close: number[],
  period: number = 20, 
  annualized: boolean = true
): number[] {
  if (open.length !== high.length || open.length !== low.length || open.length !== close.length) {
    throw new Error('Open, high, low, and close arrays must have the same length');
  }

  if (open.length < period) return [];

  const volatilityValues: number[] = [];

  for (let i = period - 1; i < open.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const term1 = Math.pow(Math.log(high[j] / close[j]), 2) / 2;
      const term2 = Math.pow(Math.log(low[j] / close[j]), 2) / 2;
      const term3 = Math.pow(Math.log(close[j] / open[j]), 2);
      sum += Math.max(0, term1 - term2 - term3);
    }
    
    let volatility = Math.sqrt(sum / period);
    
    if (annualized) {
      volatility *= Math.sqrt(252);
    }
    
    volatilityValues.push(volatility);
  }

  // Pad the beginning with NaN to match input length
  const padLength = open.length - volatilityValues.length;
  return new Array(padLength).fill(NaN).concat(volatilityValues);
}

/**
 * Rogers-Satchell Volatility
 * 
 * Rogers-Satchell volatility is another OHLC-based volatility estimator
 * that doesn't require the assumption of zero drift.
 * 
 * @param open - Array of opening prices
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of closing prices
 * @param period - Number of periods for calculation (default: 20)
 * @param annualized - Whether to annualize the volatility (default: true)
 * @returns Array of Rogers-Satchell volatility values
 */
export function rogersSatchellVolatility(
  open: number[], 
  high: number[], 
  low: number[], 
  close: number[],
  period: number = 20, 
  annualized: boolean = true
): number[] {
  if (open.length !== high.length || open.length !== low.length || open.length !== close.length) {
    throw new Error('Open, high, low, and close arrays must have the same length');
  }

  if (open.length < period) return [];

  const volatilityValues: number[] = [];

  for (let i = period - 1; i < open.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const term1 = Math.log(high[j] / open[j]) * Math.log(high[j] / close[j]);
      const term2 = Math.log(low[j] / open[j]) * Math.log(low[j] / close[j]);
      sum += term1 + term2;
    }
    
    let volatility = Math.sqrt(sum / period);
    
    if (annualized) {
      volatility *= Math.sqrt(252);
    }
    
    volatilityValues.push(volatility);
  }

  // Pad the beginning with NaN to match input length
  const padLength = open.length - volatilityValues.length;
  return new Array(padLength).fill(NaN).concat(volatilityValues);
}

/**
 * Yang-Zhang Volatility
 * 
 * Yang-Zhang volatility is the most efficient volatility estimator that uses
 * OHLC data and doesn't require the assumption of zero drift.
 * 
 * @param open - Array of opening prices
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of closing prices
 * @param period - Number of periods for calculation (default: 20)
 * @param annualized - Whether to annualize the volatility (default: true)
 * @returns Array of Yang-Zhang volatility values
 */
export function yangZhangVolatility(
  open: number[], 
  high: number[], 
  low: number[], 
  close: number[],
  period: number = 20, 
  annualized: boolean = true
): number[] {
  if (open.length !== high.length || open.length !== low.length || open.length !== close.length) {
    throw new Error('Open, high, low, and close arrays must have the same length');
  }

  if (open.length < period) return [];

  const volatilityValues: number[] = [];

  for (let i = period - 1; i < open.length; i++) {
    // Calculate overnight returns
    const overnightReturns: number[] = [];
    for (let j = i - period + 1; j <= i; j++) {
      overnightReturns.push(Math.log(open[j] / close[j - 1]));
    }

    // Calculate close-to-close returns
    const closeToCloseReturns: number[] = [];
    for (let j = i - period + 1; j <= i; j++) {
      closeToCloseReturns.push(Math.log(close[j] / close[j - 1]));
    }

    // Calculate Garman-Klass volatility
    let gkSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const term1 = Math.pow(Math.log(high[j] / close[j]), 2) / 2;
      const term2 = Math.pow(Math.log(low[j] / close[j]), 2) / 2;
      const term3 = Math.pow(Math.log(close[j] / open[j]), 2);
      gkSum += Math.max(0, term1 - term2 - term3);
    }
    const gkVol = gkSum / period;

    // Calculate overnight volatility
    const overnightMean = overnightReturns.reduce((sum, val) => sum + val, 0) / period;
    const overnightVar = overnightReturns.reduce((sum, val) => sum + Math.pow(val - overnightMean, 2), 0) / (period - 1);

    // Calculate close-to-close volatility
    const closeToCloseMean = closeToCloseReturns.reduce((sum, val) => sum + val, 0) / period;
    const closeToCloseVar = closeToCloseReturns.reduce((sum, val) => sum + Math.pow(val - closeToCloseMean, 2), 0) / (period - 1);

    // Yang-Zhang volatility
    let volatility = Math.sqrt(overnightVar + gkVol + closeToCloseVar);
    
    if (annualized) {
      volatility *= Math.sqrt(252);
    }
    
    volatilityValues.push(volatility);
  }

  // Pad the beginning with NaN to match input length
  const padLength = open.length - volatilityValues.length;
  return new Array(padLength).fill(NaN).concat(volatilityValues);
}

/**
 * Volatility Ratio
 * 
 * Calculates the ratio of current volatility to historical volatility.
 * Values above 1 indicate higher than normal volatility.
 * 
 * @param prices - Array of price data
 * @param shortPeriod - Short period for current volatility (default: 10)
 * @param longPeriod - Long period for historical volatility (default: 20)
 * @returns Array of volatility ratio values
 */
export function volatilityRatio(
  prices: number[], 
  shortPeriod: number = 10, 
  longPeriod: number = 20
): number[] {
  if (shortPeriod >= longPeriod) {
    throw new Error('Short period must be less than long period');
  }

  const shortVol = historicalVolatility(prices, shortPeriod);
  const longVol = historicalVolatility(prices, longPeriod);

  const ratioValues: number[] = [];
  const minLength = Math.min(shortVol.length, longVol.length);

  for (let i = 0; i < minLength; i++) {
    const ratio = longVol[i] !== 0 ? shortVol[i] / longVol[i] : 0;
    ratioValues.push(ratio);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - ratioValues.length;
  return new Array(padLength).fill(NaN).concat(ratioValues);
}

/**
 * Collection of volatility-based technical indicators
 */
export const VolatilityIndicators = {
  keltnerChannels,
  standardDeviation,
  variance,
  averageDeviation,
  historicalVolatility,
  parkinsonVolatility,
  garmanKlassVolatility,
  rogersSatchellVolatility,
  yangZhangVolatility,
  volatilityRatio
};
