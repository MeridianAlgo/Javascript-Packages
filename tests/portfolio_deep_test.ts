/**
 * Deep Test for Portfolio Optimization
 */

import { MeanVarianceOptimizer } from '../src/portfolio/mean-variance';
import { RiskParityOptimizer } from '../src/portfolio/risk-parity';
import { kellyBet } from '../src/portfolio/kelly';

async function main() {
  console.log('💼 MeridianAlgo Portfolio Management Test\n');

  // Synthetic data for 3 assets
  const symbols = ['AAPL', 'TLT', 'GLD'];
  const returns = Array.from({ length: 100 }, () => [
    Math.random() * 0.02 - 0.005, // AAPL
    Math.random() * 0.01 - 0.005, // TLT
    Math.random() * 0.015 - 0.005 // GLD
  ]);

  try {
    // 1. Mean-Variance Optimization
    console.log('[1/3] Mean-Variance Optimization');
    const mvo = new MeanVarianceOptimizer();
    const mvoResult = mvo.optimize(returns, symbols, {
      longOnly: true,
      maxWeight: 0.5
    });
    
    console.log('  - MVO Weights:');
    symbols.forEach((s, i) => {
      console.log(`    ${s}: ${(mvoResult.weights[i] * 100).toFixed(2)}%`);
    });
    console.log(`  - Expected Return: ${(mvoResult.expectedReturn * 100).toFixed(4)}%`);
    console.log(`  - Expected Risk: ${(mvoResult.expectedRisk * 100).toFixed(4)}%`);
    console.log();

    // 2. Risk Parity
    console.log('[2/3] Risk Parity');
    const rp = new RiskParityOptimizer();
    const rpResult = rp.optimize(returns, symbols, {
      longOnly: true
    });
    
    console.log('  - Risk Parity Weights:');
    symbols.forEach((s, i) => {
      console.log(`    ${s}: ${(rpResult.weights[i] * 100).toFixed(2)}%`);
    });
    console.log();

    // 3. Kelly Criterion
    console.log('[3/3] Kelly Criterion');
    const kelly = kellyBet(0.55, 2.0); // 55% win rate, 2:1 ratio
    console.log(`  - Kelly Fraction: ${(kelly * 100).toFixed(2)}%`);
    
    console.log();
    console.log('✅ Portfolio Test Complete!');
  } catch (err) {
    console.error('❌ Portfolio Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
