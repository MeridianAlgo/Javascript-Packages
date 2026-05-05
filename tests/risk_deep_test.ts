/**
 * Deep Test for Risk Management
 */

import { RiskMetrics } from '../src/risk/metrics';
import { PerformanceMetrics } from '../src/risk/performance';

async function main() {
  console.log('🛡️ MeridianAlgo Risk & Performance Test\n');

  // Synthetic returns: 10% annual mean, 15% vol
  const mu = 0.10 / 252;
  const sigma = 0.15 / Math.sqrt(252);
  const returns = Array.from({ length: 252 }, () => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mu + sigma * z;
  });

  // Benchmark: 8% annual mean, 12% vol
  const bmu = 0.08 / 252;
  const bsigma = 0.12 / Math.sqrt(252);
  const benchmark = Array.from({ length: 252 }, () => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return bmu + bsigma * z;
  });

  const equity = [1000];
  for (const r of returns) {
    equity.push(equity[equity.length - 1] * (1 + r));
  }

  try {
    // 1. Risk Metrics
    console.log('[1/2] Risk Metrics');
    const var95 = RiskMetrics.var(returns, 0.95, 'historical');
    const var95p = RiskMetrics.var(returns, 0.95, 'parametric');
    const cvar95 = RiskMetrics.cvar(returns, 0.95);
    const mdd = RiskMetrics.maxDrawdown(equity);
    const vol = RiskMetrics.volatility(returns);
    const beta = RiskMetrics.beta(returns, benchmark);
    
    console.log(`  - VaR (95% Historical): ${(var95 * 100).toFixed(2)}%`);
    console.log(`  - VaR (95% Parametric): ${(var95p * 100).toFixed(2)}%`);
    console.log(`  - CVaR (95%): ${(cvar95 * 100).toFixed(2)}%`);
    console.log(`  - Max Drawdown: ${(mdd.value * 100).toFixed(2)}%`);
    console.log(`  - Annual Volatility: ${(vol * 100).toFixed(2)}%`);
    console.log(`  - Beta vs Benchmark: ${beta.toFixed(2)}`);
    console.log();

    // 2. Performance Metrics
    console.log('[2/2] Performance Metrics');
    const sharpe = PerformanceMetrics.sharpeRatio(returns);
    const sortino = PerformanceMetrics.sortinoRatio(returns);
    const winRate = PerformanceMetrics.winRate(returns);
    const profitFactor = PerformanceMetrics.profitFactor(returns);
    const alpha = PerformanceMetrics.alpha(returns, benchmark);
    
    console.log(`  - Sharpe Ratio: ${sharpe.toFixed(2)}`);
    console.log(`  - Sortino Ratio: ${sortino.toFixed(2)}`);
    console.log(`  - Win Rate: ${(winRate * 100).toFixed(2)}%`);
    console.log(`  - Profit Factor: ${profitFactor.toFixed(2)}`);
    console.log(`  - Alpha (annualized): ${(alpha * 100).toFixed(2)}%`);
    
    console.log();
    console.log('✅ Risk & Performance Test Complete!');
  } catch (err) {
    console.error('❌ Risk & Performance Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
