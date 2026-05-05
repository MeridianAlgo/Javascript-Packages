/**
 * Deep Test for Parameter Optimization
 */

import { GridSearchOptimizer } from '../src/optimize/grid-search';
import { RandomSearchOptimizer } from '../src/optimize/random-search';
import { ParameterSpace } from '../src/optimize/types';

async function main() {
  console.log('🔍 MeridianAlgo Optimization Deep Test\n');

  // Simple objective function: minimize (x-5)^2 + (y-10)^2
  const objective = async (params: Record<string, any>) => {
    const x = params.x;
    const y = params.y;
    const score = - (Math.pow(x - 5, 2) + Math.pow(y - 10, 2)); // Score (higher is better)
    return score;
  };

  try {
    // 1. Grid Search
    console.log('[1/2] Grid Search');
    const grid = new GridSearchOptimizer();
    const gridSpace: ParameterSpace = {
      x: { type: 'discrete', min: 4, max: 6, step: 1 },
      y: { type: 'discrete', min: 9, max: 11, step: 1 }
    };
    
    const gridResult = await grid.optimize(objective, gridSpace);
    console.log(`  - Best Params: ${JSON.stringify(gridResult.bestParams)}`);
    console.log(`  - Best Score: ${gridResult.bestScore.toFixed(4)}`);
    console.log();

    // 2. Random Search
    console.log('[2/2] Random Search');
    const random = new RandomSearchOptimizer();
    const randomSpace: ParameterSpace = {
      x: { type: 'continuous', min: 0, max: 10 },
      y: { type: 'continuous', min: 0, max: 20 }
    };
    
    const randomResult = await random.optimize(objective, randomSpace, { maxIterations: 100 });
    console.log(`  - Best Params: ${JSON.stringify(randomResult.bestParams)}`);
    console.log(`  - Best Score: ${randomResult.bestScore.toFixed(4)}`);

    console.log();
    console.log('✅ Optimization Test Complete!');
  } catch (err) {
    console.error('❌ Optimization Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
