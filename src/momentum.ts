/**
 * Momentum Technical Indicators
 * 
 * This module provides momentum-based technical analysis indicators including
 * Rate of Change, Momentum, Chande Momentum Oscillator, and other momentum metrics.
 * 
 * @fileoverview Momentum indicators for technical analysis
 * @author MeridianAlgo
 * @version 1.0.0
 */

import { Indicators } from './indicators';

/**
 * Rate of Change (ROC)
 * 
 * ROC measures the percentage change in price over a specified period.
 * It's a pure momentum oscillator that shows the speed of price change.
 * 
 * @param prices - Array of price data
 * @param period - Number of periods for calculation (default: 10)
 * @returns Array of ROC values as percentages
 * 
 * @example
 * ```typescript
 * const prices = [100, 102, 101, 103, 105, 104, 106];
 * const roc = MomentumIndicators.roc(prices, 5);
 * ```
 */
export function roc(prices: number[], period: number = 10): number[] {
  if (prices.length < period + 1) return [];

  const rocValues: number[] = [];

  for (let i = period; i < prices.length; i++) {
    const currentPrice = prices[i];
    const pastPrice = prices[i - period];
    const roc = pastPrice !== 0 ? ((currentPrice - pastPrice) / pastPrice) * 100 : 0;
    rocValues.push(roc);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - rocValues.length;
  return new Array(padLength).fill(NaN).concat(rocValues);
}

/**
 * Momentum
 * 
 * Momentum measures the rate of change in prices over a specified period.
 * It's similar to ROC but shows the actual price difference rather than percentage.
 * 
 * @param prices - Array of price data
 * @param period - Number of periods for calculation (default: 10)
 * @returns Array of momentum values
 */
export function momentum(prices: number[], period: number = 10): number[] {
  if (prices.length < period + 1) return [];

  const momentumValues: number[] = [];

  for (let i = period; i < prices.length; i++) {
    momentumValues.push(prices[i] - prices[i - period]);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - momentumValues.length;
  return new Array(padLength).fill(NaN).concat(momentumValues);
}

/**
 * Chande Momentum Oscillator (CMO)
 * 
 * CMO is a momentum oscillator that measures the momentum on both up and down days.
 * It ranges from -100 to +100 and can identify overbought/oversold conditions.
 * 
 * @param prices - Array of price data
 * @param period - Number of periods for calculation (default: 14)
 * @returns Array of CMO values
 */
export function cmo(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return [];

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(Math.max(0, change));
    losses.push(Math.max(0, -change));
  }

  const sumGains: number[] = [];
  const sumLosses: number[] = [];

  for (let i = period - 1; i < gains.length; i++) {
    let gainSum = 0;
    let lossSum = 0;

    for (let j = i - period + 1; j <= i; j++) {
      gainSum += gains[j];
      lossSum += losses[j];
    }

    sumGains.push(gainSum);
    sumLosses.push(lossSum);
  }

  const cmoValues: number[] = [];
  for (let i = 0; i < sumGains.length; i++) {
    const total = sumGains[i] + sumLosses[i];
    const cmo = total !== 0 ? ((sumGains[i] - sumLosses[i]) / total) * 100 : 0;
    cmoValues.push(cmo);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - cmoValues.length;
  return new Array(padLength).fill(NaN).concat(cmoValues);
}

/**
 * Relative Vigor Index (RVI)
 * 
 * RVI measures the conviction of a recent price action by comparing closing prices
 * to the trading range and smoothing the result with a moving average.
 * 
 * @param open - Array of opening prices
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of closing prices
 * @param period - Number of periods for calculation (default: 10)
 * @returns Object containing RVI and signal line
 */
export function rvi(
  open: number[], 
  high: number[], 
  low: number[], 
  close: number[],
  period: number = 10
): { rvi: number[]; signal: number[] } {
  if (open.length !== high.length || open.length !== low.length || open.length !== close.length) {
    throw new Error('Open, high, low, and close arrays must have the same length');
  }

  if (open.length < period) {
    return { rvi: [], signal: [] };
  }

  const numerator: number[] = [];
  const denominator: number[] = [];

  for (let i = 0; i < open.length; i++) {
    const closeOpen = close[i] - open[i];
    const highLow = high[i] - low[i];
    
    numerator.push(closeOpen);
    denominator.push(highLow);
  }

  const numeratorMA = Indicators.sma(numerator, period);
  const denominatorMA = Indicators.sma(denominator, period);

  const rviValues: number[] = [];
  for (let i = 0; i < numeratorMA.length; i++) {
    rviValues.push(denominatorMA[i] !== 0 ? numeratorMA[i] / denominatorMA[i] : 0);
  }

  const signal = Indicators.sma(rviValues, 4);

  // Pad the beginning with NaN to match input length
  const padLength = open.length - rviValues.length;
  const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);

  return {
    rvi: padArray(rviValues),
    signal: padArray(signal)
  };
}

/**
 * Percentage Price Oscillator (PPO)
 * 
 * PPO is similar to MACD but uses percentage instead of absolute values.
 * It shows the percentage difference between two moving averages.
 * 
 * @param prices - Array of price data
 * @param fastPeriod - Fast moving average period (default: 12)
 * @param slowPeriod - Slow moving average period (default: 26)
 * @param signalPeriod - Signal line period (default: 9)
 * @returns Object containing PPO line, signal line, and histogram
 */
export function ppo(
  prices: number[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): { ppo: number[]; signal: number[]; histogram: number[] } {
  if (fastPeriod >= slowPeriod) {
    throw new Error('Fast period must be less than slow period');
  }

  const fastMA = Indicators.ema(prices, fastPeriod);
  const slowMA = Indicators.ema(prices, slowPeriod);

  const ppoValues: number[] = [];
  const offset = Math.abs(fastMA.length - slowMA.length);

  for (let i = 0; i < Math.min(fastMA.length, slowMA.length); i++) {
    const fast = fastMA[i + (fastMA.length > slowMA.length ? offset : 0)];
    const slow = slowMA[i + (slowMA.length > fastMA.length ? offset : 0)];
    const ppo = slow !== 0 ? ((fast - slow) / slow) * 100 : 0;
    ppoValues.push(ppo);
  }

  const signal = Indicators.sma(ppoValues, signalPeriod);
  const histogram: number[] = [];

  for (let i = 0; i < signal.length; i++) {
    const signalOffset = ppoValues.length - signal.length;
    histogram.push(ppoValues[i + signalOffset] - signal[i]);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - ppoValues.length;
  const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);

  return {
    ppo: padArray(ppoValues),
    signal: padArray(signal),
    histogram: padArray(histogram)
  };
}

/**
 * Percentage Volume Oscillator (PVO)
 * 
 * PVO measures the percentage difference between two volume moving averages.
 * It helps identify volume trends and potential reversals.
 * 
 * @param volume - Array of volume values
 * @param fastPeriod - Fast moving average period (default: 12)
 * @param slowPeriod - Slow moving average period (default: 26)
 * @param signalPeriod - Signal line period (default: 9)
 * @returns Object containing PVO line, signal line, and histogram
 */
export function pvo(
  volume: number[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): { pvo: number[]; signal: number[]; histogram: number[] } {
  if (fastPeriod >= slowPeriod) {
    throw new Error('Fast period must be less than slow period');
  }

  const fastMA = Indicators.ema(volume, fastPeriod);
  const slowMA = Indicators.ema(volume, slowPeriod);

  const pvoValues: number[] = [];
  const offset = Math.abs(fastMA.length - slowMA.length);

  for (let i = 0; i < Math.min(fastMA.length, slowMA.length); i++) {
    const fast = fastMA[i + (fastMA.length > slowMA.length ? offset : 0)];
    const slow = slowMA[i + (slowMA.length > fastMA.length ? offset : 0)];
    const pvo = slow !== 0 ? ((fast - slow) / slow) * 100 : 0;
    pvoValues.push(pvo);
  }

  const signal = Indicators.sma(pvoValues, signalPeriod);
  const histogram: number[] = [];

  for (let i = 0; i < signal.length; i++) {
    const signalOffset = pvoValues.length - signal.length;
    histogram.push(pvoValues[i + signalOffset] - signal[i]);
  }

  // Pad the beginning with NaN to match input length
  const padLength = volume.length - pvoValues.length;
  const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);

  return {
    pvo: padArray(pvoValues),
    signal: padArray(signal),
    histogram: padArray(histogram)
  };
}

/**
 * Detrended Price Oscillator (DPO)
 * 
 * DPO removes the trend from prices, making it easier to identify cycles
 * and overbought/oversold conditions.
 * 
 * @param prices - Array of price data
 * @param period - Number of periods for calculation (default: 20)
 * @returns Array of DPO values
 */
export function dpo(prices: number[], period: number = 20): number[] {
  if (prices.length < period) return [];

  const sma = Indicators.sma(prices, period);
  const dpoValues: number[] = [];

  for (let i = 0; i < sma.length; i++) {
    const priceIndex = i + period - 1;
    const shiftedPrice = prices[priceIndex - Math.floor(period / 2) - 1];
    dpoValues.push(shiftedPrice - sma[i]);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - dpoValues.length;
  return new Array(padLength).fill(NaN).concat(dpoValues);
}

/**
 * Chande Forecast Oscillator
 * 
 * The Chande Forecast Oscillator is based on linear regression analysis.
 * It helps identify trend changes and potential reversals.
 * 
 * @param prices - Array of price data
 * @param period - Number of periods for calculation (default: 14)
 * @returns Array of forecast oscillator values
 */
export function chandeForecastOscillator(prices: number[], period: number = 14): number[] {
  if (prices.length < period) return [];

  const forecastValues: number[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    
    // Calculate linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let j = 0; j < slice.length; j++) {
      const x = j;
      const y = slice[j];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    const n = slice.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Forecast for the next period
    const forecast = slope * n + intercept;
    const actual = prices[i];
    const forecastOscillator = actual - forecast;
    
    forecastValues.push(forecastOscillator);
  }

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - forecastValues.length;
  return new Array(padLength).fill(NaN).concat(forecastValues);
}

/**
 * Coppock Curve
 * 
 * The Coppock Curve is a momentum indicator that uses rate of change
 * to identify long-term buying opportunities.
 * 
 * @param prices - Array of price data
 * @param roc1Period - First ROC period (default: 14)
 * @param roc2Period - Second ROC period (default: 11)
 * @param wmaPeriod - WMA smoothing period (default: 10)
 * @returns Array of Coppock Curve values
 */
export function coppockCurve(
  prices: number[], 
  roc1Period: number = 14, 
  roc2Period: number = 11, 
  wmaPeriod: number = 10
): number[] {
  const roc1 = roc(prices, roc1Period);
  const roc2 = roc(prices, roc2Period);

  const coppockValues: number[] = [];
  const maxLength = Math.max(roc1.length, roc2.length);

  for (let i = 0; i < maxLength; i++) {
    const r1 = i < roc1.length ? roc1[i] : 0;
    const r2 = i < roc2.length ? roc2[i] : 0;
    coppockValues.push(r1 + r2);
  }

  // Apply WMA smoothing - filter out NaN values
  const validValues = coppockValues.filter(val => !isNaN(val));
  if (validValues.length < wmaPeriod) {
    return new Array(prices.length).fill(NaN);
  }
  return Indicators.sma(validValues, wmaPeriod);
}

/**
 * KST Oscillator (Know Sure Thing)
 * 
 * KST is a momentum oscillator that combines multiple rate of change indicators
 * with different time periods to create a comprehensive momentum signal.
 * 
 * @param prices - Array of price data
 * @param roc1 - First ROC period (default: 10)
 * @param roc2 - Second ROC period (default: 15)
 * @param roc3 - Third ROC period (default: 20)
 * @param roc4 - Fourth ROC period (default: 30)
 * @param sma1 - First SMA period (default: 10)
 * @param sma2 - Second SMA period (default: 10)
 * @param sma3 - Third SMA period (default: 10)
 * @param sma4 - Fourth SMA period (default: 15)
 * @returns Object containing KST and signal line
 */
export function kst(
  prices: number[],
  roc1: number = 10, roc2: number = 15, roc3: number = 20, roc4: number = 30,
  sma1: number = 10, sma2: number = 10, sma3: number = 10, sma4: number = 15
): { kst: number[]; signal: number[] } {
  const roc1Values = roc(prices, roc1);
  const roc2Values = roc(prices, roc2);
  const roc3Values = roc(prices, roc3);
  const roc4Values = roc(prices, roc4);

  const sma1Values = Indicators.sma(roc1Values.filter(val => !isNaN(val)), sma1);
  const sma2Values = Indicators.sma(roc2Values.filter(val => !isNaN(val)), sma2);
  const sma3Values = Indicators.sma(roc3Values.filter(val => !isNaN(val)), sma3);
  const sma4Values = Indicators.sma(roc4Values.filter(val => !isNaN(val)), sma4);

  const kstValues: number[] = [];
  const minLength = Math.min(sma1Values.length, sma2Values.length, sma3Values.length, sma4Values.length);

  for (let i = 0; i < minLength; i++) {
    const kst = sma1Values[i] + (2 * sma2Values[i]) + (3 * sma3Values[i]) + (4 * sma4Values[i]);
    kstValues.push(kst);
  }

  const signal = Indicators.sma(kstValues, 9);

  // Pad the beginning with NaN to match input length
  const padLength = prices.length - kstValues.length;
  const padArray = (arr: number[]) => new Array(padLength).fill(NaN).concat(arr);

  return {
    kst: padArray(kstValues),
    signal: padArray(signal)
  };
}

/**
 * Collection of momentum-based technical indicators
 */
export const MomentumIndicators = {
  roc,
  momentum,
  cmo,
  rvi,
  ppo,
  pvo,
  dpo,
  chandeForecastOscillator,
  coppockCurve,
  kst
};
