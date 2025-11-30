/**
 * Portfolio optimization types
 */

export interface OptimizationConstraints {
  minWeight?: number;
  maxWeight?: number;
  longOnly?: boolean;
  maxLeverage?: number;
  targetReturn?: number;
  targetRisk?: number;
  sectorLimits?: Record<string, number>;
  turnoverLimit?: number;
  groupConstraints?: GroupConstraint[];
}

export interface GroupConstraint {
  symbols: string[];
  minWeight?: number;
  maxWeight?: number;
}

export interface OptimizationResult {
  weights: number[];
  expectedReturn: number;
  expectedRisk: number;
  sharpe: number;
  success: boolean;
  iterations?: number;
  message?: string;
}

export interface PortfolioOptimizer {
  optimize(
    returns: number[][],
    symbols: string[],
    constraints: OptimizationConstraints
  ): OptimizationResult;
}
