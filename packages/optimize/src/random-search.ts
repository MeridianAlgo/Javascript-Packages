/**
 * Random search optimizer
 */

import { Optimizer, ObjectiveFunction, ParameterSpace, OptimizationResult, OptimizationOptions } from './types';

export class RandomSearchOptimizer implements Optimizer {
  constructor(private iterations: number = 100) {}
  
  async optimize(
    objective: ObjectiveFunction,
    space: ParameterSpace,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const maxIter = options.maxIterations || this.iterations;
    const results: Array<{ params: Record<string, any>; score: number }> = [];
    
    for (let i = 0; i < maxIter; i++) {
      const params = this.sampleParams(space);
      const score = await objective(params);
      results.push({ params, score });
    }
    
    // Find best
    results.sort((a, b) => b.score - a.score);
    
    return {
      bestParams: results[0].params,
      bestScore: results[0].score,
      allResults: results,
      iterations: maxIter
    };
  }
  
  private sampleParams(space: ParameterSpace): Record<string, any> {
    const params: Record<string, any> = {};
    
    for (const [key, param] of Object.entries(space)) {
      if (param.type === 'categorical') {
        const values = param.values || [];
        params[key] = values[Math.floor(Math.random() * values.length)];
      } else if (param.type === 'discrete') {
        const range = param.max! - param.min!;
        const step = param.step || 1;
        const steps = Math.floor(range / step);
        params[key] = param.min! + Math.floor(Math.random() * (steps + 1)) * step;
      } else {
        // Continuous
        params[key] = param.min! + Math.random() * (param.max! - param.min!);
      }
    }
    
    return params;
  }
}
