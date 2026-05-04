/**
 * Real-time streaming indicators on tick stream.
 */
import {
  StreamingSMA,
  StreamingEMA,
  StreamingRSI,
  StreamingMACD,
  StreamingBollinger,
} from '../src';

const sma20 = new StreamingSMA(20);
const ema12 = new StreamingEMA(12);
const rsi14 = new StreamingRSI(14);
const macd = new StreamingMACD(12, 26, 9);
const bb = new StreamingBollinger(20, 2);

const prices = Array.from({ length: 100 }, (_, i) =>
  100 + Math.sin(i / 5) * 5 + Math.random(),
);

prices.forEach((px, i) => {
  const sma = sma20.nextValue(px);
  const ema = ema12.nextValue(px);
  const rsi = rsi14.nextValue(px);
  const m = macd.nextValue(px);
  const b = bb.nextValue(px);

  if (i % 10 === 0 && i >= 30) {
    console.log(
      `t=${i} px=${px.toFixed(2)} sma=${sma.toFixed(2)} ema=${ema.toFixed(2)} rsi=${rsi.toFixed(1)} macd=${m?.macd.toFixed(3)} bb=[${b?.lower.toFixed(2)}, ${b?.upper.toFixed(2)}]`,
    );
  }
});
