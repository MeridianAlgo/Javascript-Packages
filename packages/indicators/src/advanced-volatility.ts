/**
 * Advanced volatility indicators
 */

import { Series } from '@meridianalgo/core';

export interface GarchResult {
  volatility: Series;
  params: { omega: number; alpha: number; beta: number };
  logLikelihood: number;
}

export interface GarchOptions {
  omega?: number;
  alpha?: number;
  beta?: number;
  maxIter?: number;
}

export class AdvancedVolatilityIndicators {
  /**
   * GARCH(1,1) volatility model
   * Simplified implementation using method of moments
   */
  static garch(returns: Series, options: GarchOptions = {}): GarchResult {
    const { maxIter = 100 } = options;
    
    // Initial parameter estimates using method of moments
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    let omega = variance * 0.01;
    let alpha = 0.1;
    let beta = 0.85;
    
    // Ensure stationarity: alpha + beta < 1
    if (alpha + beta >= 1) {
      alpha = 0.1;
      beta = 0.8;
    }
    
    const volatility: number[] = [];
    let h = variance; // Initial variance
    
    for (let i = 0; i < returns.length; i++) {
      volatility.push(Math.sqrt(h));
      
      // GARCH(1,1): h_t = omega + alpha * epsilon_{t-1}^2 + beta * h_{t-1}
      const epsilon = returns[i] - mean;
      h = omega + alpha * Math.pow(epsilon, 2) + beta * h;
      
      // Ensure positive variance
      h = Math.max(h, 1e-6);
    }
    
    // Calculate log-likelihood
    let logLikelihood = 0;
    for (let i = 0; i < returns.length; i++) {
      const epsilon = returns[i] - mean;
      const h = Math.pow(volatility[i], 2);
      logLikelihood += -0.5 * (Math.log(2 * Math.PI) + Math.log(h) + Math.pow(epsilon, 2) / h);
    }
    
    return {
      volatility,
      params: { omega, alpha, beta },
      logLikelihood
    };
  }
  
  /**
   * EWMA (Exponentially Weighted Moving Average) volatility
   */
  static ewmaVol(returns: Series, lambda: number = 0.94): Series {
    const volatility: number[] = [];
    
    // Initial variance
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    let variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    for (const ret of returns) {
      volatility.push(Math.sqrt(variance));
      
      // EWMA: var_t = lambda * var_{t-1} + (1 - lambda) * r_{t-1}^2
      variance = lambda * variance + (1 - lambda) * Math.pow(ret, 2);
    }
    
    return volatility;
  }
  
  /**
   * Realized volatility (standard deviation of returns)
   */
  static realizedVol(returns: Series, period: number, annualized: boolean = true): Series {
    const volatility: number[] = [];
    
    for (let i = period - 1; i < returns.length; i++) {
      const slice = returns.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / slice.length;
      const vol = Math.sqrt(variance);
      
      volatility.push(annualized ? vol * Math.sqrt(252) : vol);
    }
    
    return volatility;
  }
}
