/**
 * Mean reversion strategy
 */

import { Bar, Signal } from '@meridianalgo/core';
import { Indicators } from '@meridianalgo/indicators';
import { Strategy } from './types';

export interface MeanReversionParams {
  period: number;
  stdDev: number;
  rsiPeriod?: number;
  rsiOversold?: number;
  rsiOverbought?: number;
}

export function meanReversion(params: MeanReversionParams): Strategy {
  const { period, stdDev, rsiPeriod = 14, rsiOversold = 30, rsiOverbought = 70 } = params;
  const bars: Bar[] = [];
  
  return {
    id: 'mean-reversion',
    
    init(historicalBars: Bar[]) {
      bars.push(...historicalBars);
    },
    
    next(bar: Bar): Signal | null {
      bars.push(bar);
      
      if (bars.length < Math.max(period, rsiPeriod)) {
        return null;
      }
      
      const closes = bars.map(b => b.c);
      
      // Calculate Bollinger Bands
      const bb = Indicators.bollingerBands(closes, period, stdDev);
      const rsi = Indicators.rsi(closes, rsiPeriod);
      
      const currentPrice = bar.c;
      const currentLower = bb.lower[bb.lower.length - 1];
      const currentUpper = bb.upper[bb.upper.length - 1];
      const currentRSI = rsi[rsi.length - 1];
      
      // Buy signal: price below lower band and RSI oversold
      if (currentPrice < currentLower && currentRSI < rsiOversold) {
        return {
          t: bar.t,
          value: 1,
          strength: (currentLower - currentPrice) / currentLower,
          meta: { rsi: currentRSI, bb: 'lower' }
        };
      }
      
      // Sell signal: price above upper band and RSI overbought
      if (currentPrice > currentUpper && currentRSI > rsiOverbought) {
        return {
          t: bar.t,
          value: -1,
          strength: (currentPrice - currentUpper) / currentUpper,
          meta: { rsi: currentRSI, bb: 'upper' }
        };
      }
      
      return {
        t: bar.t,
        value: 0
      };
    },
    
    generate(historicalBars: Bar[]): Signal[] {
      const signals: Signal[] = [];
      
      for (const bar of historicalBars) {
        const signal = this.next(bar);
        if (signal) {
          signals.push(signal);
        }
      }
      
      return signals;
    }
  };
}
