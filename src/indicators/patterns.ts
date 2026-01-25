/**
 * Candlestick Pattern Recognition
 * 
 * This module provides candlestick pattern recognition capabilities for
 * technical analysis including doji, hammer, engulfing patterns, and more.
 * 
 * @fileoverview Candlestick pattern recognition for technical analysis
 * @author MeridianAlgo
 * @version 1.0.0
 */

/**
 * Candlestick data structure
 */
export interface Candlestick {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Pattern recognition result
 */
export interface PatternResult {
  pattern: string;
  bullish: boolean;
  bearish: boolean;
  confidence: number;
  description: string;
}

/**
 * Calculate the body size of a candlestick
 */
function getBodySize(candle: Candlestick): number {
  return Math.abs(candle.close - candle.open);
}

/**
 * Calculate the upper shadow size of a candlestick
 */
function getUpperShadow(candle: Candlestick): number {
  return candle.high - Math.max(candle.open, candle.close);
}

/**
 * Calculate the lower shadow size of a candlestick
 */
function getLowerShadow(candle: Candlestick): number {
  return Math.min(candle.open, candle.close) - candle.low;
}

/**
 * Calculate the total range of a candlestick
 */
function getTotalRange(candle: Candlestick): number {
  return candle.high - candle.low;
}

/**
 * Check if a candlestick is bullish (close > open)
 */
function isBullish(candle: Candlestick): boolean {
  return candle.close > candle.open;
}

/**
 * Check if a candlestick is bearish (close < open)
 */
function isBearish(candle: Candlestick): boolean {
  return candle.close < candle.open;
}

/**
 * Doji Pattern
 * 
 * A doji occurs when the open and close prices are very close or equal,
 * indicating indecision in the market.
 * 
 * @param candle - Candlestick data
 * @param threshold - Threshold for body size relative to total range (default: 0.1)
 * @returns Pattern result if doji is detected
 */
export function detectDoji(candle: Candlestick, threshold: number = 0.1): PatternResult | null {
  const bodySize = getBodySize(candle);
  const totalRange = getTotalRange(candle);
  
  if (totalRange === 0) return null;
  
  const bodyRatio = bodySize / totalRange;
  
  if (bodyRatio <= threshold) {
    return {
      pattern: 'Doji',
      bullish: false,
      bearish: false,
      confidence: 1 - bodyRatio,
      description: 'Indecision in the market, potential reversal signal'
    };
  }
  
  return null;
}

/**
 * Hammer Pattern
 * 
 * A hammer is a bullish reversal pattern with a small body at the top
 * and a long lower shadow, indicating potential upward reversal.
 * 
 * @param candle - Candlestick data
 * @param threshold - Threshold for shadow ratio (default: 2)
 * @returns Pattern result if hammer is detected
 */
export function detectHammer(candle: Candlestick, threshold: number = 2): PatternResult | null {
  const bodySize = getBodySize(candle);
  const lowerShadow = getLowerShadow(candle);
  const upperShadow = getUpperShadow(candle);
  const totalRange = getTotalRange(candle);
  
  if (totalRange === 0) return null;
  
  const bodyRatio = bodySize / totalRange;
  const lowerShadowRatio = lowerShadow / totalRange;
  const upperShadowRatio = upperShadow / totalRange;
  
  if (bodyRatio <= 0.3 && lowerShadowRatio >= 0.6 && upperShadowRatio <= 0.1) {
    return {
      pattern: 'Hammer',
      bullish: true,
      bearish: false,
      confidence: lowerShadowRatio,
      description: 'Bullish reversal pattern, potential upward movement'
    };
  }
  
  return null;
}

/**
 * Shooting Star Pattern
 * 
 * A shooting star is a bearish reversal pattern with a small body at the bottom
 * and a long upper shadow, indicating potential downward reversal.
 * 
 * @param candle - Candlestick data
 * @param threshold - Threshold for shadow ratio (default: 2)
 * @returns Pattern result if shooting star is detected
 */
export function detectShootingStar(candle: Candlestick, threshold: number = 2): PatternResult | null {
  const bodySize = getBodySize(candle);
  const lowerShadow = getLowerShadow(candle);
  const upperShadow = getUpperShadow(candle);
  const totalRange = getTotalRange(candle);
  
  if (totalRange === 0) return null;
  
  const bodyRatio = bodySize / totalRange;
  const lowerShadowRatio = lowerShadow / totalRange;
  const upperShadowRatio = upperShadow / totalRange;
  
  if (bodyRatio <= 0.3 && upperShadowRatio >= 0.6 && lowerShadowRatio <= 0.1) {
    return {
      pattern: 'Shooting Star',
      bullish: false,
      bearish: true,
      confidence: upperShadowRatio,
      description: 'Bearish reversal pattern, potential downward movement'
    };
  }
  
  return null;
}

/**
 * Engulfing Pattern (Bullish)
 * 
 * A bullish engulfing pattern occurs when a small bearish candle is followed
 * by a larger bullish candle that completely engulfs the previous candle.
 * 
 * @param prevCandle - Previous candlestick
 * @param currentCandle - Current candlestick
 * @returns Pattern result if bullish engulfing is detected
 */
export function detectBullishEngulfing(prevCandle: Candlestick, currentCandle: Candlestick): PatternResult | null {
  if (!isBearish(prevCandle) || !isBullish(currentCandle)) return null;
  
  const prevBodySize = getBodySize(prevCandle);
  const currentBodySize = getBodySize(currentCandle);
  
  if (currentBodySize > prevBodySize && 
      currentCandle.open < prevCandle.close && 
      currentCandle.close > prevCandle.open) {
    return {
      pattern: 'Bullish Engulfing',
      bullish: true,
      bearish: false,
      confidence: Math.min(currentBodySize / prevBodySize, 3),
      description: 'Bullish reversal pattern, strong buying pressure'
    };
  }
  
  return null;
}

/**
 * Engulfing Pattern (Bearish)
 * 
 * A bearish engulfing pattern occurs when a small bullish candle is followed
 * by a larger bearish candle that completely engulfs the previous candle.
 * 
 * @param prevCandle - Previous candlestick
 * @param currentCandle - Current candlestick
 * @returns Pattern result if bearish engulfing is detected
 */
export function detectBearishEngulfing(prevCandle: Candlestick, currentCandle: Candlestick): PatternResult | null {
  if (!isBullish(prevCandle) || !isBearish(currentCandle)) return null;
  
  const prevBodySize = getBodySize(prevCandle);
  const currentBodySize = getBodySize(currentCandle);
  
  if (currentBodySize > prevBodySize && 
      currentCandle.open > prevCandle.close && 
      currentCandle.close < prevCandle.open) {
    return {
      pattern: 'Bearish Engulfing',
      bullish: false,
      bearish: true,
      confidence: Math.min(currentBodySize / prevBodySize, 3),
      description: 'Bearish reversal pattern, strong selling pressure'
    };
  }
  
  return null;
}

/**
 * Morning Star Pattern
 * 
 * A morning star is a three-candle bullish reversal pattern consisting of
 * a long bearish candle, a small body candle (doji), and a long bullish candle.
 * 
 * @param candles - Array of three candlesticks
 * @returns Pattern result if morning star is detected
 */
export function detectMorningStar(candles: Candlestick[]): PatternResult | null {
  if (candles.length !== 3) return null;
  
  const [first, second, third] = candles;
  
  if (!isBearish(first) || !isBullish(third)) return null;
  
  const firstBodySize = getBodySize(first);
  const secondBodySize = getBodySize(second);
  const thirdBodySize = getBodySize(third);
  const firstRange = getTotalRange(first);
  const secondRange = getTotalRange(second);
  
  if (firstBodySize / firstRange >= 0.6 && 
      secondBodySize / secondRange <= 0.3 &&
      thirdBodySize >= firstBodySize * 0.5) {
    return {
      pattern: 'Morning Star',
      bullish: true,
      bearish: false,
      confidence: Math.min(thirdBodySize / firstBodySize, 2),
      description: 'Strong bullish reversal pattern, three-candle formation'
    };
  }
  
  return null;
}

/**
 * Evening Star Pattern
 * 
 * An evening star is a three-candle bearish reversal pattern consisting of
 * a long bullish candle, a small body candle (doji), and a long bearish candle.
 * 
 * @param candles - Array of three candlesticks
 * @returns Pattern result if evening star is detected
 */
export function detectEveningStar(candles: Candlestick[]): PatternResult | null {
  if (candles.length !== 3) return null;
  
  const [first, second, third] = candles;
  
  if (!isBullish(first) || !isBearish(third)) return null;
  
  const firstBodySize = getBodySize(first);
  const secondBodySize = getBodySize(second);
  const thirdBodySize = getBodySize(third);
  const firstRange = getTotalRange(first);
  const secondRange = getTotalRange(second);
  
  if (firstBodySize / firstRange >= 0.6 && 
      secondBodySize / secondRange <= 0.3 &&
      thirdBodySize >= firstBodySize * 0.5) {
    return {
      pattern: 'Evening Star',
      bullish: false,
      bearish: true,
      confidence: Math.min(thirdBodySize / firstBodySize, 2),
      description: 'Strong bearish reversal pattern, three-candle formation'
    };
  }
  
  return null;
}

/**
 * Harami Pattern (Bullish)
 * 
 * A bullish harami is a two-candle pattern where a small bullish candle
 * is contained within the body of the previous large bearish candle.
 * 
 * @param prevCandle - Previous candlestick
 * @param currentCandle - Current candlestick
 * @returns Pattern result if bullish harami is detected
 */
export function detectBullishHarami(prevCandle: Candlestick, currentCandle: Candlestick): PatternResult | null {
  if (!isBearish(prevCandle) || !isBullish(currentCandle)) return null;
  
  const prevBodySize = getBodySize(prevCandle);
  const currentBodySize = getBodySize(currentCandle);
  
  if (currentBodySize < prevBodySize * 0.5 &&
      currentCandle.open > prevCandle.close &&
      currentCandle.close < prevCandle.open) {
    return {
      pattern: 'Bullish Harami',
      bullish: true,
      bearish: false,
      confidence: 1 - (currentBodySize / prevBodySize),
      description: 'Bullish reversal pattern, indecision after bearish move'
    };
  }
  
  return null;
}

/**
 * Harami Pattern (Bearish)
 * 
 * A bearish harami is a two-candle pattern where a small bearish candle
 * is contained within the body of the previous large bullish candle.
 * 
 * @param prevCandle - Previous candlestick
 * @param currentCandle - Current candlestick
 * @returns Pattern result if bearish harami is detected
 */
export function detectBearishHarami(prevCandle: Candlestick, currentCandle: Candlestick): PatternResult | null {
  if (!isBullish(prevCandle) || !isBearish(currentCandle)) return null;
  
  const prevBodySize = getBodySize(prevCandle);
  const currentBodySize = getBodySize(currentCandle);
  
  if (currentBodySize < prevBodySize * 0.5 &&
      currentCandle.open < prevCandle.close &&
      currentCandle.close > prevCandle.open) {
    return {
      pattern: 'Bearish Harami',
      bullish: false,
      bearish: true,
      confidence: 1 - (currentBodySize / prevBodySize),
      description: 'Bearish reversal pattern, indecision after bullish move'
    };
  }
  
  return null;
}

/**
 * Three White Soldiers Pattern
 * 
 * Three white soldiers is a bullish continuation pattern consisting of
 * three consecutive long bullish candles with higher closes.
 * 
 * @param candles - Array of three candlesticks
 * @returns Pattern result if three white soldiers is detected
 */
export function detectThreeWhiteSoldiers(candles: Candlestick[]): PatternResult | null {
  if (candles.length !== 3) return null;
  
  const [first, second, third] = candles;
  
  if (!isBullish(first) || !isBullish(second) || !isBullish(third)) return null;
  
  const firstBodySize = getBodySize(first);
  const secondBodySize = getBodySize(second);
  const thirdBodySize = getBodySize(third);
  const firstRange = getTotalRange(first);
  const secondRange = getTotalRange(second);
  const thirdRange = getTotalRange(third);
  
  if (firstBodySize / firstRange >= 0.6 &&
      secondBodySize / secondRange >= 0.6 &&
      thirdBodySize / thirdRange >= 0.6 &&
      second.close > first.close &&
      third.close > second.close) {
    return {
      pattern: 'Three White Soldiers',
      bullish: true,
      bearish: false,
      confidence: Math.min(thirdBodySize / firstBodySize, 2),
      description: 'Strong bullish continuation pattern, three consecutive bullish candles'
    };
  }
  
  return null;
}

/**
 * Three Black Crows Pattern
 * 
 * Three black crows is a bearish continuation pattern consisting of
 * three consecutive long bearish candles with lower closes.
 * 
 * @param candles - Array of three candlesticks
 * @returns Pattern result if three black crows is detected
 */
export function detectThreeBlackCrows(candles: Candlestick[]): PatternResult | null {
  if (candles.length !== 3) return null;
  
  const [first, second, third] = candles;
  
  if (!isBearish(first) || !isBearish(second) || !isBearish(third)) return null;
  
  const firstBodySize = getBodySize(first);
  const secondBodySize = getBodySize(second);
  const thirdBodySize = getBodySize(third);
  const firstRange = getTotalRange(first);
  const secondRange = getTotalRange(second);
  const thirdRange = getTotalRange(third);
  
  if (firstBodySize / firstRange >= 0.6 &&
      secondBodySize / secondRange >= 0.6 &&
      thirdBodySize / thirdRange >= 0.6 &&
      second.close < first.close &&
      third.close < second.close) {
    return {
      pattern: 'Three Black Crows',
      bullish: false,
      bearish: true,
      confidence: Math.min(thirdBodySize / firstBodySize, 2),
      description: 'Strong bearish continuation pattern, three consecutive bearish candles'
    };
  }
  
  return null;
}

/**
 * Detect all patterns in a series of candlesticks
 * 
 * @param candles - Array of candlestick data
 * @returns Array of detected patterns
 */
export function detectAllPatterns(candles: Candlestick[]): PatternResult[] {
  const patterns: PatternResult[] = [];
  
  for (let i = 0; i < candles.length; i++) {
    const currentCandle = candles[i];
    
    // Single candle patterns
    const doji = detectDoji(currentCandle);
    if (doji) patterns.push(doji);
    
    const hammer = detectHammer(currentCandle);
    if (hammer) patterns.push(hammer);
    
    const shootingStar = detectShootingStar(currentCandle);
    if (shootingStar) patterns.push(shootingStar);
    
    // Two candle patterns
    if (i > 0) {
      const prevCandle = candles[i - 1];
      
      const bullishEngulfing = detectBullishEngulfing(prevCandle, currentCandle);
      if (bullishEngulfing) patterns.push(bullishEngulfing);
      
      const bearishEngulfing = detectBearishEngulfing(prevCandle, currentCandle);
      if (bearishEngulfing) patterns.push(bearishEngulfing);
      
      const bullishHarami = detectBullishHarami(prevCandle, currentCandle);
      if (bullishHarami) patterns.push(bullishHarami);
      
      const bearishHarami = detectBearishHarami(prevCandle, currentCandle);
      if (bearishHarami) patterns.push(bearishHarami);
    }
    
    // Three candle patterns
    if (i >= 2) {
      const threeCandles = candles.slice(i - 2, i + 1);
      
      const morningStar = detectMorningStar(threeCandles);
      if (morningStar) patterns.push(morningStar);
      
      const eveningStar = detectEveningStar(threeCandles);
      if (eveningStar) patterns.push(eveningStar);
      
      const threeWhiteSoldiers = detectThreeWhiteSoldiers(threeCandles);
      if (threeWhiteSoldiers) patterns.push(threeWhiteSoldiers);
      
      const threeBlackCrows = detectThreeBlackCrows(threeCandles);
      if (threeBlackCrows) patterns.push(threeBlackCrows);
    }
  }
  
  return patterns;
}

/**
 * Collection of candlestick pattern recognition functions
 */
export const PatternRecognition = {
  detectDoji,
  detectHammer,
  detectShootingStar,
  detectBullishEngulfing,
  detectBearishEngulfing,
  detectMorningStar,
  detectEveningStar,
  detectBullishHarami,
  detectBearishHarami,
  detectThreeWhiteSoldiers,
  detectThreeBlackCrows,
  detectAllPatterns
};
