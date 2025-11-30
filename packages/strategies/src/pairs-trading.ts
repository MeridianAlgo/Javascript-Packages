/**
 * Pairs trading strategy
 */

import { Bar, Signal } from '@meridianalgo/core';
import { Indicators } from '@meridianalgo/indicators';
import { Strategy } from './types';

export interface PairsTradingParams {
  symbol1: string;
  symbol2: string;
  lookback: number;
  entryThreshold: number;
  exitThreshold: number;
}

export function pairsTrading(params: PairsTradingParams): Strategy {
  const { symbol1, symbol2, lookback, entryThreshold, exitThreshold } = params;
  const bars1: Bar[] = [];
  const bars2: Bar[] = [];
  
  return {
    id: 'pairs-trading',
    
    next(bar: Bar): Signal | null {
      if (bar.symbol === symbol1) {
        bars1.push(bar);
      } else if (bar.symbol === symbol2) {
        bars2.push(bar);
      }
      
      if (bars1.length < lookback || bars2.length < lookback) {
        return null;
      }
      
      // Calculate spread
      const prices1 = bars1.slice(-lookback).map(b => b.c);
      const prices2 = bars2.slice(-lookback).map(b => b.c);
      
      const spread = prices1.map((p, i) => p - prices2[i]);
      const mean = spread.reduce((a, b) => a + b, 0) / spread.length;
      const std = Math.sqrt(
        spread.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / spread.length
      );
      
      const currentSpread = prices1[prices1.length - 1] - prices2[prices2.length - 1];
      const zScore = std > 0 ? (currentSpread - mean) / std : 0;
      
      // Generate signals
      if (zScore > entryThreshold) {
        return { t: bar.t, value: -1, meta: { zScore, spread: currentSpread } };
      } else if (zScore < -entryThreshold) {
        return { t: bar.t, value: 1, meta: { zScore, spread: currentSpread } };
      } else if (Math.abs(zScore) < exitThreshold) {
        return { t: bar.t, value: 0, meta: { zScore, spread: currentSpread } };
      }
      
      return null;
    }
  };
}
