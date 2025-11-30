/**
 * Performance metrics
 */

import { Series } from '@meridianalgo/core';
import { MathUtils } from '@meridianalgo/utils';
import { RiskMetrics } from './metrics';

export class PerformanceMetrics {
  /**
   * Sharpe Ratio
   */
  static sharpeRatio(returns: Series, riskFreeRate: number = 0, annualized: boolean = true): number {
    const excessReturns = returns.map(r => r - riskFreeRate / 252);
    const mean = MathUtils.mean(excessReturns);
    const std = MathUtils.std(excessReturns);
    
    if (std === 0) return 0;
    
    const sharpe = mean / std;
    return annualized ? sharpe * Math.sqrt(252) : sharpe;
  }
  
  /**
   * Sortino Ratio
   */
  static sortinoRatio(returns: Series, riskFreeRate: number = 0, annualized: boolean = true): number {
    const excessReturns = returns.map(r => r - riskFreeRate / 252);
    const mean = MathUtils.mean(excessReturns);
    const downsideDev = RiskMetrics.downsideDeviation(returns, riskFreeRate / 252, false);
    
    if (downsideDev === 0) return 0;
    
    const sortino = mean / downsideDev;
    return annualized ? sortino * Math.sqrt(252) : sortino;
  }
  
  /**
   * Calmar Ratio
   */
  static calmarRatio(returns: Series, equity: Series): number {
    const annualReturn = MathUtils.mean(returns) * 252;
    const maxDD = RiskMetrics.maxDrawdown(equity).value;
    
    return maxDD > 0 ? annualReturn / maxDD : 0;
  }
  
  /**
   * Information Ratio
   */
  static informationRatio(returns: Series, benchmarkReturns: Series, annualized: boolean = true): number {
    if (returns.length !== benchmarkReturns.length) {
      throw new Error('Returns and benchmark must have same length');
    }
    
    const activeReturns = returns.map((r, i) => r - benchmarkReturns[i]);
    const mean = MathUtils.mean(activeReturns);
    const std = MathUtils.std(activeReturns);
    
    if (std === 0) return 0;
    
    const ir = mean / std;
    return annualized ? ir * Math.sqrt(252) : ir;
  }
  
  /**
   * Alpha (Jensen's alpha)
   */
  static alpha(
    returns: Series,
    benchmarkReturns: Series,
    riskFreeRate: number = 0,
    annualized: boolean = true
  ): number {
    const beta = RiskMetrics.beta(returns, benchmarkReturns);
    const portfolioReturn = MathUtils.mean(returns);
    const benchmarkReturn = MathUtils.mean(benchmarkReturns);
    const rf = riskFreeRate / 252;
    
    const alpha = portfolioReturn - (rf + beta * (benchmarkReturn - rf));
    return annualized ? alpha * 252 : alpha;
  }
  
  /**
   * Omega Ratio
   */
  static omegaRatio(returns: Series, threshold: number = 0): number {
    const gains = returns.filter(r => r > threshold).reduce((sum, r) => sum + (r - threshold), 0);
    const losses = returns.filter(r => r < threshold).reduce((sum, r) => sum + (threshold - r), 0);
    
    return losses > 0 ? gains / losses : Infinity;
  }
  
  /**
   * Win rate
   */
  static winRate(returns: Series): number {
    const wins = returns.filter(r => r > 0).length;
    return returns.length > 0 ? wins / returns.length : 0;
  }
  
  /**
   * Profit factor
   */
  static profitFactor(returns: Series): number {
    const grossProfit = returns.filter(r => r > 0).reduce((sum, r) => sum + r, 0);
    const grossLoss = Math.abs(returns.filter(r => r < 0).reduce((sum, r) => sum + r, 0));
    
    return grossLoss > 0 ? grossProfit / grossLoss : Infinity;
  }
  
  /**
   * Average win / average loss
   */
  static avgWinLoss(returns: Series): number {
    const wins = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0);
    
    if (wins.length === 0 || losses.length === 0) return 0;
    
    const avgWin = MathUtils.mean(wins);
    const avgLoss = Math.abs(MathUtils.mean(losses));
    
    return avgLoss > 0 ? avgWin / avgLoss : Infinity;
  }
  
  /**
   * Expectancy
   */
  static expectancy(returns: Series): number {
    const winRate = this.winRate(returns);
    const avgWinLoss = this.avgWinLoss(returns);
    
    return winRate * avgWinLoss - (1 - winRate);
  }
  
  /**
   * Recovery factor
   */
  static recoveryFactor(returns: Series, equity: Series): number {
    const totalReturn = equity[equity.length - 1] / equity[0] - 1;
    const maxDD = RiskMetrics.maxDrawdown(equity).value;
    
    return maxDD > 0 ? totalReturn / maxDD : 0;
  }
  
  /**
   * Payoff ratio
   */
  static payoffRatio(returns: Series): number {
    return this.avgWinLoss(returns);
  }
}
