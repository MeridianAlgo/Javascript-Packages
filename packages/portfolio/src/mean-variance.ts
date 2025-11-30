/**
 * Mean-variance optimization
 */

import { MathUtils } from '@meridianalgo/utils';
import { PortfolioOptimizer, OptimizationConstraints, OptimizationResult } from './types';

export class MeanVarianceOptimizer implements PortfolioOptimizer {
  optimize(
    returns: number[][],
    symbols: string[],
    constraints: OptimizationConstraints
  ): OptimizationResult {
    const n = symbols.length;
    
    // Calculate expected returns and covariance
    const expectedReturns = this.calculateExpectedReturns(returns);
    const covariance = this.calculateCovariance(returns);
    
    // Initialize weights (equal weight)
    let weights = new Array(n).fill(1 / n);
    
    // Apply constraints
    if (constraints.longOnly) {
      weights = weights.map(w => Math.max(0, w));
    }
    
    // Normalize weights
    const sum = weights.reduce((a, b) => a + b, 0);
    weights = weights.map(w => w / sum);
    
    // Simple gradient descent optimization
    const learningRate = 0.01;
    const maxIterations = 1000;
    
    for (let iter = 0; iter < maxIterations; iter++) {
      // Calculate portfolio metrics
      const portReturn = this.portfolioReturn(weights, expectedReturns);
      const portRisk = this.portfolioRisk(weights, covariance);
      
      // Calculate gradient (maximize Sharpe ratio)
      const gradient = this.calculateGradient(weights, expectedReturns, covariance);
      
      // Update weights
      for (let i = 0; i < n; i++) {
        weights[i] += learningRate * gradient[i];
      }
      
      // Apply constraints
      weights = this.applyConstraints(weights, constraints);
    }
    
    // Calculate final metrics
    const expectedReturn = this.portfolioReturn(weights, expectedReturns);
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
  
  private calculateExpectedReturns(returns: number[][]): number[] {
    const n = returns[0].length;
    const expectedReturns: number[] = [];
    
    for (let i = 0; i < n; i++) {
      const assetReturns = returns.map(r => r[i]);
      expectedReturns.push(MathUtils.mean(assetReturns));
    }
    
    return expectedReturns;
  }
  
  private calculateCovariance(returns: number[][]): number[][] {
    const n = returns[0].length;
    const covariance: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    const means = this.calculateExpectedReturns(returns);
    
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
  
  private portfolioReturn(weights: number[], expectedReturns: number[]): number {
    return weights.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
  }
  
  private portfolioRisk(weights: number[], covariance: number[][]): number {
    let variance = 0;
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        variance += weights[i] * weights[j] * covariance[i][j];
      }
    }
    return Math.sqrt(Math.max(0, variance));
  }
  
  private calculateGradient(
    weights: number[],
    expectedReturns: number[],
    covariance: number[][]
  ): number[] {
    const n = weights.length;
    const gradient: number[] = [];
    
    const portReturn = this.portfolioReturn(weights, expectedReturns);
    const portRisk = this.portfolioRisk(weights, covariance);
    
    for (let i = 0; i < n; i++) {
      // Gradient of Sharpe ratio
      let dRisk = 0;
      for (let j = 0; j < n; j++) {
        dRisk += weights[j] * covariance[i][j];
      }
      dRisk = portRisk > 0 ? dRisk / portRisk : 0;
      
      const dSharpe = portRisk > 0
        ? (expectedReturns[i] - portReturn * dRisk) / portRisk
        : 0;
      
      gradient.push(dSharpe);
    }
    
    return gradient;
  }
  
  private applyConstraints(
    weights: number[],
    constraints: OptimizationConstraints
  ): number[] {
    let result = [...weights];
    
    // Long only
    if (constraints.longOnly) {
      result = result.map(w => Math.max(0, w));
    }
    
    // Min/max weight
    if (constraints.minWeight !== undefined) {
      result = result.map(w => Math.max(constraints.minWeight!, w));
    }
    if (constraints.maxWeight !== undefined) {
      result = result.map(w => Math.min(constraints.maxWeight!, w));
    }
    
    // Normalize to sum to 1
    const sum = result.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      result = result.map(w => w / sum);
    }
    
    // Max leverage
    if (constraints.maxLeverage !== undefined) {
      const leverage = result.reduce((sum, w) => sum + Math.abs(w), 0);
      if (leverage > constraints.maxLeverage) {
        result = result.map(w => w * constraints.maxLeverage / leverage);
      }
    }
    
    return result;
  }
}
