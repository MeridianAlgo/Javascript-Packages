/**
 * Trend following strategy
 */

import { Bar, Signal } from '@meridianalgo/core';
import { Indicators } from '@meridianalgo/indicators';
import { Strategy } from './types';

export interface TrendFollowingParams {
  fastPeriod: number;
  slowPeriod: number;
  maType?: 'sma' | 'ema';
}

export function trendFollowing(params: TrendFollowingParams): Strategy {
  const { fastPeriod, slowPeriod, maType = 'ema' } = params;
  const bars: Bar[] = [];
  
  return {
    id: 'trend-following',
    
    init(historicalBars: Bar[]) {
      bars.push(...historicalBars);
    },
    
    next(bar: Bar): Signal | null {
      bars.push(bar);
      
      if (bars.length < slowPeriod) {
        return null;
      }
      
      const closes = bars.map(b => b.c);
      
      let fastMA: number[];
      let slowMA: number[];
      
      if (maType === 'sma') {
        fastMA = Indicators.sma(closes, fastPeriod);
        slowMA = Indicators.sma(closes, slowPeriod);
      } else {
        fastMA = Indicators.ema(closes, fastPeriod);
        slowMA = Indicators.ema(closes, slowPeriod);
      }
      
      const currentFast = fastMA[fastMA.length - 1];
      const currentSlow = slowMA[slowMA.length - 1];
      const prevFast = fastMA[fastMA.length - 2];
      const prevSlow = slowMA[slowMA.length - 2];
      
      // Crossover logic
      if (prevFast <= prevSlow && currentFast > currentSlow) {
        // Bullish crossover
        return {
          t: bar.t,
          value: 1,
          strength: Math.abs(currentFast - currentSlow) / currentSlow
        };
      } else if (prevFast >= prevSlow && currentFast < currentSlow) {
        // Bearish crossover
        return {
          t: bar.t,
          value: -1,
          strength: Math.abs(currentFast - currentSlow) / currentSlow
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
