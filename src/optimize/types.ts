/**
 * Optimization types
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectiveFunction = (params: Record<string, any>) => Promise<number> | number;

export interface ParameterSpace {
  [key: string]: {
    type: 'continuous' | 'discrete' | 'categorical';
    min?: number;
    max?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values?: any[];
    step?: number;
  };
}

export interface ParameterOptimizationResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bestParams: Record<string, any>;
  bestScore: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allResults: Array<{ params: Record<string, any>; score: number }>;
  iterations: number;
}

export interface Optimizer {
  optimize(
    objective: ObjectiveFunction,
    space: ParameterSpace,
    options?: OptimizationOptions
  ): Promise<ParameterOptimizationResult>;
}

export interface OptimizationOptions {
  maxIterations?: number;
  parallel?: boolean;
  seed?: number;
}

