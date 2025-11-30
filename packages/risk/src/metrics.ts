/**
 * Risk metrics
 */

import { Series, Position } from '@meridianalgo/core';
import { MathUtils, StatUtils } from '@meridianalgo/utils';

export class RiskMetrics {
  /**
   * Value at Risk (VaR)
   */
  static var(
    returns: Series,
    confidence: number,
    method: 'historical' | 'parametric' | 'monte-carlo' = 'historical'
  ): number {
    if (method === 'historical') {
      return MathUtils.percentile(returns, 1 - confidence);
    } else if (method === 'parametric') {
      const mean = MathUtils.mean(returns);
      const std = MathUtils.std(returns);
      const zScore = StatUtils.normalInv(1 - confidence);
      return mean + zScore * std;
    } else {
      // Monte Carlo
      const mean = MathUtils.mean(returns);
      const std = MathUtils.std(returns);
      const simulated: number[] = [];
      
      for (let i = 0; i < 10000; i++) {
        const z = this.randomNormal();
        simulated.push(mean + z * std);
      }
      
      return MathUtils.percentile(simulated, 1 - confidence);
    }
  }
  
  /**
   * Conditional Value at Risk (CVaR / Expected Shortfall)
   */
  static cvar(returns: Series, confidence: number): number {
    const varValue = this.var(returns, confidence, 'historical');
    const tailReturns = returns.filter(r => r <= varValue);
    return tailReturns.length > 0 ? MathUtils.mean(tailReturns) : varValue;
  }
  
  /**
   * Maximum drawdown
   */
  static maxDrawdown(equity: Series): {
    value: number;
    start: number;
    end: number;
    duration: number;
  } {
    let maxDD = 0;
    let peak = equity[0];
    let peakIdx = 0;
    let troughIdx = 0;
    let maxDDStart = 0;
    let maxDDEnd = 0;
    
    for (let i = 0; i < equity.length; i++) {
      if (equity[i] > peak) {
        peak = equity[i];
        peakIdx = i;
      }
      
      const dd = (peak - equity[i]) / peak;
      if (dd > maxDD) {
        maxDD = dd;
        troughIdx = i;
        maxDDStart = peakIdx;
        maxDDEnd = i;
      }
    }
    
    return {
      value: maxDD,
      start: maxDDStart,
      end: maxDDEnd,
      duration: maxDDEnd - maxDDStart
    };
  }
  
  /**
   * Volatility
   */
  static volatility(returns: Series, annualized: boolean = true): number {
    const vol = MathUtils.std(returns);
    return annualized ? vol * Math.sqrt(252) : vol;
  }
  
  /**
   * Beta vs benchmark
   */
  static beta(returns: Series, benchmarkReturns: Series): number {
    if (returns.length !== benchmarkReturns.length) {
      throw new Error('Returns and benchmark must have same length');
    }
    
    const cov = MathUtils.covariance(returns, benchmarkReturns);
    const benchmarkVar = MathUtils.variance(benchmarkReturns);
    
    return benchmarkVar > 0 ? cov / benchmarkVar : 0;
  }
  
  /**
   * Tracking error
   */
  static trackingError(returns: Series, benchmarkReturns: Series, annualized: boolean = true): number {
    if (returns.length !== benchmarkReturns.length) {
      throw new Error('Returns and benchmark must have same length');
    }
    
    const activeReturns = returns.map((r, i) => r - benchmarkReturns[i]);
    const te = MathUtils.std(activeReturns);
    
    return annualized ? te * Math.sqrt(252) : te;
  }
  
  /**
   * Downside deviation
   */
  static downsideDeviation(returns: Series, target: number = 0, annualized: boolean = true): number {
    const downsideReturns = returns.filter(r => r < target).map(r => r - target);
    
    if (downsideReturns.length === 0) return 0;
    
    const variance = downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length;
    const dd = Math.sqrt(variance);
    
    return annualized ? dd * Math.sqrt(252) : dd;
  }
  
  /**
   * Ulcer Index (drawdown-based risk measure)
   */
  static ulcerIndex(equity: Series): number {
    let peak = equity[0];
    const drawdowns: number[] = [];
    
    for (const value of equity) {
      if (value > peak) peak = value;
      const dd = ((peak - value) / peak) * 100;
      drawdowns.push(dd * dd);
    }
    
    const avgSquaredDD = drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length;
    return Math.sqrt(avgSquaredDD);
  }
  
  /**
   * Generate random normal variable (Box-Muller transform)
   */
  private static randomNormal(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}
