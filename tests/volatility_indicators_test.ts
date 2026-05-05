/**
 * Test for Volatility Indicators
 */

import { VolatilityIndicators } from '../src/indicators/volatility';

async function main() {
  console.log('📉 MeridianAlgo Volatility Indicators Test\n');

  const open = [100, 101, 102, 103, 104, 105];
  const high = [102, 103, 104, 105, 106, 107];
  const low = [98, 99, 100, 101, 102, 103];
  const close = [101, 102, 103, 104, 105, 106];

  try {
    // 1. Standard Deviation
    console.log('[1/3] Standard Deviation');
    const sd = VolatilityIndicators.standardDeviation(close, 3);
    console.log(`  - Std Dev (3-period, last): ${sd.slice(-1)[0].toFixed(4)}`);
    console.log();

    // 2. Advanced Volatility Estimators
    console.log('[2/3] Advanced Estimators');
    const park = VolatilityIndicators.parkinsonVolatility(high, low, 3);
    const gk = VolatilityIndicators.garmanKlassVolatility(open, high, low, close, 3);
    console.log(`  - Parkinson Vol (annualized): ${park.slice(-1)[0].toFixed(4)}`);
    console.log(`  - Garman-Klass Vol (annualized): ${gk.slice(-1)[0].toFixed(4)}`);
    console.log();

    // 3. Channels
    console.log('[3/3] Volatility Channels');
    const keltner = VolatilityIndicators.keltnerChannels(high, low, close, 3, 2, 3);
    console.log(`  - Keltner Upper: ${keltner.upper.slice(-1)[0].toFixed(2)}`);
    console.log(`  - Keltner Lower: ${keltner.lower.slice(-1)[0].toFixed(2)}`);

    console.log();
    console.log('✅ Volatility Indicators Test Complete!');
  } catch (err) {
    console.error('❌ Volatility Indicators Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
