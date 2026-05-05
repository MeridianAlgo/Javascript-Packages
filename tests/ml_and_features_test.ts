/**
 * Test for Regime Detection and Feature Engineering
 */

import { RegimeIndicators } from '../src/indicators/regime-detection';
import { FeatureEngineering } from '../src/indicators/feature-engineering';

async function main() {
  console.log('🤖 MeridianAlgo ML & Feature Engineering Test\n');

  // Generate synthetic data
  // Low vol regime
  const returnsLow = Array.from({ length: 50 }, () => Math.random() * 0.01 - 0.005);
  // High vol regime
  const returnsHigh = Array.from({ length: 50 }, () => Math.random() * 0.05 - 0.025);
  const returns = [...returnsLow, ...returnsHigh];

  try {
    // 1. Regime Detection
    console.log('[1/2] Regime Detection');
    const hmmResult = RegimeIndicators.hmm(returns, 2);
    console.log(`  - HMM Regimes: Found ${hmmResult.transitions.length} states`);
    console.log('  - Transition Matrix:', hmmResult.transitions.map(row => row.map(v => v.toFixed(2))));
    
    const cp = RegimeIndicators.changePoints(returns, 3);
    console.log(`  - Change Points detected at:`, cp);
    
    const hurst = RegimeIndicators.trendClassifier(returns, 30);
    console.log(`  - Trend Classification (last 5):`, hurst.slice(-5));
    console.log();

    // 2. Feature Engineering
    console.log('[2/2] Feature Engineering');
    const lags = FeatureEngineering.lags(returns, [1, 5, 10]);
    console.log(`  - Lagged features generated: ${lags.length} rows`);
    
    const stats = FeatureEngineering.rollingStats(returns, 20);
    console.log(`  - Rolling Mean (last 3):`, stats.mean.slice(-3).map(v => v.toFixed(4)));
    console.log(`  - Rolling Skew (last 3):`, stats.skew.slice(-3).map(v => v.toFixed(4)));
    
    const matrix = [
      [1, 0.5, 0.2],
      [0.5, 1, 0.4],
      [0.2, 0.4, 1],
      [0.1, 0.2, 0.3],
      [0.9, 0.8, 0.7]
    ];
    const pca = FeatureEngineering.pca(matrix);
    console.log(`  - PCA Component 1:`, pca.component.map(v => v.toFixed(4)));
    console.log(`  - PCA Variance:`, pca.variance.toFixed(4));
    
    const corr = FeatureEngineering.correlation(matrix);
    console.log(`  - Correlation Matrix [0]:`, corr[0].map(v => v.toFixed(2)));
    
    console.log();
    console.log('✅ ML & Features Test Complete!');
  } catch (err) {
    console.error('❌ ML & Features Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
