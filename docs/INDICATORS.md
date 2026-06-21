# Technical Indicators API

Complete reference for all technical indicators in MeridianAlgo.

## Table of Contents

- [Moving Averages](#moving-averages)
- [Momentum Indicators](#momentum-indicators)
- [Volatility Indicators](#volatility-indicators)
- [Volume Indicators](#volume-indicators)
- [Trend Indicators](#trend-indicators)

## Moving Averages

### SMA - Simple Moving Average

Calculates the arithmetic mean of prices over a specified period.

```typescript
Indicators.sma(data: number[], period: number): number[]
```

**Parameters:**
- `data`: Array of price data
- `period`: Number of periods for calculation

**Returns:** Array of SMA values (same length as input, padded with NaN)

**Example:**
```typescript
const prices = [100, 102, 101, 103, 105];
const sma = Indicators.sma(prices, 3);
// Result: [NaN, NaN, 101, 102, 103]
```

### EMA - Exponential Moving Average

Calculates exponentially weighted moving average, giving more weight to recent prices.

```typescript
Indicators.ema(data: number[], period: number): number[]
```

**Parameters:**
- `data`: Array of price data
- `period`: Number of periods for calculation

**Returns:** Array of EMA values

**Example:**
```typescript
const prices = [100, 102, 101, 103, 105];
const ema = Indicators.ema(prices, 3);
```

### WMA - Weighted Moving Average

Calculates linearly weighted moving average.

```typescript
Indicators.wma(data: number[], period: number): number[]
```

### DEMA - Double Exponential Moving Average

Reduces lag compared to standard EMA.

```typescript
Indicators.dema(data: number[], period: number): number[]
```

### TEMA - Triple Exponential Moving Average

Further reduces lag for faster response to price changes.

```typescript
Indicators.tema(data: number[], period: number): number[]
```

### KAMA - Kaufman's Adaptive Moving Average

Adapts to market volatility.

```typescript
Indicators.kama(
  data: number[],
  period: number,
  fast?: number,  // default: 2
  slow?: number   // default: 30
): number[]
```

### T3 - Triple Exponential Moving Average (Tillson)

Smooth moving average with minimal lag.

```typescript
Indicators.t3(
  data: number[],
  period: number,
  volumeFactor?: number  // default: 0.7
): number[]
```

### Generic Moving Average

Supports multiple MA types in one function.

```typescript
Indicators.movingAverage(
  type: 'sma' | 'ema' | 'wma' | 'dema' | 'tema' | 'kama' | 't3',
  data: number[],
  period: number,
  ...args: any[]
): number[]
```

## Momentum Indicators

### RSI - Relative Strength Index

Measures the speed and magnitude of price changes (0-100 scale).

```typescript
Indicators.rsi(
  data: number[],
  period?: number,        // default: 14
  maType?: MovingAverageType  // default: 'ema'
): number[]
```

**Interpretation:**
- RSI > 70: Overbought
- RSI < 30: Oversold

**Example:**
```typescript
const prices = [/* ... */];
const rsi = Indicators.rsi(prices, 14);

if (rsi[rsi.length - 1] > 70) {
  console.log('Overbought condition');
} else if (rsi[rsi.length - 1] < 30) {
  console.log('Oversold condition');
}
```

### MACD - Moving Average Convergence Divergence

Trend-following momentum indicator.

```typescript
Indicators.macd(
  data: number[],
  fast?: number,    // default: 12
  slow?: number,    // default: 26
  signal?: number,  // default: 9
  maType?: MovingAverageType  // default: 'ema'
): {
  macd: number[];
  signal: number[];
  histogram: number[];
}
```

**Returns:**
- `macd`: MACD line (fast MA - slow MA)
- `signal`: Signal line (MA of MACD)
- `histogram`: MACD - Signal

**Example:**
```typescript
const macd = Indicators.macd(prices);

// Bullish crossover
if (macd.histogram[macd.histogram.length - 1] > 0 &&
    macd.histogram[macd.histogram.length - 2] <= 0) {
  console.log('Bullish MACD crossover');
}
```

### Stochastic Oscillator

Compares closing price to price range over time.

```typescript
Indicators.stochastic(
  high: number[],
  low: number[],
  close: number[],
  kPeriod?: number,  // default: 14
  dPeriod?: number,  // default: 3
  smooth?: number    // default: 1
): {
  k: number[];  // %K line
  d: number[];  // %D line (signal)
}
```

### Williams %R

Momentum indicator measuring overbought/oversold levels.

```typescript
Indicators.williamsR(
  high: number[],
  low: number[],
  close: number[],
  period?: number  // default: 14
): number[]
```

**Range:** -100 to 0
- Above -20: Overbought
- Below -80: Oversold

### CCI - Commodity Channel Index

Measures deviation from average price.

```typescript
Indicators.cci(
  high: number[],
  low: number[],
  close: number[],
  period?: number  // default: 20
): number[]
```

## Volatility Indicators

### Bollinger Bands

Volatility bands placed above and below a moving average.

```typescript
Indicators.bollingerBands(
  data: number[],
  period?: number,   // default: 20
  stdDev?: number,   // default: 2
  maType?: MovingAverageType  // default: 'sma'
): {
  upper: number[];
  middle: number[];
  lower: number[];
}
```

**Example:**
```typescript
const bb = Indicators.bollingerBands(prices, 20, 2);

const currentPrice = prices[prices.length - 1];
const upperBand = bb.upper[bb.upper.length - 1];
const lowerBand = bb.lower[bb.lower.length - 1];

if (currentPrice > upperBand) {
  console.log('Price above upper band - potential reversal');
} else if (currentPrice < lowerBand) {
  console.log('Price below lower band - potential bounce');
}
```

### ATR - Average True Range

Measures market volatility.

```typescript
Indicators.atr(
  high: number[],
  low: number[],
  close: number[],
  period?: number,  // default: 14
  maType?: MovingAverageType  // default: 'sma'
): number[]
```

**Use Cases:**
- Position sizing
- Stop-loss placement
- Volatility filtering

### ADX - Average Directional Index

Measures trend strength (0-100 scale).

```typescript
Indicators.adx(
  high: number[],
  low: number[],
  close: number[],
  period?: number  // default: 14
): {
  adx: number[];
  plusDI: number[];
  minusDI: number[];
}
```

**Interpretation:**
- ADX > 25: Strong trend
- ADX < 20: Weak trend or ranging market

## Volume Indicators

### Volume Moving Average

Moving average of volume.

```typescript
Indicators.volumeMA(
  volume: number[],
  period?: number,  // default: 20
  maType?: MovingAverageType  // default: 'sma'
): number[]
```

### OBV - On-Balance Volume

Cumulative volume indicator.

```typescript
Indicators.obv(
  close: number[],
  volume: number[]
): number[]
```

**Interpretation:**
- Rising OBV: Buying pressure
- Falling OBV: Selling pressure
- Divergence with price: Potential reversal

## Trend Indicators

### Donchian Channels

Price channels based on highest high and lowest low.

```typescript
Indicators.donchianChannels(
  high: number[],
  low: number[],
  period?: number  // default: 20
): {
  upper: number[];
  middle: number[];
  lower: number[];
}
```

**Use Cases:**
- Breakout trading
- Trend identification
- Support/resistance levels

### Parabolic SAR

Stop-and-reverse indicator that follows price trends and provides dynamic stop levels.

```typescript
Indicators.parabolicSAR(
  high: number[],
  low: number[],
  step?: number,  // acceleration factor step, default: 0.02
  max?: number    // maximum acceleration factor, default: 0.2
): {
  sar: number[];           // SAR values
  trend: ('up'|'down')[];  // trend direction per bar
}
```

**Interpretation:**
- When `trend === 'up'`: SAR is below price (bullish)
- When `trend === 'down'`: SAR is above price (bearish)
- A trend flip signals a potential reversal

**Example:**
```typescript
const { sar, trend } = Indicators.parabolicSAR(high, low);
const last = trend[trend.length - 1];
console.log(last === 'up' ? 'Bullish — stop at ' + sar[sar.length - 1] : 'Bearish');
```

---

### TSI - True Strength Index

Double-smoothed momentum oscillator that identifies trend direction and reversals.
Available via `MomentumIndicators.tsi()`.

```typescript
import { MomentumIndicators } from 'meridianalgo';

MomentumIndicators.tsi(
  prices: number[],
  longPeriod?: number,    // default: 25
  shortPeriod?: number,   // default: 13
  signalPeriod?: number   // default: 7
): {
  tsi: number[];     // TSI line (range approx -100 to +100)
  signal: number[];  // Signal line (EMA of TSI)
}
```

**Interpretation:**
- TSI above 0: Bullish momentum
- TSI below 0: Bearish momentum
- TSI crossing signal line: Entry/exit signal

**Example:**
```typescript
const { tsi, signal } = MomentumIndicators.tsi(prices);
const i = tsi.length - 1;
if (tsi[i] > signal[i] && tsi[i - 1] <= signal[i - 1]) {
  console.log('Bullish TSI crossover');
}
```

---

### A/D Line - Accumulation/Distribution Line

Cumulative volume indicator using the Close Location Value (CLV) to gauge buying vs selling pressure. Unlike OBV, it factors in where the close falls within the bar's range.
Available via `VolumeIndicators.adLine()`.

```typescript
import { VolumeIndicators } from 'meridianalgo';

VolumeIndicators.adLine(
  high: number[],
  low: number[],
  close: number[],
  volume: number[]
): number[]
```

**Returns:** Cumulative A/D Line values (no warmup, starts at bar 0)

**Interpretation:**
- Rising A/D: Buying pressure (accumulation)
- Falling A/D: Selling pressure (distribution)
- Divergence with price: Potential trend reversal

**Example:**
```typescript
const ad = VolumeIndicators.adLine(high, low, close, volume);
const last = ad[ad.length - 1];
const prev = ad[ad.length - 2];
console.log(last > prev ? 'Accumulation' : 'Distribution');
```

---

## Error Handling

All indicators throw `IndicatorError` for invalid inputs:

```typescript
try {
  const sma = Indicators.sma([], 5);
} catch (error) {
  if (error instanceof IndicatorError) {
    console.error('Indicator error:', error.message);
  }
}
```

## Best Practices

1. **Data Validation**: Always ensure sufficient data points
2. **NaN Handling**: Early values may be NaN due to insufficient history
3. **Period Selection**: Longer periods = smoother but more lag
4. **Combination**: Use multiple indicators for confirmation
5. **Backtesting**: Always backtest indicator-based strategies

## Performance Tips

1. Cache indicator results when possible
2. Use appropriate periods for your timeframe
3. Consider computational cost for real-time applications
4. Batch calculate indicators before strategy execution
