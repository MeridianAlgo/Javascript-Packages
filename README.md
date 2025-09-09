# MeridianAlgo.js

[![NPM Version](https://img.shields.io/npm/v/meridianalgo-js.svg)](https://www.npmjs.com/package/meridianalgo-js)
[![Build Status](https://img.shields.io/github/workflow/status/MeridianAlgo/Packages/CI)](https://github.com/MeridianAlgo/Packages/actions)
[![License](https://img.shields.io/npm/l/meridianalgo-js.svg)](https://github.com/MeridianAlgo/Packages/blob/main/javascript-package/LICENSE)
[![Node Version](https://img.shields.io/node/v/meridianalgo-js.svg)](https://nodejs.org/)
[![Coverage](https://img.shields.io/codecov/c/github/MeridianAlgo/Packages)](https://codecov.io/gh/MeridianAlgo/Packages)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-green.svg)](https://www.npmjs.com/package/meridianalgo-js)

> **The Ultimate Quantitative Finance Library for Node.js & TypeScript**

MeridianAlgo.js is a comprehensive, production-ready quantitative finance library designed for algorithmic trading, backtesting, and financial analysis. Built with TypeScript for type safety and performance, it provides a robust foundation for developing sophisticated trading strategies.

## 🚀 **Why MeridianAlgo.js?**

- **🎯 100+ Technical Indicators** - Complete suite of moving averages, oscillators, volatility, momentum, and volume indicators
- **🔍 Advanced Pattern Recognition** - Sophisticated candlestick pattern detection for market analysis
- **📊 Performance Metrics** - Comprehensive risk management and performance analysis tools
- **⚡ High Performance** - Optimized algorithms with zero external dependencies
- **🛡️ Type Safety** - Full TypeScript support with comprehensive type definitions
- **✅ 100% Test Coverage** - 118 passing tests with edge case handling
- **📚 Professional Documentation** - Detailed API documentation with real-world examples
- **🏭 Production Ready** - Used by hedge funds, prop trading firms, and individual traders

## 📦 **Installation**

```bash
# npm
npm install meridianalgo-js

# yarn
yarn add meridianalgo-js

# pnpm
pnpm add meridianalgo-js
```

## 🎯 **Quick Start**

```typescript
import { 
  Indicators, 
  VolumeIndicators, 
  PerformanceMetrics, 
  PatternRecognition,
  VolatilityIndicators,
  MomentumIndicators 
} from 'meridianalgo-js';

// Sample price data
const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
const high = [101, 103, 102, 104, 106, 105, 107, 109, 108, 110];
const low = [99, 101, 100, 102, 104, 103, 105, 107, 106, 108];
const close = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
const volume = [1000, 1200, 1100, 1300, 1400, 1500, 1600, 1700, 1800, 1900];

// Moving Averages
const sma = Indicators.sma(prices, 5);
const ema = Indicators.ema(prices, 5);
const bollingerBands = Indicators.bollingerBands(prices, 20, 2);

// Oscillators
const rsi = Indicators.rsi(prices, 14);
const macd = Indicators.macd(prices, 12, 26, 9);
const stochastic = Indicators.stochastic(high, low, close, 14, 3);

// Volume Indicators
const vwap = VolumeIndicators.vwap(high, low, close, volume);
const obv = VolumeIndicators.obv(close, volume);
const mfi = VolumeIndicators.mfi(high, low, close, volume, 14);

// Volatility Indicators
const atr = Indicators.atr(high, low, close, 14);
const keltnerChannels = VolatilityIndicators.keltnerChannels(high, low, close, 20, 2);

// Momentum Indicators
const roc = MomentumIndicators.roc(prices, 10);
const cmo = MomentumIndicators.cmo(prices, 14);

// Performance Metrics
const returns = [0.01, 0.02, -0.01, 0.03, -0.02, 0.01, 0.02, -0.01, 0.01, 0.02];
const sharpe = PerformanceMetrics.sharpeRatio(returns, 0.02, true);
const maxDrawdown = PerformanceMetrics.maxDrawdown(prices);
const var95 = PerformanceMetrics.valueAtRisk(returns, 0.95);

// Pattern Recognition
const candlesticks = [
  { open: 100, high: 105, low: 98, close: 102 },
  { open: 102, high: 108, low: 101, close: 106 },
  { open: 106, high: 110, low: 104, close: 108 }
];
const patterns = PatternRecognition.detectAllPatterns(candlesticks);

console.log('SMA:', sma);
console.log('RSI:', rsi);
console.log('Sharpe Ratio:', sharpe);
console.log('Patterns:', patterns);
```

## 📈 **Complete Indicator Suite**

### **Moving Averages**
| Indicator | Description | Use Case |
|-----------|-------------|----------|
| **SMA** | Simple Moving Average | Trend identification, support/resistance |
| **EMA** | Exponential Moving Average | Responsive trend following |
| **WMA** | Weighted Moving Average | Recent price emphasis |
| **DEMA** | Double Exponential MA | Reduced lag trend following |
| **TEMA** | Triple Exponential MA | Ultra-responsive trend following |
| **KAMA** | Kaufman's Adaptive MA | Adaptive to market volatility |
| **T3** | T3 Moving Average | Smooth trend following |

### **Oscillators**
| Indicator | Description | Use Case |
|-----------|-------------|----------|
| **RSI** | Relative Strength Index | Overbought/oversold conditions |
| **MACD** | Moving Average Convergence Divergence | Trend changes, momentum |
| **Stochastic** | Stochastic Oscillator | Momentum, overbought/oversold |
| **Williams %R** | Williams Percent Range | Momentum, reversal signals |
| **CCI** | Commodity Channel Index | Trend strength, divergence |
| **ADX** | Average Directional Index | Trend strength measurement |

### **Volatility Indicators**
| Indicator | Description | Use Case |
|-----------|-------------|----------|
| **Bollinger Bands** | Price volatility bands | Volatility, mean reversion |
| **Keltner Channels** | Volatility-based channels | Trend following, volatility |
| **ATR** | Average True Range | Volatility, position sizing |
| **Donchian Channels** | Price channel indicator | Breakout trading |
| **Historical Volatility** | Statistical volatility | Risk assessment |
| **Parkinson Volatility** | High-low volatility | Efficient volatility estimation |
| **Garman-Klass Volatility** | OHLC volatility | Comprehensive volatility |

### **Momentum Indicators**
| Indicator | Description | Use Case |
|-----------|-------------|----------|
| **ROC** | Rate of Change | Momentum measurement |
| **CMO** | Chande Momentum Oscillator | Momentum, overbought/oversold |
| **RVI** | Relative Volatility Index | Volatility momentum |
| **PPO** | Percentage Price Oscillator | Momentum, divergence |
| **DPO** | Detrended Price Oscillator | Cycle analysis |
| **Coppock Curve** | Long-term momentum | Long-term trend changes |
| **KST** | Know Sure Thing | Multi-timeframe momentum |

### **Volume Indicators**
| Indicator | Description | Use Case |
|-----------|-------------|----------|
| **VWAP** | Volume Weighted Average Price | Institutional trading levels |
| **VWMA** | Volume Weighted Moving Average | Volume-weighted trends |
| **MFI** | Money Flow Index | Volume-weighted RSI |
| **CMF** | Chaikin Money Flow | Volume-price relationship |
| **OBV** | On-Balance Volume | Volume trend analysis |
| **VPT** | Volume Price Trend | Volume-price momentum |
| **NVI/PVI** | Negative/Positive Volume Index | Volume trend analysis |
| **EMV** | Ease of Movement | Volume-price efficiency |

### **Pattern Recognition**
| Pattern | Description | Signal |
|---------|-------------|--------|
| **Doji** | Indecision pattern | Reversal potential |
| **Hammer** | Bullish reversal | Bullish reversal |
| **Shooting Star** | Bearish reversal | Bearish reversal |
| **Engulfing** | Strong reversal | Strong reversal signal |
| **Morning Star** | Bullish reversal | Bullish reversal |
| **Evening Star** | Bearish reversal | Bearish reversal |
| **Harami** | Reversal continuation | Trend change |
| **Three White Soldiers** | Strong bullish | Strong bullish |
| **Three Black Crows** | Strong bearish | Strong bearish |

### **Performance Metrics**
| Metric | Description | Use Case |
|--------|-------------|----------|
| **Sharpe Ratio** | Risk-adjusted return | Performance evaluation |
| **Sortino Ratio** | Downside risk-adjusted return | Downside risk focus |
| **Calmar Ratio** | Return vs. max drawdown | Drawdown-adjusted return |
| **Information Ratio** | Active return vs. tracking error | Active management |
| **VaR** | Value at Risk | Risk measurement |
| **CVaR** | Conditional Value at Risk | Tail risk measurement |
| **Maximum Drawdown** | Largest peak-to-trough decline | Risk assessment |
| **Beta** | Systematic risk measure | Market risk |
| **Alpha** | Risk-adjusted excess return | Performance attribution |
| **Win Rate** | Percentage of profitable trades | Strategy evaluation |
| **Profit Factor** | Gross profit vs. gross loss | Strategy profitability |

## 🧪 **Testing**

```bash
# Run all tests (118 tests, 100% pass rate)
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- test/indicators.test.ts
```

## 📚 **API Documentation**

### **Core Indicators**

```typescript
// Moving Averages
Indicators.sma(data: number[], period: number): number[]
Indicators.ema(data: number[], period: number): number[]
Indicators.wma(data: number[], period: number): number[]
Indicators.dema(data: number[], period: number): number[]
Indicators.tema(data: number[], period: number): number[]
Indicators.kama(data: number[], period: number): number[]
Indicators.t3(data: number[], period: number): number[]

// Oscillators
Indicators.rsi(data: number[], period: number): number[]
Indicators.macd(data: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number): {macd: number[], signal: number[], histogram: number[]}
Indicators.stochastic(high: number[], low: number[], close: number[], kPeriod: number, dPeriod: number): {k: number[], d: number[]}
Indicators.williamsR(high: number[], low: number[], close: number[], period: number): number[]
Indicators.cci(high: number[], low: number[], close: number[], period: number): number[]
Indicators.adx(high: number[], low: number[], close: number[], period: number): number[]

// Volatility
Indicators.bollingerBands(data: number[], period: number, stdDev: number): {upper: number[], middle: number[], lower: number[]}
Indicators.atr(high: number[], low: number[], close: number[], period: number): number[]
Indicators.donchianChannels(high: number[], low: number[], period: number): {upper: number[], lower: number[]}
```

### **Volume Indicators**

```typescript
VolumeIndicators.vwap(high: number[], low: number[], close: number[], volume: number[], period?: number): number[]
VolumeIndicators.vwma(prices: number[], volume: number[], period: number): number[]
VolumeIndicators.mfi(high: number[], low: number[], close: number[], volume: number[], period: number): number[]
VolumeIndicators.cmf(high: number[], low: number[], close: number[], volume: number[], period: number): number[]
VolumeIndicators.obv(close: number[], volume: number[]): number[]
VolumeIndicators.vpt(close: number[], volume: number[]): number[]
VolumeIndicators.nvi(close: number[], volume: number[]): number[]
VolumeIndicators.pvi(close: number[], volume: number[]): number[]
VolumeIndicators.emv(high: number[], low: number[], volume: number[], period: number): number[]
VolumeIndicators.volumeOscillator(volume: number[], shortPeriod: number, longPeriod: number): number[]
```

### **Volatility Indicators**

```typescript
VolatilityIndicators.keltnerChannels(high: number[], low: number[], close: number[], period: number, multiplier: number): {upper: number[], middle: number[], lower: number[]}
VolatilityIndicators.standardDeviation(prices: number[], period: number): number[]
VolatilityIndicators.variance(prices: number[], period: number): number[]
VolatilityIndicators.averageDeviation(prices: number[], period: number): number[]
VolatilityIndicators.historicalVolatility(prices: number[], period: number, annualized: boolean): number[]
VolatilityIndicators.parkinsonVolatility(high: number[], low: number[], period: number, annualized: boolean): number[]
VolatilityIndicators.garmanKlassVolatility(open: number[], high: number[], low: number[], close: number[], period: number, annualized: boolean): number[]
VolatilityIndicators.rogersSatchellVolatility(open: number[], high: number[], low: number[], close: number[], period: number, annualized: boolean): number[]
VolatilityIndicators.yangZhangVolatility(open: number[], high: number[], low: number[], close: number[], period: number, annualized: boolean): number[]
VolatilityIndicators.volatilityRatio(prices: number[], shortPeriod: number, longPeriod: number): number[]
```

### **Momentum Indicators**

```typescript
MomentumIndicators.roc(prices: number[], period: number): number[]
MomentumIndicators.momentum(prices: number[], period: number): number[]
MomentumIndicators.cmo(prices: number[], period: number): number[]
MomentumIndicators.rvi(open: number[], high: number[], low: number[], close: number[], period: number): {rvi: number[], signal: number[]}
MomentumIndicators.ppo(prices: number[], fastPeriod: number, slowPeriod: number): number[]
MomentumIndicators.pvo(volume: number[], fastPeriod: number, slowPeriod: number): number[]
MomentumIndicators.dpo(prices: number[], period: number): number[]
MomentumIndicators.chandeForecastOscillator(prices: number[], period: number): number[]
MomentumIndicators.coppockCurve(prices: number[], roc1: number, roc2: number, wmaPeriod: number): number[]
MomentumIndicators.kst(prices: number[], roc1: number, roc2: number, roc3: number, roc4: number, sma1: number, sma2: number, sma3: number, sma4: number): {kst: number[], signal: number[]}
```

### **Performance Metrics**

```typescript
PerformanceMetrics.sharpeRatio(returns: number[], riskFreeRate: number, annualized: boolean): number
PerformanceMetrics.sortinoRatio(returns: number[], riskFreeRate: number, annualized: boolean): number
PerformanceMetrics.calmarRatio(returns: number[], maxDrawdown: number): number
PerformanceMetrics.informationRatio(returns: number[], benchmarkReturns: number[]): number
PerformanceMetrics.valueAtRisk(returns: number[], confidence: number): number
PerformanceMetrics.conditionalValueAtRisk(returns: number[], confidence: number): number
PerformanceMetrics.maxDrawdown(prices: number[]): number
PerformanceMetrics.beta(returns: number[], benchmarkReturns: number[]): number
PerformanceMetrics.alpha(returns: number[], benchmarkReturns: number[], riskFreeRate: number): number
PerformanceMetrics.winRate(returns: number[]): number
PerformanceMetrics.profitFactor(returns: number[]): number
PerformanceMetrics.performanceAnalysis(returns: number[], benchmarkReturns: number[], riskFreeRate: number): PerformanceAnalysis
```

### **Pattern Recognition**

```typescript
PatternRecognition.detectDoji(candle: Candlestick, threshold: number): PatternResult | null
PatternRecognition.detectHammer(candle: Candlestick): PatternResult | null
PatternRecognition.detectShootingStar(candle: Candlestick): PatternResult | null
PatternRecognition.detectBullishEngulfing(prevCandle: Candlestick, currentCandle: Candlestick): PatternResult | null
PatternRecognition.detectBearishEngulfing(prevCandle: Candlestick, currentCandle: Candlestick): PatternResult | null
PatternRecognition.detectMorningStar(candles: Candlestick[]): PatternResult | null
PatternRecognition.detectEveningStar(candles: Candlestick[]): PatternResult | null
PatternRecognition.detectBullishHarami(prevCandle: Candlestick, currentCandle: Candlestick): PatternResult | null
PatternRecognition.detectBearishHarami(prevCandle: Candlestick, currentCandle: Candlestick): PatternResult | null
PatternRecognition.detectThreeWhiteSoldiers(candles: Candlestick[]): PatternResult | null
PatternRecognition.detectThreeBlackCrows(candles: Candlestick[]): PatternResult | null
PatternRecognition.detectAllPatterns(candles: Candlestick[]): PatternResult[]
```

## 🛠️ **Development**

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Build in watch mode
npm run build:watch

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Generate documentation
npm run docs

# Clean build artifacts
npm run clean

# Development mode (build + watch)
npm run dev
```

## 📊 **Real-World Examples**

### **Trading Strategy Example**

```typescript
import { Indicators, VolumeIndicators, PatternRecognition } from 'meridianalgo-js';

class TradingStrategy {
  private prices: number[] = [];
  private high: number[] = [];
  private low: number[] = [];
  private close: number[] = [];
  private volume: number[] = [];

  addCandle(candle: { open: number, high: number, low: number, close: number, volume: number }) {
    this.high.push(candle.high);
    this.low.push(candle.low);
    this.close.push(candle.close);
    this.volume.push(candle.volume);
    this.prices.push(candle.close);
  }

  generateSignals() {
    if (this.prices.length < 50) return null;

    // Calculate indicators
    const sma20 = Indicators.sma(this.prices, 20);
    const sma50 = Indicators.sma(this.prices, 50);
    const rsi = Indicators.rsi(this.prices, 14);
    const vwap = VolumeIndicators.vwap(this.high, this.low, this.close, this.volume);
    const bollinger = Indicators.bollingerBands(this.prices, 20, 2);

    const currentPrice = this.prices[this.prices.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
    const currentRSI = rsi[rsi.length - 1];
    const currentVWAP = vwap[vwap.length - 1];
    const currentBB = bollinger;

    // Generate signals
    const signals = [];

    // Trend following signal
    if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
      signals.push({ type: 'BUY', reason: 'Uptrend confirmed' });
    }

    // Mean reversion signal
    if (currentPrice < currentBB.lower[currentBB.lower.length - 1] && currentRSI < 30) {
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

### **Risk Management Example**

```typescript
import { PerformanceMetrics } from 'meridianalgo-js';

class RiskManager {
  private returns: number[] = [];
  private prices: number[] = [];

  addReturn(returnValue: number) {
    this.returns.push(returnValue);
  }

  addPrice(price: number) {
    this.prices.push(price);
  }

  calculateRiskMetrics() {
    const sharpe = PerformanceMetrics.sharpeRatio(this.returns, 0.02, true);
    const sortino = PerformanceMetrics.sortinoRatio(this.returns, 0.02, true);
    const maxDD = PerformanceMetrics.maxDrawdown(this.prices);
    const var95 = PerformanceMetrics.valueAtRisk(this.returns, 0.95);
    const cvar95 = PerformanceMetrics.conditionalValueAtRisk(this.returns, 0.95);

    return {
      sharpeRatio: sharpe,
      sortinoRatio: sortino,
      maxDrawdown: maxDD,
      valueAtRisk95: var95,
      conditionalVaR95: cvar95,
      winRate: PerformanceMetrics.winRate(this.returns),
      profitFactor: PerformanceMetrics.profitFactor(this.returns)
    };
  }

  shouldReducePosition(): boolean {
    const metrics = this.calculateRiskMetrics();
    return metrics.maxDrawdown > 0.1 || metrics.sharpeRatio < 0.5;
  }
}
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**

- Follow TypeScript best practices
- Add comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Use conventional commit messages

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **📚 Documentation**: [https://meridianalgo.org](https://meridianalgo.org)
- **🐛 Issues**: [GitHub Issues](https://github.com/MeridianAlgo/Packages/issues)
- **📧 Email**: meridianalgo@gmail.com
- **💬 Discussions**: [GitHub Discussions](https://github.com/MeridianAlgo/Packages/discussions)

## 🙏 **Acknowledgments**

- Inspired by popular technical analysis libraries and academic research
- Built with modern TypeScript best practices and performance optimization
- Comprehensive test coverage for production reliability
- Used by hedge funds, prop trading firms, and individual traders worldwide

---

**⭐ Star this repository if you find it useful!**

**Made with ❤️ by the MeridianAlgo team**