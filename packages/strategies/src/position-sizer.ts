/**
 * Position sizing
 */

import { Signal } from '@meridianalgo/core';

export class PositionSizer {
  /**
   * Kelly criterion
   */
  static kelly(
    signal: Signal,
    winRate: number,
    avgWin: number,
    avgLoss: number,
    fraction: number = 0.5
  ): number {
    if (signal.value === 0) return 0;
    
    const q = 1 - winRate;
    const b = avgWin / avgLoss;
    
    const kellyFraction = (winRate * b - q) / b;
    const adjustedFraction = Math.max(0, Math.min(1, kellyFraction * fraction));
    
    return adjustedFraction * Math.sign(signal.value);
  }
  
  /**
   * Volatility targeting
   */
  static volTarget(
    signal: Signal,
    targetVol: number,
    currentVol: number,
    capital: number
  ): number {
    if (signal.value === 0 || currentVol === 0) return 0;
    
    const scaleFactor = targetVol / currentVol;
    return capital * scaleFactor * signal.value;
  }
  
  /**
   * Drawdown-aware sizing
   */
  static drawdownAware(
    signal: Signal,
    currentDrawdown: number,
    maxDrawdown: number,
    baseSize: number
  ): number {
    if (signal.value === 0) return 0;
    
    const ddRatio = currentDrawdown / maxDrawdown;
    const scaleFactor = Math.max(0, 1 - ddRatio);
    
    return baseSize * scaleFactor * signal.value;
  }
  
  /**
   * Fixed fractional sizing
   */
  static fixedFractional(
    signal: Signal,
    capital: number,
    fraction: number = 0.1
  ): number {
    if (signal.value === 0) return 0;
    return capital * fraction * signal.value;
  }
  
  /**
   * Risk-based sizing (based on stop loss)
   */
  static riskBased(
    signal: Signal,
    capital: number,
    riskPerTrade: number,
    entryPrice: number,
    stopPrice: number
  ): number {
    if (signal.value === 0 || entryPrice === stopPrice) return 0;
    
    const riskPerShare = Math.abs(entryPrice - stopPrice);
    const riskAmount = capital * riskPerTrade;
    const shares = riskAmount / riskPerShare;
    
    return shares * Math.sign(signal.value);
  }
}
