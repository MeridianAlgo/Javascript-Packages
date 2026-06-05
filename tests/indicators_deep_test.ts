/**
 * Deep Test for Technical Indicators
 */

import { Indicators } from '../src/indicators/indicators';

async function main() {
  console.log('📊 MeridianAlgo Indicators Deep Test\n');

  const prices = [
    100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 
    110, 112, 111, 113, 115, 114, 116, 118, 117, 119,
    120, 122, 121, 123, 125, 124, 126, 128, 127, 129
  ];
  const high = prices.map(p => p + 0.5);
  const low = prices.map(p => p - 0.5);
  const close = prices;
  const volume = [
    1000, 1200, 1100, 1300, 1500, 1400, 1600, 1800, 1700, 1900, 
    2000, 2200, 2100, 2300, 2500, 2400, 2600, 2800, 2700, 2900,
    3000, 3200, 3100, 3300, 3500, 3400, 3600, 3800, 3700, 3900
  ];

  try {
    // 1. Moving Averages
    console.log('[1/4] Moving Averages');
    const sma = Indicators.sma(prices, 5);
    const ema = Indicators.ema(prices, 5);
    const wma = Indicators.wma(prices, 5);
    const dema = Indicators.dema(prices, 5);
    const tema = Indicators.tema(prices, 5);
    
    console.log('  - SMA(5):', sma.slice(-3).map(v => v.toFixed(2)));
    console.log('  - EMA(5):', ema.slice(-3).map(v => v.toFixed(2)));
    console.log('  - WMA(5):', wma.slice(-3).map(v => v.toFixed(2)));
    console.log('  - DEMA(5):', dema.slice(-3).map(v => v.toFixed(2)));
    console.log('  - TEMA(5):', tema.slice(-3).map(v => v.toFixed(2)));
    console.log();

    // 2. Oscillators
    console.log('[2/4] Oscillators');
    const rsi = Indicators.rsi(prices, 14);
    const macd = Indicators.macd(prices, 12, 26, 9);
    const stoch = Indicators.stochastic(high, low, close, 14, 3);
    const williams = Indicators.williamsR(high, low, close, 14);
    
    console.log('  - RSI(14):', rsi.slice(-1)[0]?.toFixed(2));
    console.log('  - MACD Line:', macd.macd.slice(-1)[0]?.toFixed(2));
    console.log('  - Stochastic %K:', stoch.k.slice(-1)[0]?.toFixed(2));
    console.log('  - Williams %R:', williams.slice(-1)[0]?.toFixed(2));
    console.log();

    // 3. Volatility & Volume
    console.log('[3/4] Volatility & Volume');
    const bb = Indicators.bollingerBands(prices, 5, 2);
    const atr = Indicators.atr(high, low, close, 5);
    const obv = Indicators.obv(close, volume);
    
    console.log('  - Bollinger Upper:', bb.upper.slice(-1)[0]?.toFixed(2));
    console.log('  - ATR(5):', atr.slice(-1)[0]?.toFixed(2));
    console.log('  - OBV:', obv.slice(-1)[0]);
    console.log();

    // 4. Error Handling & Edge Cases
    console.log('[4/4] Error Handling');
    try {
      Indicators.sma([], 5);
    } catch (e) {
      console.log('  - Caught expected error (empty array):', (e as Error).message);
    }
    
    try {
      Indicators.rsi(prices, 20); // Period > Data length
    } catch (e) {
      console.log('  - Caught expected error (period too large):', (e as Error).message);
    }

    try {
      Indicators.movingAverage('invalid' as any, prices, 5);
    } catch (e) {
      console.log('  - Caught expected error (invalid MA type):', (e as Error).message);
    }
    
    console.log();
    console.log('✅ Indicators Test Complete!');
  } catch (err) {
    console.error('❌ Indicators Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
