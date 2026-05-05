/**
 * Test for Streaming Indicators
 */

import assert from 'node:assert/strict';
import { StreamingSMA, StreamingEMA, StreamingRSI } from '../src/indicators/streaming';

async function main() {
  console.log('📡 MeridianAlgo Streaming Indicators Test\n');

  try {
    // 1. Streaming SMA
    console.log('[1/3] Streaming SMA');
    const ssma = new StreamingSMA(3);
    const sma1 = ssma.nextValue(100);
    console.log('  - Push 100:', sma1); // NaN
    assert.ok(Number.isNaN(sma1), 'SMA after first value should be NaN (warmup)');

    const sma2 = ssma.nextValue(110);
    console.log('  - Push 110:', sma2); // NaN
    assert.ok(Number.isNaN(sma2), 'SMA after second value should be NaN (warmup)');

    const sma3 = ssma.nextValue(120);
    console.log('  - Push 120 (SMA expected 110):', sma3);
    assert.equal(sma3, 110, 'SMA after [100,110,120] should be 110');

    const smaReplace = ssma.replace(150);
    console.log('  - Replace 120 with 150 (SMA expected 120):', smaReplace);
    assert.equal(smaReplace, 120, 'SMA after replacing 120 with 150 should be 120');

    const sma4 = ssma.nextValue(160);
    console.log('  - Push 160 (SMA expected (110+150+160)/3 = 140):', sma4);
    assert.equal(sma4, 140, 'SMA after [110,150,160] should be 140');
    console.log();

    // 2. Streaming EMA
    console.log('[2/3] Streaming EMA');
    const sema = new StreamingEMA(3); // k = 0.5
    const ema1 = sema.nextValue(100);
    console.log('  - Push 100:', ema1);
    assert.equal(ema1, 100, 'First EMA value should equal first input');

    const ema2 = sema.nextValue(110); // 110*0.5 + 100*0.5 = 105
    console.log('  - Push 110:', ema2);
    assert.equal(ema2, 105, 'Second EMA value should be 105');

    const emaReplace = sema.replace(120); // 120*0.5 + 100*0.5 = 110
    console.log('  - Replace 110 with 120:', emaReplace);
    assert.equal(emaReplace, 110, 'EMA after replacing 110 with 120 should be 110');
    console.log();

    // 3. Streaming RSI
    console.log('[3/3] Streaming RSI');
    const srsi = new StreamingRSI(3);
    const prices = [100, 110, 105, 115, 120, 110, 105];
    console.log('  - Feeding prices to RSI(3):');
    prices.forEach((p, idx) => {
      const rsi = srsi.nextValue(p);
      console.log(`    Price: ${p}, RSI: ${rsi?.toFixed(2)}`);
      if (idx < 3) {
        assert.equal(rsi, undefined, 'RSI should be undefined during warmup period');
      } else {
        assert.ok(rsi !== undefined, 'RSI should be defined after warmup period');
        assert.ok(Number.isFinite(rsi), 'RSI should be a finite number');
        assert.ok(rsi >= 0 && rsi <= 100, 'RSI should be within [0, 100]');
      }
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
