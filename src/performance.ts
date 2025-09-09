/**
 * Performance Metrics and Risk Management
 * 
 * This module provides performance metrics and risk management utilities for
 * quantitative finance applications including Sharpe ratio, Sortino ratio,
 * maximum drawdown, and other risk-adjusted return metrics.
 * 
 * @fileoverview Performance metrics and risk management utilities
 * @author MeridianAlgo
 * @version 1.0.0
 */

/**
 * Calculate returns from price data
 * 
 * @param prices - Array of price data
 * @param method - Method for calculating returns ('simple' or 'log')
 * @returns Array of returns
 */
function calculateReturns(prices: number[], method: 'simple' | 'log' = 'log'): number[] {
  if (prices.length < 2) return [];

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (method === 'log') {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    } else {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  return returns;
}

/**
 * Calculate cumulative returns
 * 
 * @param returns - Array of returns
 * @returns Array of cumulative returns
 */
function calculateCumulativeReturns(returns: number[]): number[] {
  if (returns.length === 0) return [];

  const cumulative: number[] = [1 + returns[0]];
  for (let i = 1; i < returns.length; i++) {
    cumulative.push(cumulative[i - 1] * (1 + returns[i]));
  }
  return cumulative;
}

/**
 * Sharpe Ratio
 * 
 * The Sharpe ratio measures the risk-adjusted return of an investment.
 * It's calculated as (portfolio return - risk-free rate) / standard deviation of returns.
 * 
 * @param returns - Array of returns
 * @param riskFreeRate - Risk-free rate (default: 0.02 for 2% annual)
 * @param annualized - Whether to annualize the ratio (default: true)
 * @returns Sharpe ratio value
 * 
 * @example
 * ```typescript
 * const returns = [0.01, 0.02, -0.01, 0.03, 0.015];
 * const sharpe = PerformanceMetrics.sharpeRatio(returns);
 * ```
 */
export function sharpeRatio(
  returns: number[], 
  riskFreeRate: number = 0.02, 
  annualized: boolean = true
): number {
  if (returns.length === 0) return 0;

  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  let excessReturn = meanReturn - (riskFreeRate / 252); // Daily risk-free rate
  if (annualized) {
    excessReturn *= 252; // Annualize
    return excessReturn / (stdDev * Math.sqrt(252));
  }

  return excessReturn / stdDev;
}

/**
 * Sortino Ratio
 * 
 * The Sortino ratio is similar to the Sharpe ratio but only considers downside deviation.
 * It's calculated as (portfolio return - risk-free rate) / downside deviation.
 * 
 * @param returns - Array of returns
 * @param riskFreeRate - Risk-free rate (default: 0.02 for 2% annual)
 * @param annualized - Whether to annualize the ratio (default: true)
 * @returns Sortino ratio value
 */
export function sortinoRatio(
  returns: number[], 
  riskFreeRate: number = 0.02, 
  annualized: boolean = true
): number {
  if (returns.length === 0) return 0;

  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const downsideReturns = returns.filter(ret => ret < 0);
  
  if (downsideReturns.length === 0) return Infinity;

  const downsideVariance = downsideReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / downsideReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);

  if (downsideDeviation === 0) return 0;

  let excessReturn = meanReturn - (riskFreeRate / 252); // Daily risk-free rate
  if (annualized) {
    excessReturn *= 252; // Annualize
    return excessReturn / (downsideDeviation * Math.sqrt(252));
  }

  return excessReturn / downsideDeviation;
}

/**
 * Maximum Drawdown
 * 
 * Maximum drawdown is the largest peak-to-trough decline in the value of a portfolio.
 * It's expressed as a percentage and measures the worst loss from a peak.
 * 
 * @param prices - Array of price data
 * @returns Object containing maximum drawdown and related metrics
 */
export function maxDrawdown(prices: number[]): {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  drawdownStart: number;
  drawdownEnd: number;
  recoveryTime: number;
} {
  if (prices.length === 0) {
    return {
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      drawdownStart: 0,
      drawdownEnd: 0,
      recoveryTime: 0
    };
  }

  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  let drawdownStart = 0;
  let drawdownEnd = 0;
  let peak = prices[0];
  let peakIndex = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
      peakIndex = i;
    } else {
      const drawdown = peak - prices[i];
      const drawdownPercent = (drawdown / peak) * 100;
      
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
        drawdownStart = peakIndex;
        drawdownEnd = i;
      }
    }
  }

  const recoveryTime = drawdownEnd - drawdownStart;

  return {
    maxDrawdown,
    maxDrawdownPercent,
    drawdownStart,
    drawdownEnd,
    recoveryTime
  };
}

/**
 * Calmar Ratio
 * 
 * The Calmar ratio is the annualized return divided by the maximum drawdown.
 * It measures risk-adjusted returns relative to the worst loss.
 * 
 * @param returns - Array of returns
 * @param maxDrawdownPercent - Maximum drawdown percentage
 * @returns Calmar ratio value
 */
export function calmarRatio(returns: number[], maxDrawdownPercent: number): number {
  if (returns.length === 0 || maxDrawdownPercent === 0) return 0;

  const annualizedReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length * 252;
  return annualizedReturn / (maxDrawdownPercent / 100);
}

/**
 * Information Ratio
 * 
 * The Information ratio measures the excess return per unit of tracking error.
 * It's calculated as (portfolio return - benchmark return) / tracking error.
 * 
 * @param portfolioReturns - Array of portfolio returns
 * @param benchmarkReturns - Array of benchmark returns
 * @returns Information ratio value
 */
export function informationRatio(portfolioReturns: number[], benchmarkReturns: number[]): number {
  if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length === 0) {
    return 0;
  }

  const excessReturns = portfolioReturns.map((ret, i) => ret - benchmarkReturns[i]);
  const meanExcessReturn = excessReturns.reduce((sum, ret) => sum + ret, 0) / excessReturns.length;
  
  const trackingError = Math.sqrt(
    excessReturns.reduce((sum, ret) => sum + Math.pow(ret - meanExcessReturn, 2), 0) / (excessReturns.length - 1)
  );

  if (trackingError === 0) return 0;

  return meanExcessReturn / trackingError;
}

/**
 * Value at Risk (VaR)
 * 
 * VaR measures the potential loss in value of a portfolio over a defined period
 * for a given confidence interval.
 * 
 * @param returns - Array of returns
 * @param confidence - Confidence level (default: 0.05 for 95% VaR)
 * @param method - Method for calculating VaR ('historical' or 'parametric')
 * @returns VaR value
 */
export function valueAtRisk(
  returns: number[], 
  confidence: number = 0.05, 
  method: 'historical' | 'parametric' = 'historical'
): number {
  if (returns.length === 0) return 0;

  if (method === 'historical') {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(confidence * sortedReturns.length);
    return Math.abs(sortedReturns[index]);
  } else {
    // Parametric method (assuming normal distribution)
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);
    
    // Z-score for the confidence level (approximate)
    const zScore = confidence === 0.05 ? 1.645 : confidence === 0.01 ? 2.326 : 1.96;
    return Math.abs(mean - zScore * stdDev);
  }
}

/**
 * Conditional Value at Risk (CVaR)
 * 
 * CVaR, also known as Expected Shortfall, is the expected loss given that
 * the loss exceeds the VaR threshold.
 * 
 * @param returns - Array of returns
 * @param confidence - Confidence level (default: 0.05 for 95% CVaR)
 * @returns CVaR value
 */
export function conditionalValueAtRisk(returns: number[], confidence: number = 0.05): number {
  if (returns.length === 0) return 0;

  const varValue = valueAtRisk(returns, confidence, 'historical');
  const tailReturns = returns.filter(ret => ret <= -varValue);
  
  if (tailReturns.length === 0) return varValue;

  return Math.abs(tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length);
}

/**
 * Beta
 * 
 * Beta measures the sensitivity of a portfolio's returns to market returns.
 * A beta of 1 means the portfolio moves with the market.
 * 
 * @param portfolioReturns - Array of portfolio returns
 * @param marketReturns - Array of market returns
 * @returns Beta value
 */
export function beta(portfolioReturns: number[], marketReturns: number[]): number {
  if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length < 2) {
    return 0;
  }

  const portfolioMean = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
  const marketMean = marketReturns.reduce((sum, ret) => sum + ret, 0) / marketReturns.length;

  let covariance = 0;
  let marketVariance = 0;

  for (let i = 0; i < portfolioReturns.length; i++) {
    const portfolioDiff = portfolioReturns[i] - portfolioMean;
    const marketDiff = marketReturns[i] - marketMean;
    
    covariance += portfolioDiff * marketDiff;
    marketVariance += marketDiff * marketDiff;
  }

  if (marketVariance === 0) return 0;

  return covariance / marketVariance;
}

/**
 * Alpha
 * 
 * Alpha measures the excess return of a portfolio relative to the return
 * predicted by the Capital Asset Pricing Model (CAPM).
 * 
 * @param portfolioReturns - Array of portfolio returns
 * @param marketReturns - Array of market returns
 * @param riskFreeRate - Risk-free rate (default: 0.02 for 2% annual)
 * @returns Alpha value
 */
export function alpha(
  portfolioReturns: number[], 
  marketReturns: number[], 
  riskFreeRate: number = 0.02
): number {
  if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length === 0) {
    return 0;
  }

  const portfolioMean = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
  const marketMean = marketReturns.reduce((sum, ret) => sum + ret, 0) / marketReturns.length;
  const betaValue = beta(portfolioReturns, marketReturns);
  const dailyRiskFreeRate = riskFreeRate / 252;

  return portfolioMean - (dailyRiskFreeRate + betaValue * (marketMean - dailyRiskFreeRate));
}

/**
 * Treynor Ratio
 * 
 * The Treynor ratio measures risk-adjusted returns relative to systematic risk (beta).
 * It's calculated as (portfolio return - risk-free rate) / beta.
 * 
 * @param returns - Array of returns
 * @param betaValue - Beta value of the portfolio
 * @param riskFreeRate - Risk-free rate (default: 0.02 for 2% annual)
 * @returns Treynor ratio value
 */
export function treynorRatio(
  returns: number[], 
  betaValue: number, 
  riskFreeRate: number = 0.02
): number {
  if (returns.length === 0 || betaValue === 0) return 0;

  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const annualizedReturn = meanReturn * 252;
  const annualizedRiskFreeRate = riskFreeRate;

  return (annualizedReturn - annualizedRiskFreeRate) / betaValue;
}

/**
 * Jensen's Alpha
 * 
 * Jensen's Alpha is the same as the regular alpha but is often used in the context
 * of evaluating fund managers' performance.
 * 
 * @param portfolioReturns - Array of portfolio returns
 * @param marketReturns - Array of market returns
 * @param riskFreeRate - Risk-free rate (default: 0.02 for 2% annual)
 * @returns Jensen's Alpha value
 */
export function jensensAlpha(
  portfolioReturns: number[], 
  marketReturns: number[], 
  riskFreeRate: number = 0.02
): number {
  return alpha(portfolioReturns, marketReturns, riskFreeRate);
}

/**
 * Tracking Error
 * 
 * Tracking error measures the standard deviation of the difference between
 * portfolio returns and benchmark returns.
 * 
 * @param portfolioReturns - Array of portfolio returns
 * @param benchmarkReturns - Array of benchmark returns
 * @returns Tracking error value
 */
export function trackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
  if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) {
    return 0;
  }

  const excessReturns = portfolioReturns.map((ret, i) => ret - benchmarkReturns[i]);
  const meanExcessReturn = excessReturns.reduce((sum, ret) => sum + ret, 0) / excessReturns.length;
  
  const variance = excessReturns.reduce((sum, ret) => sum + Math.pow(ret - meanExcessReturn, 2), 0) / (excessReturns.length - 1);
  return Math.sqrt(variance);
}

/**
 * Win Rate
 * 
 * Calculates the percentage of positive returns in a series.
 * 
 * @param returns - Array of returns
 * @returns Win rate as a percentage
 */
export function winRate(returns: number[]): number {
  if (returns.length === 0) return 0;

  const positiveReturns = returns.filter(ret => ret > 0).length;
  return (positiveReturns / returns.length) * 100;
}

/**
 * Average Win/Loss
 * 
 * Calculates the average win and average loss from a series of returns.
 * 
 * @param returns - Array of returns
 * @returns Object containing average win and average loss
 */
export function averageWinLoss(returns: number[]): { averageWin: number; averageLoss: number } {
  if (returns.length === 0) {
    return { averageWin: 0, averageLoss: 0 };
  }

  const wins = returns.filter(ret => ret > 0);
  const losses = returns.filter(ret => ret < 0);

  const averageWin = wins.length > 0 ? wins.reduce((sum, ret) => sum + ret, 0) / wins.length : 0;
  const averageLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, ret) => sum + ret, 0) / losses.length) : 0;

  return { averageWin, averageLoss };
}

/**
 * Profit Factor
 * 
 * Profit factor is the ratio of gross profit to gross loss.
 * A value greater than 1 indicates profitability.
 * 
 * @param returns - Array of returns
 * @returns Profit factor value
 */
export function profitFactor(returns: number[]): number {
  if (returns.length === 0) return 0;

  const wins = returns.filter(ret => ret > 0);
  const losses = returns.filter(ret => ret < 0);

  const grossProfit = wins.reduce((sum, ret) => sum + ret, 0);
  const grossLoss = Math.abs(losses.reduce((sum, ret) => sum + ret, 0));

  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;

  return grossProfit / grossLoss;
}

/**
 * Comprehensive performance analysis
 * 
 * @param prices - Array of price data
 * @param benchmarkPrices - Array of benchmark price data (optional)
 * @param riskFreeRate - Risk-free rate (default: 0.02 for 2% annual)
 * @returns Object containing all performance metrics
 */
export function performanceAnalysis(
  prices: number[],
  benchmarkPrices?: number[],
  riskFreeRate: number = 0.02
): {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  winRate: number;
  profitFactor: number;
  averageWinLoss: { averageWin: number; averageLoss: number };
  var95: number;
  cvar95: number;
  beta?: number;
  alpha?: number;
  informationRatio?: number;
  trackingError?: number;
} {
  const returns = calculateReturns(prices);
  const totalReturn = prices.length > 0 ? (prices[prices.length - 1] / prices[0]) - 1 : 0;
  const annualizedReturn = returns.length > 0 ? Math.pow(1 + totalReturn, 252 / returns.length) - 1 : 0;
  const volatility = returns.length > 0 ? Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret, 0), 0) / returns.length) * Math.sqrt(252) : 0;
  
  const sharpe = sharpeRatio(returns, riskFreeRate);
  const sortino = sortinoRatio(returns, riskFreeRate);
  const maxDD = maxDrawdown(prices);
  const calmar = calmarRatio(returns, maxDD.maxDrawdownPercent);
  const win = winRate(returns);
  const profit = profitFactor(returns);
  const avgWinLoss = averageWinLoss(returns);
  const var95 = valueAtRisk(returns, 0.05);
  const cvar95 = conditionalValueAtRisk(returns, 0.05);

  const result: any = {
    totalReturn,
    annualizedReturn,
    volatility,
    sharpeRatio: sharpe,
    sortinoRatio: sortino,
    maxDrawdown: maxDD.maxDrawdownPercent,
    calmarRatio: calmar,
    winRate: win,
    profitFactor: profit,
    averageWinLoss: avgWinLoss,
    var95,
    cvar95
  };

  if (benchmarkPrices && benchmarkPrices.length > 0) {
    const benchmarkReturns = calculateReturns(benchmarkPrices);
    result.beta = beta(returns, benchmarkReturns);
    result.alpha = alpha(returns, benchmarkReturns, riskFreeRate);
    result.informationRatio = informationRatio(returns, benchmarkReturns);
    result.trackingError = trackingError(returns, benchmarkReturns);
  }

  return result;
}

/**
 * Collection of performance metrics and risk management utilities
 */
export const PerformanceMetrics = {
  sharpeRatio,
  sortinoRatio,
  maxDrawdown,
  calmarRatio,
  informationRatio,
  valueAtRisk,
  conditionalValueAtRisk,
  beta,
  alpha,
  treynorRatio,
  jensensAlpha,
  trackingError,
  winRate,
  averageWinLoss,
  profitFactor,
  performanceAnalysis
};
