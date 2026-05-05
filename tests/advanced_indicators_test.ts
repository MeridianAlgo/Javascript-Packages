/**
 * Test for Advanced Technical Indicators
 */

import { 
  ichimoku, 
  supertrend, 
  donchianChannels, 
  keltnerChannels,
  aroon,
  pivotPoints,
  OHLC
} from '../src/indicators/advanced';

async function main() {
  console.log('🧪 MeridianAlgo Advanced Indicators Test\n');

  // Synthetic data
  const candles: OHLC[] = Array.from({ length: 60 }, (_, i) => ({
    open: 100 + i,
    high: 102 + i,
    low: 98 + i,
    close: 100.5 + i
  }));

  try {
    // 1. Ichimoku
    console.log('[1/4] Ichimoku Cloud');
    const ichi = ichimoku(candles);
    console.log(`  - Tenkan-sen (last): ${ichi.conversion.slice(-1)[0].toFixed(2)}`);
    console.log(`  - Kijun-sen (last): ${ichi.base.slice(-1)[0].toFixed(2)}`);
    console.log();

    // 2. Supertrend
    console.log('[2/4] Supertrend');
    const st = supertrend(candles);
    console.log(`  - Trend Direction (last): ${st.direction.slice(-1)[0]}`);
    console.log(`  - Supertrend Value: ${st.value.slice(-1)[0].toFixed(2)}`);
    console.log();

    // 3. Channels
    console.log('[3/4] Channels');
    const donchian = donchianChannels(candles, 20);
    const keltner = keltnerChannels(candles, 20);
    console.log(`  - Donchian Upper: ${donchian.upper.slice(-1)[0].toFixed(2)}`);
    console.log(`  - Keltner Upper: ${keltner.upper.slice(-1)[0].toFixed(2)}`);
    console.log();

    // 4. Pivot Points
    console.log('[4/4] Pivot Points');
    const pivots = pivotPoints(110, 90, 105);
    console.log(`  - Pivot: ${pivots.pivot.toFixed(2)}`);
    console.log(`  - R1: ${pivots.r1.toFixed(2)}`);
    console.log(`  - S1: ${pivots.s1.toFixed(2)}`);

    console.log();
    console.log('✅ Advanced Indicators Test Complete!');
  } catch (err) {
    console.error('❌ Advanced Indicators Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
