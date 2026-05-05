/**
 * Test for Mathematical Utilities
 */

import { MathUtils } from '../src/utils/math';

async function main() {
  console.log('🧮 MeridianAlgo Math Utils Test\n');

  const data = [10, 20, 30, 40, 50];

  try {
    // 1. Basic Stats
    console.log('[1/3] Basic Stats');
    console.log(`  - Mean: ${MathUtils.mean(data)} (Expected 30)`);
    console.log(`  - Std Dev: ${MathUtils.std(data).toFixed(4)} (Expected 15.8114)`);
    console.log(`  - Variance: ${MathUtils.variance(data).toFixed(4)} (Expected 250)`);
    console.log();

    // 2. Advanced Stats
    console.log('[2/3] Advanced Stats');
    console.log(`  - Median: ${MathUtils.median(data)} (Expected 30)`);
    console.log(`  - Percentile (75th): ${MathUtils.percentile(data, 0.75)} (Expected 40)`);
    console.log(`  - Skewness: ${MathUtils.skewness(data).toFixed(4)} (Expected 0)`);
    console.log(`  - Kurtosis: ${MathUtils.kurtosis(data).toFixed(4)} (Expected -1.2)`);
    console.log();

    // 3. Relationships
    console.log('[3/3] Relationships');
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    console.log(`  - Correlation: ${MathUtils.correlation(x, y).toFixed(4)} (Expected 1)`);
    console.log(`  - Covariance: ${MathUtils.covariance(x, y).toFixed(4)} (Expected 2.5)`);

    console.log();
    console.log('✅ Math Utils Test Complete!');
  } catch (err) {
    console.error('❌ Math Utils Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
