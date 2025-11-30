/**
 * Grid search optimizer
 */

import { Optimizer, ObjectiveFunction, ParameterSpace, OptimizationResult, OptimizationOptions } from './types';

export class GridSearchOptimizer implements Optimizer {
  async optimize(
    objective: ObjectiveFunction,
    space: ParameterSpace,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const combinations = this.generateCombinations(space);
    const results: Array<{ params: Record<string, any>; score: number }> = [];
    
    for (const params of combinations) {
      const score = await objective(params);
      results.push({ params, score });
    }
    
    // Find best
    results.sort((a, b) => b.score - a.score);
    
    return {
      bestParams: results[0].params,
      bestScore: results[0].score,
      allResults: results,
      iterations: combinations.length
    };
  }
  
  private generateCombinations(space: ParameterSpace): Array<Record<string, any>> {
    const keys = Object.keys(space);
    const values = keys.map(key => this.generateValues(space[key]));
    
    return this.cartesianProduct(values).map(combo => {
      const params: Record<string, any> = {};
      keys.forEach((key, i) => {
        params[key] = combo[i];
      });
      return params;
    });
  }
  
  private generateValues(param: ParameterSpace[string]): any[] {
    if (param.type === 'categorical') {
      return param.values || [];
    } else if (param.type === 'discrete') {
      const values: number[] = [];
      const step = param.step || 1;
      for (let v = param.min!; v <= param.max!; v += step) {
        values.push(v);
      }
      return values;
    } else {
      // Continuous - sample at regular intervals
      const values: number[] = [];
      const step = param.step || (param.max! - param.min!) / 10;
      for (let v = param.min!; v <= param.max!; v += step) {
        values.push(v);
      }
      return values;
    }
  }
  
  private cartesianProduct(arrays: any[][]): any[][] {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map(x => [x]);
    
    const [first, ...rest] = arrays;
    const restProduct = this.cartesianProduct(rest);
    
    const result: any[][] = [];
    for (const item of first) {
      for (const combo of restProduct) {
        result.push([item, ...combo]);
      }
    }
    
    return result;
  }
}
