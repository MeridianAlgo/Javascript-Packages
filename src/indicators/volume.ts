/**
 * Volume-based Technical Indicators
 * 
 * This module provides volume-based technical analysis indicators including
 * VWAP, Volume Profile, Money Flow Index, and other volume-related metrics.
 * 
 * @fileoverview Volume indicators for technical analysis
 * @author MeridianAlgo
 * @version 1.0.0
 */

import { Indicators } from './indicators';

/**
 * Volume Weighted Average Price (VWAP) calculation
 * 
 * VWAP is a trading benchmark that gives the average price a security has traded
 * at throughout the day, based on both volume and price. It is important because
 * it provides traders with insight into both the trend and value of a security.
 * 
 * @param high - Array of high prices
 * @param low - Array of low prices  
 * @param close - Array of closing prices
 * @param volume - Array of volume values
 * @param period - Number of periods for calculation (optional, calculates for entire dataset if not provided)
 * @returns Array of VWAP values
 * 
 * @example
 * ```typescript
 * const high = [100, 101, 102, 103, 104];
 * const low = [99, 100, 101, 102, 103];
 * const close = [99.5, 100.5, 101.5, 102.5, 103.5];
 * const volume = [1000, 1200, 1100, 1300, 1400];
 * const vwap = VolumeIndicators.vwap(high, low, close, volume);
 * ```
 */
export function vwap(
  high: number[], 
  low: number[], 
  close: number[], 
  volume: number[],
  period?: number
): number[] {
  if (high.length !== low.length || high.length !== close.length || high.length !== volume.length) {
    throw new Error('High, low, close, and volume arrays must have the same length');
  }

  if (high.length === 0) return [];

  const typicalPrice = high.map((h, i) => (h + low[i] + close[i]) / 3);
  const vwapValues: number[] = [];
  
  let cumulativeVolume = 0;
  let cumulativeVolumePrice = 0;

  for (let i = 0; i < high.length; i++) {
    if (period && i < period - 1) {
      // Pad the beginning with NaN for period-based VWAP
      vwapValues.push(NaN);
    } else if (period && i >= period - 1) {
      // Calculate VWAP for the specified period
      const startIndex = i - period + 1;
      let periodVolume = 0;
      let periodVolumePrice = 0;
      
      for (let j = startIndex; j <= i; j++) {
        periodVolume += volume[j];
        periodVolumePrice += typicalPrice[j] * volume[j];
      }
      
      vwapValues.push(periodVolume > 0 ? periodVolumePrice / periodVolume : 0);
    } else {
      // Calculate cumulative VWAP
      cumulativeVolume += volume[i];
      cumulativeVolumePrice += typicalPrice[i] * volume[i];
      vwapValues.push(cumulativeVolume > 0 ? cumulativeVolumePrice / cumulativeVolume : 0);
    }
  }

  return vwapValues;
}

/**
 * Volume Weighted Moving Average (VWMA)
 * 
 * VWMA is similar to VWAP but calculated over a specific period rather than
 * cumulatively. It gives more weight to periods with higher volume.
 * 
 * @param prices - Array of price data
 * @param volume - Array of volume values
 * @param period - Number of periods for calculation
 * @returns Array of VWMA values
 */
export function vwma(prices: number[], volume: number[], period: number): number[] {
  if (prices.length !== volume.length) {
    throw new Error('Prices and volume arrays must have the same length');
  }

  if (prices.length < period) return [];

  const vwmaValues: number[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    let volumeSum = 0;
    let volumePriceSum = 0;

    for (let j = i - period + 1; j <= i; j++) {
      volumeSum += volume[j];
      volumePriceSum += prices[j] * volume[j];
    }

    vwmaValues.push(volumeSum > 0 ? volumePriceSum / volumeSum : 0);
  }

  return vwmaValues;
}

/**
 * Money Flow Index (MFI)
 * 
 * The Money Flow Index is a momentum oscillator that uses both price and volume
 * to identify overbought or oversold conditions. It ranges from 0 to 100.
 * 
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of closing prices
 * @param volume - Array of volume values
 * @param period - Number of periods for calculation (default: 14)
 * @returns Array of MFI values
 */
export function mfi(
  high: number[], 
  low: number[], 
  close: number[], 
  volume: number[],
  period: number = 14
): number[] {
  if (high.length !== low.length || high.length !== close.length || high.length !== volume.length) {
    throw new Error('High, low, close, and volume arrays must have the same length');
  }

  if (high.length < period + 1) return [];

  const typicalPrice: number[] = [];
  for (let i = 0; i < high.length; i++) {
    typicalPrice.push((high[i] + low[i] + close[i]) / 3);
  }

  const rawMoneyFlow: number[] = [];
  for (let i = 0; i < typicalPrice.length; i++) {
    rawMoneyFlow.push(typicalPrice[i] * volume[i]);
  }

  const positiveFlow: number[] = [];
  const negativeFlow: number[] = [];

  for (let i = 1; i < typicalPrice.length; i++) {
    if (typicalPrice[i] > typicalPrice[i - 1]) {
      positiveFlow.push(rawMoneyFlow[i]);
      negativeFlow.push(0);
    } else if (typicalPrice[i] < typicalPrice[i - 1]) {
      positiveFlow.push(0);
      negativeFlow.push(rawMoneyFlow[i]);
    } else {
      positiveFlow.push(0);
      negativeFlow.push(0);
    }
  }

  const positiveFlowMA = Indicators.sma(positiveFlow, period);
  const negativeFlowMA = Indicators.sma(negativeFlow, period);

  const mfiValues: number[] = [];
  for (let i = 0; i < positiveFlowMA.length; i++) {
    const moneyFlowRatio = negativeFlowMA[i] === 0 ? 100 : positiveFlowMA[i] / negativeFlowMA[i];
    mfiValues.push(100 - (100 / (1 + moneyFlowRatio)));
  }

  // Pad the beginning with NaN to match input length
  const padLength = high.length - mfiValues.length;
  return new Array(padLength).fill(NaN).concat(mfiValues);
}

/**
 * Chaikin Money Flow (CMF)
 * 
 * CMF measures the amount of money flow volume over a specific period.
 * It oscillates around zero and can be used to identify buying and selling pressure.
 * 
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of closing prices
 * @param volume - Array of volume values
 * @param period - Number of periods for calculation (default: 20)
 * @returns Array of CMF values
 */
export function cmf(
  high: number[], 
  low: number[], 
  close: number[], 
  volume: number[],
  period: number = 20
): number[] {
  if (high.length !== low.length || high.length !== close.length || high.length !== volume.length) {
    throw new Error('High, low, close, and volume arrays must have the same length');
  }

  if (high.length < period) return [];

  const moneyFlowMultiplier: number[] = [];
  const moneyFlowVolume: number[] = [];

  for (let i = 0; i < high.length; i++) {
    const range = high[i] - low[i];
    if (range === 0) {
      moneyFlowMultiplier.push(0);
    } else {
      moneyFlowMultiplier.push(((close[i] - low[i]) - (high[i] - close[i])) / range);
    }
    moneyFlowVolume.push(moneyFlowMultiplier[i] * volume[i]);
  }

  const cmfValues: number[] = [];
  for (let i = period - 1; i < high.length; i++) {
    let sumMoneyFlowVolume = 0;
    let sumVolume = 0;

    for (let j = i - period + 1; j <= i; j++) {
      sumMoneyFlowVolume += moneyFlowVolume[j];
      sumVolume += volume[j];
    }

    cmfValues.push(sumVolume > 0 ? sumMoneyFlowVolume / sumVolume : 0);
  }

  // Pad the beginning with NaN to match input length
  const padLength = high.length - cmfValues.length;
  return new Array(padLength).fill(NaN).concat(cmfValues);
}

/**
 * Volume Price Trend (VPT)
 * 
 * VPT is a cumulative indicator that uses volume and price to determine
 * the strength of a price trend.
 * 
 * @param close - Array of closing prices
 * @param volume - Array of volume values
 * @returns Array of VPT values
 */
export function vpt(close: number[], volume: number[]): number[] {
  if (close.length !== volume.length) {
    throw new Error('Close and volume arrays must have the same length');
  }

  if (close.length === 0) return [];

  const vptValues: number[] = [0]; // Start with 0

  for (let i = 1; i < close.length; i++) {
    const priceChange = (close[i] - close[i - 1]) / close[i - 1];
    vptValues.push(vptValues[i - 1] + (priceChange * volume[i]));
  }

  return vptValues;
}

/**
 * Negative Volume Index (NVI)
 * 
 * NVI tracks price changes only on days when volume decreases from the previous day.
 * It's used to identify bull markets and can be compared with PVI.
 * 
 * @param close - Array of closing prices
 * @param volume - Array of volume values
 * @returns Array of NVI values
 */
export function nvi(close: number[], volume: number[]): number[] {
  if (close.length !== volume.length) {
    throw new Error('Close and volume arrays must have the same length');
  }

  if (close.length === 0) return [];

  const nviValues: number[] = [1000]; // Start with base value of 1000

  for (let i = 1; i < close.length; i++) {
    if (volume[i] < volume[i - 1]) {
      // Volume decreased, update NVI
      const priceChange = (close[i] - close[i - 1]) / close[i - 1];
      nviValues.push(nviValues[i - 1] * (1 + priceChange));
    } else {
      // Volume increased or stayed the same, keep previous value
      nviValues.push(nviValues[i - 1]);
    }
  }

  return nviValues;
}

/**
 * Positive Volume Index (PVI)
 * 
 * PVI tracks price changes only on days when volume increases from the previous day.
 * It's used to identify bull markets and can be compared with NVI.
 * 
 * @param close - Array of closing prices
 * @param volume - Array of volume values
 * @returns Array of PVI values
 */
export function pvi(close: number[], volume: number[]): number[] {
  if (close.length !== volume.length) {
    throw new Error('Close and volume arrays must have the same length');
  }

  if (close.length === 0) return [];

  const pviValues: number[] = [1000]; // Start with base value of 1000

  for (let i = 1; i < close.length; i++) {
    if (volume[i] > volume[i - 1]) {
      // Volume increased, update PVI
      const priceChange = (close[i] - close[i - 1]) / close[i - 1];
      pviValues.push(pviValues[i - 1] * (1 + priceChange));
    } else {
      // Volume decreased or stayed the same, keep previous value
      pviValues.push(pviValues[i - 1]);
    }
  }

  return pviValues;
}

/**
 * Ease of Movement (EMV)
 * 
 * EMV measures the relationship between volume and price change. It shows how much
 * volume is required to move prices.
 * 
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param volume - Array of volume values
 * @param period - Number of periods for smoothing (default: 14)
 * @returns Array of EMV values
 */
export function emv(
  high: number[], 
  low: number[], 
  volume: number[],
  period: number = 14
): number[] {
  if (high.length !== low.length || high.length !== volume.length) {
    throw new Error('High, low, and volume arrays must have the same length');
  }

  if (high.length < 2) return [];

  const emvValues: number[] = [];

  for (let i = 1; i < high.length; i++) {
    const distance = ((high[i] + low[i]) / 2) - ((high[i - 1] + low[i - 1]) / 2);
    const boxHeight = high[i] - low[i];
    
    if (boxHeight === 0) {
      emvValues.push(0);
    } else {
      emvValues.push(distance / boxHeight * volume[i]);
    }
  }

  // Apply smoothing
  return Indicators.sma(emvValues, period);
}

/**
 * Volume Oscillator
 * 
 * The Volume Oscillator shows the relationship between two volume moving averages.
 * It helps identify volume trends and potential reversals.
 * 
 * @param volume - Array of volume values
 * @param shortPeriod - Short period for moving average (default: 5)
 * @param longPeriod - Long period for moving average (default: 10)
 * @returns Array of volume oscillator values
 */
export function volumeOscillator(
  volume: number[], 
  shortPeriod: number = 5, 
  longPeriod: number = 10
): number[] {
  if (shortPeriod >= longPeriod) {
    throw new Error('Short period must be less than long period');
  }

  const shortMA = Indicators.sma(volume, shortPeriod);
  const longMA = Indicators.sma(volume, longPeriod);

  const oscillator: number[] = [];
  const offset = longMA.length - shortMA.length;

  for (let i = 0; i < shortMA.length; i++) {
    oscillator.push(shortMA[i] - longMA[i + offset]);
  }

  // Pad the beginning with NaN to match input length
  const padLength = volume.length - oscillator.length;
  return new Array(padLength).fill(NaN).concat(oscillator);
}

/**
 * Collection of volume-based technical indicators
 */
export const VolumeIndicators = {
  vwap,
  vwma,
  mfi,
  cmf,
  vpt,
  nvi,
  pvi,
  emv,
  volumeOscillator
};
