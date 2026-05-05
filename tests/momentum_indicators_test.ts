/**
 * Test for Momentum Indicators
 */

import { MomentumIndicators } from '../src/indicators/momentum';

async function main() {
  console.log('🚀 MeridianAlgo Momentum Indicators Test\n');

  const prices = [100, 102, 101, 103, 105, 107, 106, 108, 110, 112, 111];

  try {
    // 1. ROC & Momentum
    console.log('[1/3] ROC & Momentum');
    const r = MomentumIndicators.roc(prices, 5);
    const m = MomentumIndicators.momentum(prices, 5);
    console.log(`  - ROC (5-period, last): ${r.slice(-1)[0].toFixed(2)}%`);
    console.log(`  - Momentum (5-period, last): ${m.slice(-1)[0].toFixed(2)}`);
    console.log();

    // 2. CMO
    console.log('[2/3] CMO');
    const cmo = MomentumIndicators.cmo(prices, 5);
    console.log(`  - CMO (5-period, last): ${cmo.slice(-1)[0].toFixed(2)}`);
    console.log();

    // 3. PPO
    console.log('[3/3] PPO');
    const ppo = MomentumIndicators.ppo(prices, 3, 6, 3);
    console.log(`  - PPO (last): ${ppo.ppo.slice(-1)[0].toFixed(2)}%`);
    console.log(`  - PPO Signal (last): ${ppo.signal.slice(-1)[0].toFixed(2)}%`);

    console.log();
    console.log('✅ Momentum Indicators Test Complete!');
  } catch (err) {
    console.error('❌ Momentum Indicators Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
