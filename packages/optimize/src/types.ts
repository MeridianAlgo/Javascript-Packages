/**
 * Optimization types
 */

export type ObjectiveFunction = (params: Record<string, any>) => Promise<number> | number;

export interface ParameterSpace {
  [key: string]: {
    type: 'continuous' | 'discrete' | 'categorical';
    min?: number;
    max?: number;
    values?: any[];
    step?: number;
  };
}

export interface OptimizationResult {
  bestParams: Record<string, any>;
  bestScore: number;
  allResults: Array<{ params: Record<string, any>; score: number }>;
  iterations: number;
}

export interface Optimizer {
  optimize(
    objective: ObjectiveFunction,
    space: ParameterSpace,
    options?: OptimizationOptions
  ): Promise<OptimizationResult>;
}

export interface OptimizationOptions {
  maxIterations?: number;
  parallel?: boolean;
  seed?: number;
}
