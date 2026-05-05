/**
 * Deep Test for Candlestick Patterns
 */

import { 
  detectDoji, 
  detectHammer, 
  detectBullishEngulfing, 
  detectBearishEngulfing,
  detectAllPatterns,
  OHLC
} from '../src/indicators/candlestick';

async function main() {
  console.log('🕯️ MeridianAlgo Candlestick Patterns Test\n');

  try {
    // 1. Doji
    console.log('[1/4] Doji Detection');
    const dojiCandle: OHLC = { open: 100, high: 101, low: 99, close: 100.01 };
    const doji = detectDoji([dojiCandle]);
    console.log(`  - Doji detected: ${doji[0] === 1 ? 'YES' : 'NO'}`);
    
    // 2. Hammer
    console.log('[2/4] Hammer Detection');
    const hammerCandle: OHLC = { open: 100, high: 100.05, low: 98, close: 99.8 };
    const hammer = detectHammer([hammerCandle]);
    console.log(`  - Hammer detected: ${hammer[0] === 1 ? 'YES' : 'NO'}`);
    
    // 3. Engulfing
    console.log('[3/4] Engulfing Detection');
    const engulfing: OHLC[] = [
      { open: 100, high: 101, low: 99, close: 98 }, // Bearish
      { open: 97.5, high: 102, low: 97, close: 101 } // Bullish engulfing
    ];
    const bullEngulf = detectBullishEngulfing(engulfing);
    console.log(`  - Bullish Engulfing detected: ${bullEngulf[1] === 1 ? 'YES' : 'NO'}`);
    
    // 4. Batch Detection
    console.log('[4/4] Batch Detection');
    const all = detectAllPatterns(engulfing);
    console.log(`  - All Patterns keys: ${Object.keys(all).length}`);
    console.log(`  - Bullish Engulfing in Batch: ${all.bullishEngulfing[1] === 1 ? 'YES' : 'NO'}`);

    console.log();
    console.log('✅ Candlestick Test Complete!');
  } catch (err) {
    console.error('❌ Candlestick Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
