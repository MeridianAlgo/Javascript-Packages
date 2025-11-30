/**
 * Basic backtest example
 */

import { createMeridian } from '@meridianalgo/core';
import { YahooAdapter, DataManager } from '@meridianalgo/data';
import { indicatorsPlugin } from '@meridianalgo/indicators';
import { trendFollowing } from '@meridianalgo/strategies';
import { TimeBasedEngine, FixedCommission, FixedSlippage } from '@meridianalgo/backtest';

async function main() {
  // Create framework instance
  const meridian = createMeridian({
    logLevel: 'info'
  });
  
  // Register plugins
  meridian.use(indicatorsPlugin);
  
  console.log('MeridianAlgo Framework initialized');
  console.log('Registered plugins:', meridian.listPlugins());
  console.log('Available indicators:', meridian.listIndicators().slice(0, 10), '...');
  
  // Fetch data
  console.log('\nFetching data for AAPL...');
  const yahoo = new YahooAdapter();
  const dataManager = new DataManager(new Map([['yahoo', yahoo]]));
  
  const bars = await dataManager.fetch('yahoo', 'AAPL', {
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1d'
  });
  
  console.log(`Fetched ${bars.length} bars`);
  console.log('First bar:', bars[0]);
  console.log('Last bar:', bars[bars.length - 1]);
  
  // Create strategy
  console.log('\nCreating trend-following strategy...');
  const strategy = trendFollowing({
    fastPeriod: 10,
    slowPeriod: 30,
    maType: 'ema'
  });
  
  // Run backtest
  console.log('\nRunning backtest...');
  const engine = new TimeBasedEngine({
    strategy,
    data: bars,
    initialCash: 100000,
    commission: new FixedCommission(1),
    slippage: new FixedSlippage(5)
  });
  
  const result = await engine.run();
  
  // Display results
  console.log('\n=== Backtest Results ===');
  console.log(`Initial Capital: $100,000`);
  console.log(`Final Equity: $${result.equity[result.equity.length - 1].equity.toFixed(2)}`);
  console.log(`Total Return: ${(result.metrics.totalReturn * 100).toFixed(2)}%`);
  console.log(`Annualized Return: ${(result.metrics.annualizedReturn * 100).toFixed(2)}%`);
  console.log(`Sharpe Ratio: ${result.metrics.sharpeRatio.toFixed(2)}`);
  console.log(`Max Drawdown: ${(result.metrics.maxDrawdown * 100).toFixed(2)}%`);
  console.log(`Win Rate: ${(result.metrics.winRate * 100).toFixed(2)}%`);
  console.log(`Profit Factor: ${result.metrics.profitFactor.toFixed(2)}`);
  console.log(`Total Trades: ${result.metrics.totalTrades}`);
  
  console.log('\n=== Recent Trades ===');
  result.trades.slice(-5).forEach((trade, i) => {
    console.log(`Trade ${result.trades.length - 5 + i + 1}:`, {
      time: trade.entryTime.toISOString().split('T')[0],
      side: trade.side,
      price: trade.entryPrice.toFixed(2),
      qty: trade.qty,
      pnl: trade.pnl?.toFixed(2) || 'open'
    });
  });
}

main().catch(console.error);
