/**
 * Stress testing
 */

import { Position } from '@meridianalgo/core';

export class StressTesting {
  /**
   * Scenario analysis
   */
  static scenario(
    portfolio: Position[],
    shocks: Record<string, number>
  ): { pnl: number; newValue: number; breakdown: Record<string, number> } {
    let totalPnl = 0;
    let newValue = 0;
    const breakdown: Record<string, number> = {};
    
    for (const position of portfolio) {
      const shock = shocks[position.symbol] || 0;
      const positionPnl = position.qty * position.avgPrice * shock;
      const positionNewValue = position.qty * position.avgPrice * (1 + shock);
      
      totalPnl += positionPnl;
      newValue += positionNewValue;
      breakdown[position.symbol] = positionPnl;
    }
    
    return { pnl: totalPnl, newValue, breakdown };
  }
  
  /**
   * Historical stress test
   */
  static historical(
    portfolio: Position[],
    historicalEvent: { date: Date; returns: Record<string, number> }
  ): { pnl: number; breakdown: Record<string, number> } {
    return this.scenario(portfolio, historicalEvent.returns);
  }
  
  /**
   * Monte Carlo stress test
   */
  static monteCarlo(
    portfolio: Position[],
    meanReturns: Record<string, number>,
    volatilities: Record<string, number>,
    correlations: number[][],
    simulations: number,
    horizon: number
  ): {
    scenarios: number[];
    var95: number;
    cvar95: number;
    worstCase: number;
    bestCase: number;
  } {
    const symbols = portfolio.map(p => p.symbol);
    const scenarios: number[] = [];
    
    for (let sim = 0; sim < simulations; sim++) {
      // Generate correlated random returns
      const randomReturns = this.generateCorrelatedReturns(
        symbols,
        meanReturns,
        volatilities,
        correlations,
        horizon
      );
      
      // Calculate portfolio PnL
      let pnl = 0;
      for (const position of portfolio) {
        const ret = randomReturns[position.symbol] || 0;
        pnl += position.qty * position.avgPrice * ret;
      }
      
      scenarios.push(pnl);
    }
    
    scenarios.sort((a, b) => a - b);
    
    const var95Index = Math.floor(simulations * 0.05);
    const var95 = scenarios[var95Index];
    
    const tailScenarios = scenarios.slice(0, var95Index);
    const cvar95 = tailScenarios.reduce((a, b) => a + b, 0) / tailScenarios.length;
    
    return {
      scenarios,
      var95,
      cvar95,
      worstCase: scenarios[0],
      bestCase: scenarios[scenarios.length - 1]
    };
  }
  
  /**
   * Generate correlated random returns
   */
  private static generateCorrelatedReturns(
    symbols: string[],
    meanReturns: Record<string, number>,
    volatilities: Record<string, number>,
    correlations: number[][],
    horizon: number
  ): Record<string, number> {
    const n = symbols.length;
    
    // Generate independent normal variables
    const z: number[] = [];
    for (let i = 0; i < n; i++) {
      z.push(this.randomNormal());
    }
    
    // Apply Cholesky decomposition (simplified - assumes correlation matrix is valid)
    const L = this.choleskyDecomposition(correlations);
    
    // Transform to correlated variables
    const correlatedZ: number[] = [];
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j <= i; j++) {
        sum += L[i][j] * z[j];
      }
      correlatedZ.push(sum);
    }
    
    // Convert to returns
    const returns: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const symbol = symbols[i];
      const mean = meanReturns[symbol] || 0;
      const vol = volatilities[symbol] || 0;
      
      returns[symbol] = mean * horizon + vol * Math.sqrt(horizon) * correlatedZ[i];
    }
    
    return returns;
  }
  
  /**
   * Cholesky decomposition (simplified)
   */
  private static choleskyDecomposition(matrix: number[][]): number[][] {
    const n = matrix.length;
    const L: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;
        
        if (j === i) {
          for (let k = 0; k < j; k++) {
            sum += L[j][k] * L[j][k];
          }
          L[j][j] = Math.sqrt(Math.max(matrix[j][j] - sum, 0));
        } else {
          for (let k = 0; k < j; k++) {
            sum += L[i][k] * L[j][k];
          }
          L[i][j] = L[j][j] > 0 ? (matrix[i][j] - sum) / L[j][j] : 0;
        }
      }
    }
    
    return L;
  }
  
  /**
   * Random normal variable
   */
  private static randomNormal(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}
