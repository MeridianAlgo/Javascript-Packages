/**
 * Deep Test for Performance Metrics (Indicators)
 */

import { 
  sharpeRatio, 
  sortinoRatio, 
  maxDrawdown, 
  valueAtRisk,
  performanceAnalysis
} from '../src/indicators/performance';

async function main() {
  console.log('📊 MeridianAlgo Performance Metrics Deep Test\n');

  // Synthetic returns: 1% mean daily, 2% daily vol
  const returns = Array.from({ length: 100 }, () => 0.01 + 0.02 * (Math.random() * 2 - 1));
  const prices = [100];
  for (const r of returns) {
    prices.push(prices[prices.length - 1] * (1 + r));
  }

  try {
    // 1. Ratios
    console.log('[1/3] Performance Ratios');
    const sharpe = sharpeRatio(returns, 0.02);
    const sortino = sortinoRatio(returns, 0.02);
    console.log(`  - Sharpe Ratio (annualized): ${sharpe.toFixed(2)}`);
    console.log(`  - Sortino Ratio (annualized): ${sortino.toFixed(2)}`);
    console.log();

    // 2. Drawdown & VaR
    console.log('[2/3] Risk Metrics');
    const mdd = maxDrawdown(prices);
    const var95 = valueAtRisk(returns, 0.05, 'historical');
    console.log(`  - Max Drawdown: ${mdd.maxDrawdownPercent.toFixed(2)}%`);
    console.log(`  - VaR (95% Historical): ${(var95 * 100).toFixed(2)}%`);
    console.log();

    // 3. Comprehensive Analysis
    console.log('[3/3] Comprehensive Analysis');
    const analysis = performanceAnalysis(prices);
    console.log(`  - Total Return: ${(analysis.totalReturn * 100).toFixed(2)}%`);
    console.log(`  - Win Rate: ${analysis.winRate.toFixed(2)}%`);
    console.log(`  - Profit Factor: ${analysis.profitFactor.toFixed(2)}`);

    console.log();
    console.log('✅ Performance Test Complete!');
  } catch (err) {
    console.error('❌ Performance Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
