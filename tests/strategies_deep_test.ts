/**
 * Deep Test for Strategy Composition and Signal Generation
 */

import { trendFollowing } from '../src/strategies/trend-following';
import { meanReversion } from '../src/strategies/mean-reversion';
import { StrategyComposer } from '../src/strategies/composer';
import { Bar } from '../src/core';

async function main() {
  console.log('📈 MeridianAlgo Strategies & Composition Test\n');

  // Synthetic price bars
  const bars: Bar[] = Array.from({ length: 100 }, (_, i) => ({
    t: new Date(2024, 0, i + 1),
    o: 100 + Math.sin(i / 10) * 5 + Math.random(),
    h: 102 + Math.sin(i / 10) * 5 + Math.random(),
    l: 98 + Math.sin(i / 10) * 5 + Math.random(),
    c: 100 + Math.sin(i / 10) * 5 + Math.random(),
    v: 1000
  }));

  try {
    // 1. Built-in Strategies
    console.log('[1/2] Built-in Strategies');
    const trend = trendFollowing({ fastPeriod: 10, slowPeriod: 20 });
    const meanRev = meanReversion({ period: 10, stdDev: 2 });
    
    trend.init(bars.slice(0, 50));
    meanRev.init(bars.slice(0, 50));
    
    const trendSignals = trend.generate!(bars.slice(50));
    const meanRevSignals = meanRev.generate!(bars.slice(50));
    
    console.log(`  - Trend Signals generated: ${trendSignals.filter(s => s.value !== 0).length}`);
    console.log(`  - Mean Rev Signals generated: ${meanRevSignals.filter(s => s.value !== 0).length}`);
    console.log();

    // 2. Composition
    console.log('[2/2] Strategy Composition');
    const blended = StrategyComposer.blend([trend, meanRev], [0.7, 0.3]);
    const voted = StrategyComposer.vote([trend, meanRev], 1.0); // Unanimity
    
    blended.init?.(bars.slice(0, 50));
    voted.init?.(bars.slice(0, 50));
    
    const blendedSignals: any[] = [];
    const votedSignals: any[] = [];
    
    for (let i = 50; i < 60; i++) {
      const bSig = blended.next(bars[i]);
      const vSig = voted.next(bars[i]);
      if (bSig) blendedSignals.push(bSig);
      if (vSig) votedSignals.push(vSig);
    }
    
    console.log(`  - Blended Signals (last 3 values):`, blendedSignals.slice(-3).map(s => s.value.toFixed(2)));
    console.log(`  - Voting Signals (last 3 values):`, votedSignals.slice(-3).map(s => s.value));
    
    console.log();
    console.log('✅ Strategies Test Complete!');
  } catch (err) {
    console.error('❌ Strategies Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
