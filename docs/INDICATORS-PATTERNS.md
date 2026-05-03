# Patterns, Advanced Indicators & Streaming API

## Candlestick patterns

```ts
import {
  detectDoji, detectHammer, detectShootingStar,
  detectBullishEngulfing, detectBearishEngulfing,
  detectMorningStar, detectEveningStar,
  detectThreeWhiteSoldiers, detectThreeBlackCrows,
  detectMarubozu, detectSpinningTop,
  detectPiercingLine, detectDarkCloudCover,
  detectTweezerTop, detectTweezerBottom,
  detectAllPatterns,
} from 'meridianalgo';

const candles = [{ open: 100, high: 102, low: 98, close: 100.05 }, /* ... */];
detectDoji(candles);               // [1, 0, ...]  (1 = pattern present)
detectAllPatterns(candles);        // { doji: [...], hammer: [...], ... }
```

Each detector returns +1 (bullish), -1 (bearish), or 0 (no pattern) per bar.

## Advanced indicators

```ts
import {
  ichimoku, supertrend, donchianChannels, keltnerChannels,
  aroon, choppinessIndex, connorsRSI, massIndex,
  fisherTransform, coppockCurve, dpo, elderRay, pivotPoints,
} from 'meridianalgo';

ichimoku(candles);                     // tenkan, kijun, spans A/B, chikou
supertrend(candles, 10, 3);            // value + ±1 direction
donchianChannels(candles, 20);         // upper/middle/lower
keltnerChannels(candles, 20, 2);       // EMA + ATR multiplier
aroon(candles, 25);                    // up/down 0..100
choppinessIndex(candles, 14);          // 0..100, > 61.8 = choppy
connorsRSI(closes);                    // 3-component RSI
massIndex(candles, 25);                // reversal indicator
fisherTransform(candles, 10);          // Gaussian-transformed price
coppockCurve(closes);                  // long-term momentum
dpo(closes, 20);                       // detrended price oscillator
elderRay(candles, 13);                 // bull/bear power
pivotPoints(prevHigh, prevLow, prevClose); // P, R1-R3, S1-S3
```

## Streaming API

Real-time use: feed bars one at a time, supports `replace()` for tick-replaces-bar updates.

```ts
import { StreamingSMA, StreamingEMA, StreamingRSI, StreamingMACD, StreamingBollinger } from 'meridianalgo';

const sma = new StreamingSMA(20);
sma.nextValue(100);   // NaN until period reached
sma.nextValue(101);
// ...
sma.replace(99);      // mid-bar update — swaps last value, returns new SMA

const macd = new StreamingMACD(12, 26, 9);
const { macd: m, signal, histogram } = macd.nextValue(price);

const bb = new StreamingBollinger(20, 2);
const { upper, middle, lower } = bb.nextValue(price);

// All streaming indicators implement:
//   nextValue(x): TOut
//   replace(x): TOut
//   reset(): void
```
