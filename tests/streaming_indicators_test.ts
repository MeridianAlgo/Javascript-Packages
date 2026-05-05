/**
 * Test for Streaming Indicators
 */

import { StreamingSMA, StreamingEMA, StreamingRSI } from '../src/indicators/streaming';

async function main() {
  console.log('📡 MeridianAlgo Streaming Indicators Test\n');

  try {
    // 1. Streaming SMA
    console.log('[1/3] Streaming SMA');
    const ssma = new StreamingSMA(3);
    console.log('  - Push 100:', ssma.nextValue(100)); // NaN
    console.log('  - Push 110:', ssma.nextValue(110)); // NaN
    console.log('  - Push 120 (SMA expected 110):', ssma.nextValue(120));
    console.log('  - Replace 120 with 150 (SMA expected 120):', ssma.replace(150));
    console.log('  - Push 160 (SMA expected (110+150+160)/3 = 140):', ssma.nextValue(160));
    console.log();

    // 2. Streaming EMA
    console.log('[2/3] Streaming EMA');
    const sema = new StreamingEMA(3); // k = 0.5
    console.log('  - Push 100:', sema.nextValue(100));
    console.log('  - Push 110:', sema.nextValue(110)); // 110*0.5 + 100*0.5 = 105
    console.log('  - Replace 110 with 120:', sema.replace(120)); // 120*0.5 + 100*0.5 = 110
    console.log();

    // 3. Streaming RSI
    console.log('[3/3] Streaming RSI');
    const srsi = new StreamingRSI(3);
    const prices = [100, 110, 105, 115, 120, 110, 105];
    console.log('  - Feeding prices to RSI(3):');
    prices.forEach(p => {
      console.log(`    Price: ${p}, RSI: ${srsi.nextValue(p)?.toFixed(2)}`);
    });
    
    console.log();
    console.log('✅ Streaming Indicators Test Complete!');
  } catch (err) {
    console.error('❌ Streaming Indicators Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
