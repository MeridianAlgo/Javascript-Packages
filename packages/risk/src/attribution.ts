/**
 * Performance attribution
 */

import { Series, Position } from '@meridianalgo/core';
import { MathUtils } from '@meridianalgo/utils';

export class PerformanceAttribution {
  /**
   * Factor exposure analysis
   */
  static factorExposure(
    returns: Series,
    factorReturns: Record<string, Series>
  ): Record<string, number> {
    const exposures: Record<string, number> = {};
    
    for (const [factorName, factorSeries] of Object.entries(factorReturns)) {
      if (factorSeries.length !== returns.length) continue;
      
      // Simple regression: return = alpha + beta * factor
      const beta = MathUtils.covariance(returns, factorSeries) / MathUtils.variance(factorSeries);
      exposures[factorName] = beta;
    }
    
    return exposures;
  }
  
  /**
   * Brinson attribution
   */
  static brinsonAttribution(
    portfolioWeights: Record<string, number>,
    portfolioReturns: Record<string, number>,
    benchmarkWeights: Record<string, number>,
    benchmarkReturns: Record<string, number>
  ): {
    allocation: number;
    selection: number;
    interaction: number;
    total: number;
  } {
    let allocation = 0;
    let selection = 0;
    let interaction = 0;
    
    const allSymbols = new Set([
      ...Object.keys(portfolioWeights),
      ...Object.keys(benchmarkWeights)
    ]);
    
    for (const symbol of allSymbols) {
      const pw = portfolioWeights[symbol] || 0;
      const pr = portfolioReturns[symbol] || 0;
      const bw = benchmarkWeights[symbol] || 0;
      const br = benchmarkReturns[symbol] || 0;
      
      // Calculate benchmark return
      const benchmarkReturn = Object.entries(benchmarkWeights)
        .reduce((sum, [s, w]) => sum + w * (benchmarkReturns[s] || 0), 0);
      
      // Allocation effect
      allocation += (pw - bw) * (br - benchmarkReturn);
      
      // Selection effect
      selection += bw * (pr - br);
      
      // Interaction effect
      interaction += (pw - bw) * (pr - br);
    }
    
    return {
      allocation,
      selection,
      interaction,
      total: allocation + selection + interaction
    };
  }
  
  /**
   * Contribution to return
   */
  static contributionToReturn(
    positions: Position[],
    returns: Record<string, number>
  ): Record<string, number> {
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const contributions: Record<string, number> = {};
    
    for (const position of positions) {
      const weight = totalValue > 0 ? position.marketValue / totalValue : 0;
      const ret = returns[position.symbol] || 0;
      contributions[position.symbol] = weight * ret;
    }
    
    return contributions;
  }
  
  /**
   * Contribution to risk
   */
  static contributionToRisk(
    positions: Position[],
    covarianceMatrix: number[][],
    symbols: string[]
  ): Record<string, number> {
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const weights: number[] = [];
    const contributions: Record<string, number> = {};
    
    // Build weight vector
    for (const symbol of symbols) {
      const position = positions.find(p => p.symbol === symbol);
      weights.push(position ? position.marketValue / totalValue : 0);
    }
    
    // Calculate portfolio variance
    let portfolioVariance = 0;
    for (let i = 0; i < symbols.length; i++) {
      for (let j = 0; j < symbols.length; j++) {
        portfolioVariance += weights[i] * weights[j] * covarianceMatrix[i][j];
      }
    }
    
    const portfolioVol = Math.sqrt(portfolioVariance);
    
    // Calculate marginal contribution to risk
    for (let i = 0; i < symbols.length; i++) {
      let marginalRisk = 0;
      for (let j = 0; j < symbols.length; j++) {
        marginalRisk += weights[j] * covarianceMatrix[i][j];
      }
      
      const contribution = portfolioVol > 0 ? weights[i] * marginalRisk / portfolioVol : 0;
      contributions[symbols[i]] = contribution;
    }
    
    return contributions;
  }
}
