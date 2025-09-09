# MeridianAlgo.js API Documentation

Complete API reference for MeridianAlgo.js quantitative finance library.

## 📚 Table of Contents

- [Installation](#installation)
- [Core Indicators](#core-indicators)
- [Volume Indicators](#volume-indicators)
- [Volatility Indicators](#volatility-indicators)
- [Momentum Indicators](#momentum-indicators)
- [Performance Metrics](#performance-metrics)
- [Pattern Recognition](#pattern-recognition)
- [Types](#types)
- [Error Handling](#error-handling)

## 📦 Installation

```bash
npm install meridianalgo-js
```

```typescript
import { 
  Indicators, 
  VolumeIndicators, 
  VolatilityIndicators, 
  MomentumIndicators, 
  PerformanceMetrics, 
  PatternRecognition 
} from 'meridianalgo-js';
```

## 🎯 Core Indicators

### Moving Averages

#### `Indicators.sma(data, period)`

Calculate Simple Moving Average.

**Parameters:**
- `data: number[]` - Array of price data
- `period: number` - Number of periods for calculation

**Returns:** `number[]` - Array of SMA values

**Example:**
```typescript
const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
const sma = Indicators.sma(prices, 5);
// Returns: [NaN, NaN, NaN, NaN, 102.2, 103, 103.8, 104.6, 105.4, 106.2]
```

#### `Indicators.ema(data, period)`

Calculate Exponential Moving Average.

**Parameters:**
- `data: number[]` - Array of price data
- `period: number` - Number of periods for calculation

**Returns:** `number[]` - Array of EMA values

#### `Indicators.wma(data, period)`

Calculate Weighted Moving Average.

**Parameters:**
- `data: number[]` - Array of price data
- `period: number` - Number of periods for calculation

**Returns:** `number[]` - Array of WMA values

#### `Indicators.dema(data, period)`

Calculate Double Exponential Moving Average.

**Parameters:**
- `data: number[]` - Array of price data
- `period: number` - Number of periods for calculation

**Returns:** `number[]` - Array of DEMA values

#### `Indicators.tema(data, period)`

Calculate Triple Exponential Moving Average.

**Parameters:**
- `data: number[]` - Array of price data
- `period: number` - Number of periods for calculation

**Returns:** `number[]` - Array of TEMA values

#### `Indicators.kama(data, period)`

Calculate Kaufman's Adaptive Moving Average.

**Parameters:**
- `data: number[]` - Array of price data
- `period: number` - Number of periods for calculation

**Returns:** `number[]` - Array of KAMA values

#### `Indicators.t3(data, period)`

Calculate T3 Moving Average.

**Parameters:**
- `data: number[]` - Array of price data
- `period: number` - Number of periods for calculation

**Returns:** `number[]` - Array of T3 values

### Oscillators

#### `Indicators.rsi(data, period)`

Calculate Relative Strength Index.

**Parameters:**
- `data: number[]` - Array of price data
- `period: number` - Number of periods for calculation (default: 14)

**Returns:** `number[]` - Array of RSI values (0-100)

**Example:**
```typescript
const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
const rsi = Indicators.rsi(prices, 14);
// Returns: [NaN, NaN, ..., 65.4, 67.2, 69.1] (first 13 values are NaN)
```

#### `Indicators.macd(data, fastPeriod, slowPeriod, signalPeriod)`

Calculate Moving Average Convergence Divergence.

**Parameters:**
- `data: number[]` - Array of price data
- `fastPeriod: number` - Fast EMA period (default: 12)
- `slowPeriod: number` - Slow EMA period (default: 26)
- `signalPeriod: number` - Signal line period (default: 9)

**Returns:** `{macd: number[], signal: number[], histogram: number[]}`

**Example:**
```typescript
const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
const macd = Indicators.macd(prices, 12, 26, 9);
console.log('MACD Line:', macd.macd);
console.log('Signal Line:', macd.signal);
console.log('Histogram:', macd.histogram);
```

#### `Indicators.stochastic(high, low, close, kPeriod, dPeriod)`

Calculate Stochastic Oscillator.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `kPeriod: number` - %K period (default: 14)
- `dPeriod: number` - %D period (default: 3)

**Returns:** `{k: number[], d: number[]}`

#### `Indicators.williamsR(high, low, close, period)`

Calculate Williams %R.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `period: number` - Number of periods (default: 14)

**Returns:** `number[]` - Array of Williams %R values (-100 to 0)

#### `Indicators.cci(high, low, close, period)`

Calculate Commodity Channel Index.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `period: number` - Number of periods (default: 20)

**Returns:** `number[]` - Array of CCI values

#### `Indicators.adx(high, low, close, period)`

Calculate Average Directional Index.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `period: number` - Number of periods (default: 14)

**Returns:** `number[]` - Array of ADX values (0-100)

### Volatility Indicators

#### `Indicators.bollingerBands(data, period, stdDev, maType)`

Calculate Bollinger Bands.

**Parameters:**
- `data: number[]` - Array of price data
- `period: number` - Number of periods (default: 20)
- `stdDev: number` - Standard deviation multiplier (default: 2)
- `maType: MovingAverageType` - Moving average type (default: 'sma')

**Returns:** `{upper: number[], middle: number[], lower: number[]}`

**Example:**
```typescript
const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
const bb = Indicators.bollingerBands(prices, 20, 2);
console.log('Upper Band:', bb.upper);
console.log('Middle Band:', bb.middle);
console.log('Lower Band:', bb.lower);
```

#### `Indicators.atr(high, low, close, period)`

Calculate Average True Range.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `period: number` - Number of periods (default: 14)

**Returns:** `number[]` - Array of ATR values

#### `Indicators.donchianChannels(high, low, period)`

Calculate Donchian Channels.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `period: number` - Number of periods (default: 20)

**Returns:** `{upper: number[], lower: number[]}`

## 📊 Volume Indicators

### `VolumeIndicators.vwap(high, low, close, volume, period?)`

Calculate Volume Weighted Average Price.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `volume: number[]` - Array of volume values
- `period?: number` - Optional period for rolling VWAP

**Returns:** `number[]` - Array of VWAP values

**Example:**
```typescript
const high = [101, 103, 102, 104, 106];
const low = [99, 101, 100, 102, 104];
const close = [100, 102, 101, 103, 105];
const volume = [1000, 1200, 1100, 1300, 1400];

const vwap = VolumeIndicators.vwap(high, low, close, volume);
// Returns cumulative VWAP values

const vwap5 = VolumeIndicators.vwap(high, low, close, volume, 5);
// Returns 5-period rolling VWAP values
```

### `VolumeIndicators.vwma(prices, volume, period)`

Calculate Volume Weighted Moving Average.

**Parameters:**
- `prices: number[]` - Array of price data
- `volume: number[]` - Array of volume values
- `period: number` - Number of periods

**Returns:** `number[]` - Array of VWMA values

### `VolumeIndicators.mfi(high, low, close, volume, period)`

Calculate Money Flow Index.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `volume: number[]` - Array of volume values
- `period: number` - Number of periods (default: 14)

**Returns:** `number[]` - Array of MFI values (0-100)

### `VolumeIndicators.cmf(high, low, close, volume, period)`

Calculate Chaikin Money Flow.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `volume: number[]` - Array of volume values
- `period: number` - Number of periods (default: 20)

**Returns:** `number[]` - Array of CMF values

### `VolumeIndicators.obv(close, volume)`

Calculate On-Balance Volume.

**Parameters:**
- `close: number[]` - Array of closing prices
- `volume: number[]` - Array of volume values

**Returns:** `number[]` - Array of OBV values

### `VolumeIndicators.vpt(close, volume)`

Calculate Volume Price Trend.

**Parameters:**
- `close: number[]` - Array of closing prices
- `volume: number[]` - Array of volume values

**Returns:** `number[]` - Array of VPT values

### `VolumeIndicators.nvi(close, volume)`

Calculate Negative Volume Index.

**Parameters:**
- `close: number[]` - Array of closing prices
- `volume: number[]` - Array of volume values

**Returns:** `number[]` - Array of NVI values

### `VolumeIndicators.pvi(close, volume)`

Calculate Positive Volume Index.

**Parameters:**
- `close: number[]` - Array of closing prices
- `volume: number[]` - Array of volume values

**Returns:** `number[]` - Array of PVI values

### `VolumeIndicators.emv(high, low, volume, period)`

Calculate Ease of Movement.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `volume: number[]` - Array of volume values
- `period: number` - Number of periods (default: 14)

**Returns:** `number[]` - Array of EMV values

### `VolumeIndicators.volumeOscillator(volume, shortPeriod, longPeriod)`

Calculate Volume Oscillator.

**Parameters:**
- `volume: number[]` - Array of volume values
- `shortPeriod: number` - Short period (default: 5)
- `longPeriod: number` - Long period (default: 10)

**Returns:** `number[]` - Array of volume oscillator values

## 📈 Volatility Indicators

### `VolatilityIndicators.keltnerChannels(high, low, close, period, multiplier)`

Calculate Keltner Channels.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `period: number` - Number of periods (default: 20)
- `multiplier: number` - ATR multiplier (default: 2)

**Returns:** `{upper: number[], middle: number[], lower: number[]}`

### `VolatilityIndicators.standardDeviation(prices, period)`

Calculate Standard Deviation.

**Parameters:**
- `prices: number[]` - Array of price data
- `period: number` - Number of periods (default: 20)

**Returns:** `number[]` - Array of standard deviation values

### `VolatilityIndicators.variance(prices, period)`

Calculate Variance.

**Parameters:**
- `prices: number[]` - Array of price data
- `period: number` - Number of periods (default: 20)

**Returns:** `number[]` - Array of variance values

### `VolatilityIndicators.averageDeviation(prices, period)`

Calculate Average Deviation.

**Parameters:**
- `prices: number[]` - Array of price data
- `period: number` - Number of periods (default: 20)

**Returns:** `number[]` - Array of average deviation values

### `VolatilityIndicators.historicalVolatility(prices, period, annualized)`

Calculate Historical Volatility.

**Parameters:**
- `prices: number[]` - Array of price data
- `period: number` - Number of periods (default: 20)
- `annualized: boolean` - Whether to annualize (default: true)

**Returns:** `number[]` - Array of historical volatility values

### `VolatilityIndicators.parkinsonVolatility(high, low, period, annualized)`

Calculate Parkinson Volatility.

**Parameters:**
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `period: number` - Number of periods (default: 20)
- `annualized: boolean` - Whether to annualize (default: true)

**Returns:** `number[]` - Array of Parkinson volatility values

### `VolatilityIndicators.garmanKlassVolatility(open, high, low, close, period, annualized)`

Calculate Garman-Klass Volatility.

**Parameters:**
- `open: number[]` - Array of opening prices
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `period: number` - Number of periods (default: 20)
- `annualized: boolean` - Whether to annualize (default: true)

**Returns:** `number[]` - Array of Garman-Klass volatility values

### `VolatilityIndicators.rogersSatchellVolatility(open, high, low, close, period, annualized)`

Calculate Rogers-Satchell Volatility.

**Parameters:**
- `open: number[]` - Array of opening prices
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `period: number` - Number of periods (default: 20)
- `annualized: boolean` - Whether to annualize (default: true)

**Returns:** `number[]` - Array of Rogers-Satchell volatility values

### `VolatilityIndicators.yangZhangVolatility(open, high, low, close, period, annualized)`

Calculate Yang-Zhang Volatility.

**Parameters:**
- `open: number[]` - Array of opening prices
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `period: number` - Number of periods (default: 20)
- `annualized: boolean` - Whether to annualize (default: true)

**Returns:** `number[]` - Array of Yang-Zhang volatility values

### `VolatilityIndicators.volatilityRatio(prices, shortPeriod, longPeriod)`

Calculate Volatility Ratio.

**Parameters:**
- `prices: number[]` - Array of price data
- `shortPeriod: number` - Short period (default: 5)
- `longPeriod: number` - Long period (default: 10)

**Returns:** `number[]` - Array of volatility ratio values

## 🚀 Momentum Indicators

### `MomentumIndicators.roc(prices, period)`

Calculate Rate of Change.

**Parameters:**
- `prices: number[]` - Array of price data
- `period: number` - Number of periods (default: 10)

**Returns:** `number[]` - Array of ROC values (percentage)

### `MomentumIndicators.momentum(prices, period)`

Calculate Momentum.

**Parameters:**
- `prices: number[]` - Array of price data
- `period: number` - Number of periods (default: 10)

**Returns:** `number[]` - Array of momentum values

### `MomentumIndicators.cmo(prices, period)`

Calculate Chande Momentum Oscillator.

**Parameters:**
- `prices: number[]` - Array of price data
- `period: number` - Number of periods (default: 14)

**Returns:** `number[]` - Array of CMO values (-100 to 100)

### `MomentumIndicators.rvi(open, high, low, close, period)`

Calculate Relative Volatility Index.

**Parameters:**
- `open: number[]` - Array of opening prices
- `high: number[]` - Array of high prices
- `low: number[]` - Array of low prices
- `close: number[]` - Array of closing prices
- `period: number` - Number of periods (default: 14)

**Returns:** `{rvi: number[], signal: number[]}`

### `MomentumIndicators.ppo(prices, fastPeriod, slowPeriod)`

Calculate Percentage Price Oscillator.

**Parameters:**
- `prices: number[]` - Array of price data
- `fastPeriod: number` - Fast period (default: 12)
- `slowPeriod: number` - Slow period (default: 26)

**Returns:** `number[]` - Array of PPO values

### `MomentumIndicators.pvo(volume, fastPeriod, slowPeriod)`

Calculate Percentage Volume Oscillator.

**Parameters:**
- `volume: number[]` - Array of volume values
- `fastPeriod: number` - Fast period (default: 12)
- `slowPeriod: number` - Slow period (default: 26)

**Returns:** `number[]` - Array of PVO values

### `MomentumIndicators.dpo(prices, period)`

Calculate Detrended Price Oscillator.

**Parameters:**
- `prices: number[]` - Array of price data
- `period: number` - Number of periods (default: 20)

**Returns:** `number[]` - Array of DPO values

### `MomentumIndicators.chandeForecastOscillator(prices, period)`

Calculate Chande Forecast Oscillator.

**Parameters:**
- `prices: number[]` - Array of price data
- `period: number` - Number of periods (default: 14)

**Returns:** `number[]` - Array of Chande Forecast Oscillator values

### `MomentumIndicators.coppockCurve(prices, roc1, roc2, wmaPeriod)`

Calculate Coppock Curve.

**Parameters:**
- `prices: number[]` - Array of price data
- `roc1: number` - First ROC period (default: 14)
- `roc2: number` - Second ROC period (default: 11)
- `wmaPeriod: number` - WMA period (default: 10)

**Returns:** `number[]` - Array of Coppock Curve values

### `MomentumIndicators.kst(prices, roc1, roc2, roc3, roc4, sma1, sma2, sma3, sma4)`

Calculate Know Sure Thing Oscillator.

**Parameters:**
- `prices: number[]` - Array of price data
- `roc1: number` - First ROC period (default: 10)
- `roc2: number` - Second ROC period (default: 15)
- `roc3: number` - Third ROC period (default: 20)
- `roc4: number` - Fourth ROC period (default: 30)
- `sma1: number` - First SMA period (default: 10)
- `sma2: number` - Second SMA period (default: 10)
- `sma3: number` - Third SMA period (default: 10)
- `sma4: number` - Fourth SMA period (default: 15)

**Returns:** `{kst: number[], signal: number[]}`

## 📊 Performance Metrics

### `PerformanceMetrics.sharpeRatio(returns, riskFreeRate, annualized)`

Calculate Sharpe Ratio.

**Parameters:**
- `returns: number[]` - Array of returns
- `riskFreeRate: number` - Risk-free rate (default: 0.02)
- `annualized: boolean` - Whether to annualize (default: true)

**Returns:** `number` - Sharpe ratio

### `PerformanceMetrics.sortinoRatio(returns, riskFreeRate, annualized)`

Calculate Sortino Ratio.

**Parameters:**
- `returns: number[]` - Array of returns
- `riskFreeRate: number` - Risk-free rate (default: 0.02)
- `annualized: boolean` - Whether to annualize (default: true)

**Returns:** `number` - Sortino ratio

### `PerformanceMetrics.calmarRatio(returns, maxDrawdown)`

Calculate Calmar Ratio.

**Parameters:**
- `returns: number[]` - Array of returns
- `maxDrawdown: number` - Maximum drawdown

**Returns:** `number` - Calmar ratio

### `PerformanceMetrics.informationRatio(returns, benchmarkReturns)`

Calculate Information Ratio.

**Parameters:**
- `returns: number[]` - Array of returns
- `benchmarkReturns: number[]` - Array of benchmark returns

**Returns:** `number` - Information ratio

### `PerformanceMetrics.valueAtRisk(returns, confidence)`

Calculate Value at Risk.

**Parameters:**
- `returns: number[]` - Array of returns
- `confidence: number` - Confidence level (0-1, default: 0.95)

**Returns:** `number` - Value at Risk

### `PerformanceMetrics.conditionalValueAtRisk(returns, confidence)`

Calculate Conditional Value at Risk.

**Parameters:**
- `returns: number[]` - Array of returns
- `confidence: number` - Confidence level (0-1, default: 0.95)

**Returns:** `number` - Conditional Value at Risk

### `PerformanceMetrics.maxDrawdown(prices)`

Calculate Maximum Drawdown.

**Parameters:**
- `prices: number[]` - Array of prices

**Returns:** `number` - Maximum drawdown

### `PerformanceMetrics.beta(returns, benchmarkReturns)`

Calculate Beta.

**Parameters:**
- `returns: number[]` - Array of returns
- `benchmarkReturns: number[]` - Array of benchmark returns

**Returns:** `number` - Beta

### `PerformanceMetrics.alpha(returns, benchmarkReturns, riskFreeRate)`

Calculate Alpha.

**Parameters:**
- `returns: number[]` - Array of returns
- `benchmarkReturns: number[]` - Array of benchmark returns
- `riskFreeRate: number` - Risk-free rate (default: 0.02)

**Returns:** `number` - Alpha

### `PerformanceMetrics.winRate(returns)`

Calculate Win Rate.

**Parameters:**
- `returns: number[]` - Array of returns

**Returns:** `number` - Win rate (0-1)

### `PerformanceMetrics.profitFactor(returns)`

Calculate Profit Factor.

**Parameters:**
- `returns: number[]` - Array of returns

**Returns:** `number` - Profit factor

### `PerformanceMetrics.performanceAnalysis(returns, benchmarkReturns, riskFreeRate)`

Calculate comprehensive performance analysis.

**Parameters:**
- `returns: number[]` - Array of returns
- `benchmarkReturns: number[]` - Array of benchmark returns
- `riskFreeRate: number` - Risk-free rate (default: 0.02)

**Returns:** `PerformanceAnalysis` - Comprehensive performance metrics

## 🔍 Pattern Recognition

### `PatternRecognition.detectDoji(candle, threshold)`

Detect Doji pattern.

**Parameters:**
- `candle: Candlestick` - Candlestick data
- `threshold: number` - Threshold for body size (default: 0.1)

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectHammer(candle)`

Detect Hammer pattern.

**Parameters:**
- `candle: Candlestick` - Candlestick data

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectShootingStar(candle)`

Detect Shooting Star pattern.

**Parameters:**
- `candle: Candlestick` - Candlestick data

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectBullishEngulfing(prevCandle, currentCandle)`

Detect Bullish Engulfing pattern.

**Parameters:**
- `prevCandle: Candlestick` - Previous candlestick
- `currentCandle: Candlestick` - Current candlestick

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectBearishEngulfing(prevCandle, currentCandle)`

Detect Bearish Engulfing pattern.

**Parameters:**
- `prevCandle: Candlestick` - Previous candlestick
- `currentCandle: Candlestick` - Current candlestick

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectMorningStar(candles)`

Detect Morning Star pattern.

**Parameters:**
- `candles: Candlestick[]` - Array of 3 candlesticks

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectEveningStar(candles)`

Detect Evening Star pattern.

**Parameters:**
- `candles: Candlestick[]` - Array of 3 candlesticks

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectBullishHarami(prevCandle, currentCandle)`

Detect Bullish Harami pattern.

**Parameters:**
- `prevCandle: Candlestick` - Previous candlestick
- `currentCandle: Candlestick` - Current candlestick

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectBearishHarami(prevCandle, currentCandle)`

Detect Bearish Harami pattern.

**Parameters:**
- `prevCandle: Candlestick` - Previous candlestick
- `currentCandle: Candlestick` - Current candlestick

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectThreeWhiteSoldiers(candles)`

Detect Three White Soldiers pattern.

**Parameters:**
- `candles: Candlestick[]` - Array of 3 candlesticks

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectThreeBlackCrows(candles)`

Detect Three Black Crows pattern.

**Parameters:**
- `candles: Candlestick[]` - Array of 3 candlesticks

**Returns:** `PatternResult | null` - Pattern result or null

### `PatternRecognition.detectAllPatterns(candles)`

Detect all patterns in candlestick data.

**Parameters:**
- `candles: Candlestick[]` - Array of candlesticks

**Returns:** `PatternResult[]` - Array of detected patterns

## 🏷️ Types

### `Candlestick`

```typescript
interface Candlestick {
  open: number;
  high: number;
  low: number;
  close: number;
}
```

### `PatternResult`

```typescript
interface PatternResult {
  pattern: string;
  bullish: boolean;
  bearish: boolean;
  confidence: number;
  description: string;
}
```

### `PerformanceAnalysis`

```typescript
interface PerformanceAnalysis {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  winRate: number;
  profitFactor: number;
  valueAtRisk95: number;
  conditionalVaR95: number;
}
```

### `MovingAverageType`

```typescript
type MovingAverageType = 'sma' | 'ema' | 'wma' | 'dema' | 'tema' | 'kama' | 't3';
```

## ⚠️ Error Handling

### `IndicatorError`

Custom error class for indicator-related errors.

```typescript
class IndicatorError extends Error {
  constructor(message: string);
}
```

**Example:**
```typescript
try {
  const sma = Indicators.sma([], 5);
} catch (error) {
  if (error instanceof IndicatorError) {
    console.log('Indicator error:', error.message);
  }
}
```

## 📝 Usage Examples

### Basic Usage

```typescript
import { Indicators } from 'meridianalgo-js';

const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];

// Calculate Simple Moving Average
const sma = Indicators.sma(prices, 5);
console.log('SMA:', sma);

// Calculate RSI
const rsi = Indicators.rsi(prices, 14);
console.log('RSI:', rsi);

// Calculate MACD
const macd = Indicators.macd(prices, 12, 26, 9);
console.log('MACD:', macd);
```

### Advanced Usage

```typescript
import { 
  Indicators, 
  VolumeIndicators, 
  PerformanceMetrics, 
  PatternRecognition 
} from 'meridianalgo-js';

// Volume analysis
const vwap = VolumeIndicators.vwap(high, low, close, volume);
const mfi = VolumeIndicators.mfi(high, low, close, volume, 14);

// Performance analysis
const returns = [0.01, 0.02, -0.01, 0.03, -0.02];
const sharpe = PerformanceMetrics.sharpeRatio(returns, 0.02, true);
const maxDD = PerformanceMetrics.maxDrawdown(prices);

// Pattern recognition
const patterns = PatternRecognition.detectAllPatterns(candlesticks);
```

### Trading Strategy Example

```typescript
import { Indicators, VolumeIndicators } from 'meridianalgo-js';

class TradingStrategy {
  generateSignals(prices: number[], high: number[], low: number[], close: number[], volume: number[]) {
    // Calculate indicators
    const sma20 = Indicators.sma(prices, 20);
    const sma50 = Indicators.sma(prices, 50);
    const rsi = Indicators.rsi(prices, 14);
    const vwap = VolumeIndicators.vwap(high, low, close, volume);
    const bollinger = Indicators.bollingerBands(prices, 20, 2);

    const currentPrice = prices[prices.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
    const currentRSI = rsi[rsi.length - 1];
    const currentVWAP = vwap[vwap.length - 1];

    // Generate signals
    const signals = [];

    // Trend following
    if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
      signals.push({ type: 'BUY', reason: 'Uptrend confirmed' });
    }

    // Mean reversion
    if (currentPrice < bollinger.lower[bollinger.lower.length - 1] && currentRSI < 30) {
      signals.push({ type: 'BUY', reason: 'Oversold bounce' });
    }

    // Volume confirmation
    if (currentPrice > currentVWAP) {
      signals.push({ type: 'BUY', reason: 'Above VWAP' });
    }

    return signals;
  }
}
```

---

**For more examples and detailed documentation, visit:** https://meridianalgo.org/docs

**Made with ❤️ by the MeridianAlgo team**
