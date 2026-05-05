/**
 * Deep Test for Backtest Engine
 */

import { TimeBasedEngine } from '../src/backtest/engine';
import { Bar } from '../src/core';

async function main() {
  console.log('🏁 MeridianAlgo Backtest Engine Deep Test\n');

  // Synthetic data: Uptrending series
  const data: Bar[] = Array.from({ length: 100 }, (_, i) => ({
    t: new Date(2024, 0, i + 1),
    o: 100 + i,
    h: 105 + i,
    l: 95 + i,
    c: 101 + i,
    v: 1000,
    symbol: 'SPY'
  }));

  // Simple trend strategy
  const strategy = {
    id: 'simple-trend',
    next: (bar: Bar) => {
      // Always buy in this test to check pnl
      return { t: bar.t, value: 1 };
    }
  };

  const engine = new TimeBasedEngine({
    initialCash: 10000,
    data,
    strategy
  });

  try {
    console.log('[1/2] Running Backtest');
    const result = await engine.run();
    console.log(`  - Total Trades: ${result.metrics.totalTrades}`);
    console.log(`  - Total Return: ${(result.metrics.totalReturn * 100).toFixed(2)}%`);
    console.log(`  - Final Equity: ${result.equity.slice(-1)[0].equity.toFixed(2)}`);
    console.log();

    console.log('[2/2] Trade Analysis');
    if (result.trades.length > 0) {
      const lastTrade = result.trades[result.trades.length - 1];
      console.log(`  - Last Trade Side: ${lastTrade.side}`);
      console.log(`  - Last Trade Price: ${lastTrade.entryPrice.toFixed(2)}`);
    }

    console.log();
    console.log('✅ Backtest Engine Test Complete!');
  } catch (err) {
    console.error('❌ Backtest Engine Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
