/**
 * Risk parity optimization
 */

import { PortfolioOptimizer, OptimizationConstraints, OptimizationResult } from './types';

export class RiskParityOptimizer implements PortfolioOptimizer {
  optimize(
    returns: number[][],
    symbols: string[],
    constraints: OptimizationConstraints
  ): OptimizationResult {
    const n = symbols.length;
    
    // Calculate covariance matrix
    const covariance = this.calculateCovariance(returns);
    
    // Initialize weights (equal weight)
    let weights = new Array(n).fill(1 / n);
    
    // Iterative optimization to equalize risk contributions
    const maxIterations = 1000;
    const tolerance = 1e-6;
    
    for (let iter = 0; iter < maxIterations; iter++) {
      const oldWeights = [...weights];
      
      // Calculate risk contributions
      const riskContributions = this.calculateRiskContributions(weights, covariance);
      const totalRisk = riskContributions.reduce((a, b) => a + b, 0);
      
      // Target risk contribution (equal for all assets)
      const targetContribution = totalRisk / n;
      
      // Adjust weights to equalize risk contributions
      for (let i = 0; i < n; i++) {
        if (riskContributions[i] > 0) {
          weights[i] *= Math.sqrt(targetContribution / riskContributions[i]);
        }
      }
      
      // Normalize weights
      const sum = weights.reduce((a, b) => a + b, 0);
      weights = weights.map(w => w / sum);
      
      // Check convergence
      const change = weights.reduce((sum, w, i) => sum + Math.abs(w - oldWeights[i]), 0);
      if (change < tolerance) break;
    }
    
    // Calculate final metrics
    const expectedReturns = this.calculateExpectedReturns(returns);
    const expectedReturn = weights.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
    const expectedRisk = this.portfolioRisk(weights, covariance);
    const sharpe = expectedRisk > 0 ? expectedReturn / expectedRisk : 0;
    
    return {
      weights,
      expectedReturn,
      expectedRisk,
      sharpe,
      success: true,
      iterations: maxIterations
    };
  }
  
  private calculateCovariance(returns: number[][]): number[][] {
    const n = returns[0].length;
    const covariance: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    const means: number[] = [];
    for (let i = 0; i < n; i++) {
      const assetReturns = returns.map(r => r[i]);
      means.push(assetReturns.reduce((a, b) => a + b, 0) / assetReturns.length);
    }
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let cov = 0;
        for (const ret of returns) {
          cov += (ret[i] - means[i]) * (ret[j] - means[j]);
        }
        covariance[i][j] = cov / (returns.length - 1);
      }
    }
    
    return covariance;
  }
  
  private calculateExpectedReturns(returns: number[][]): number[] {
    const n = returns[0].length;
    const expectedReturns: number[] = [];
    
    for (let i = 0; i < n; i++) {
      const assetReturns = returns.map(r => r[i]);
      expectedReturns.push(assetReturns.reduce((a, b) => a + b, 0) / assetReturns.length);
    }
    
    return expectedReturns;
  }
  
  private calculateRiskContributions(weights: number[], covariance: number[][]): number[] {
    const n = weights.length;
    const portfolioVariance = this.portfolioVariance(weights, covariance);
    const portfolioVol = Math.sqrt(Math.max(0, portfolioVariance));
    
    const contributions: number[] = [];
    
    for (let i = 0; i < n; i++) {
      let marginalRisk = 0;
      for (let j = 0; j < n; j++) {
        marginalRisk += weights[j] * covariance[i][j];
      }
      
      const contribution = portfolioVol > 0 ? weights[i] * marginalRisk / portfolioVol : 0;
      contributions.push(contribution);
    }
    
    return contributions;
  }
  
  private portfolioVariance(weights: number[], covariance: number[][]): number {
    let variance = 0;
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        variance += weights[i] * weights[j] * covariance[i][j];
      }
    }
    return variance;
  }
  
  private portfolioRisk(weights: number[], covariance: number[][]): number {
    return Math.sqrt(Math.max(0, this.portfolioVariance(weights, covariance)));
  }
}
