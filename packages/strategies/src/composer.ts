/**
 * Strategy composition
 */

import { Bar, Signal } from '@meridianalgo/core';
import { Strategy } from './types';

export class StrategyComposer {
  /**
   * Weighted blend of strategies
   */
  static blend(strategies: Strategy[], weights: number[]): Strategy {
    if (strategies.length !== weights.length) {
      throw new Error('Strategies and weights must have same length');
    }
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    return {
      id: 'blended-strategy',
      
      init(bars: Bar[]) {
        strategies.forEach(s => s.init?.(bars));
      },
      
      next(bar: Bar): Signal | null {
        const signals = strategies.map(s => s.next(bar));
        
        let weightedValue = 0;
        let count = 0;
        
        signals.forEach((signal, i) => {
          if (signal) {
            weightedValue += signal.value * normalizedWeights[i];
            count++;
          }
        });
        
        if (count === 0) return null;
        
        return {
          t: bar.t,
          value: weightedValue
        };
      }
    };
  }
  
  /**
   * Voting ensemble
   */
  static vote(strategies: Strategy[], threshold: number = 0.5): Strategy {
    return {
      id: 'voting-strategy',
      
      init(bars: Bar[]) {
        strategies.forEach(s => s.init?.(bars));
      },
      
      next(bar: Bar): Signal | null {
        const signals = strategies.map(s => s.next(bar)).filter(s => s !== null) as Signal[];
        
        if (signals.length === 0) return null;
        
        const buyVotes = signals.filter(s => s.value > 0).length;
        const sellVotes = signals.filter(s => s.value < 0).length;
        const totalVotes = signals.length;
        
        if (buyVotes / totalVotes >= threshold) {
          return { t: bar.t, value: 1 };
        } else if (sellVotes / totalVotes >= threshold) {
          return { t: bar.t, value: -1 };
        }
        
        return { t: bar.t, value: 0 };
      }
    };
  }
  
  /**
   * Regime-based gating
   */
  static regimeGate(
    strategies: Strategy[],
    regimeDetector: (bars: Bar[]) => number,
    regimeMap: Record<number, number>
  ): Strategy {
    const bars: Bar[] = [];
    
    return {
      id: 'regime-gated-strategy',
      
      init(historicalBars: Bar[]) {
        bars.push(...historicalBars);
        strategies.forEach(s => s.init?.(historicalBars));
      },
      
      next(bar: Bar): Signal | null {
        bars.push(bar);
        
        const regime = regimeDetector(bars);
        const strategyIndex = regimeMap[regime];
        
        if (strategyIndex === undefined || !strategies[strategyIndex]) {
          return null;
        }
        
        return strategies[strategyIndex].next(bar);
      }
    };
  }
}
