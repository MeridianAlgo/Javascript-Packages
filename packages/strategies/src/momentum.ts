/**
 * Momentum strategy
 */

import { Bar, Signal } from '@meridianalgo/core';
import { Strategy } from './types';

export interface MomentumParams {
  lookback: number;
  topN: number;
  rebalancePeriod: number;
}

export function momentum(params: MomentumParams): Strategy {
  const { lookback, topN, rebalancePeriod } = params;
  const bars: Map<string, Bar[]> = new Map();
  let daysSinceRebalance = 0;
  
  return {
    id: 'momentum',
    
    next(bar: Bar): Signal | null {
      const symbol = bar.symbol || 'UNKNOWN';
      
      if (!bars.has(symbol)) {
        bars.set(symbol, []);
      }
      bars.get(symbol)!.push(bar);
      
      daysSinceRebalance++;
      
      if (daysSinceRebalance < rebalancePeriod) {
        return null;
      }
      
      daysSinceRebalance = 0;
      
      // Calculate momentum for all symbols
      const momentumScores: Array<{ symbol: string; momentum: number }> = [];
      
      for (const [sym, symBars] of bars.entries()) {
        if (symBars.length >= lookback) {
          const oldPrice = symBars[symBars.length - lookback].c;
          const newPrice = symBars[symBars.length - 1].c;
          const momentum = (newPrice - oldPrice) / oldPrice;
          momentumScores.push({ symbol: sym, momentum });
        }
      }
      
      // Sort by momentum
      momentumScores.sort((a, b) => b.momentum - a.momentum);
      
      // Top N get buy signal
      const topSymbols = new Set(momentumScores.slice(0, topN).map(s => s.symbol));
      
      if (topSymbols.has(symbol)) {
        return { t: bar.t, value: 1 };
      } else {
        return { t: bar.t, value: 0 };
      }
    }
  };
}
