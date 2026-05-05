/**
 * Deep Test for Candlestick Pattern Recognition (Indicators)
 */

import { 
  detectDoji, 
  detectHammer, 
  detectBullishEngulfing, 
  detectMorningStar,
  detectAllPatterns,
  Candlestick
} from '../src/indicators/patterns';

async function main() {
  console.log('🕯️ MeridianAlgo Pattern Recognition Deep Test\n');

  try {
    // 1. Doji
    console.log('[1/4] Doji Detection');
    const dojiCandle: Candlestick = { open: 100, high: 101, low: 99, close: 100.01 };
    const doji = detectDoji(dojiCandle);
    console.log(`  - Doji detected: ${doji ? 'YES' : 'NO'}`);
    if (doji) console.log(`  - Description: ${doji.description}`);
    
    // 2. Hammer
    console.log('[2/4] Hammer Detection');
    const hammerCandle: Candlestick = { open: 100, high: 100.05, low: 98, close: 99.8 };
    const hammer = detectHammer(hammerCandle);
    console.log(`  - Hammer detected: ${hammer ? 'YES' : 'NO'}`);
    
    // 3. Engulfing
    console.log('[3/4] Engulfing Detection');
    const prev: Candlestick = { open: 100, high: 101, low: 99, close: 98 }; // Bearish
    const curr: Candlestick = { open: 97.5, high: 102, low: 97, close: 101 }; // Bullish engulfing
    const bullEngulf = detectBullishEngulfing(prev, curr);
    console.log(`  - Bullish Engulfing detected: ${bullEngulf ? 'YES' : 'NO'}`);
    
    // 4. Morning Star
    console.log('[4/4] Morning Star Detection');
    const morningStar: Candlestick[] = [
      { open: 100, high: 101, low: 99, close: 95 }, // Big bear
      { open: 94, high: 95, low: 93, close: 94.5 }, // Doji-ish
      { open: 95, high: 100, low: 95, close: 99 }   // Big bull
    ];
    const ms = detectMorningStar(morningStar);
    console.log(`  - Morning Star detected: ${ms ? 'YES' : 'NO'}`);

    console.log();
    const all = detectAllPatterns(morningStar);
    console.log(`  - Total patterns detected in Morning Star sequence: ${all.length}`);

    console.log();
    console.log('✅ Patterns Test Complete!');
  } catch (err) {
    console.error('❌ Patterns Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
