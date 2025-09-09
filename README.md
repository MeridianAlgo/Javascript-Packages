<div align="center">
  <h1>MeridianAlgo.js</h1>
  <p align="center">
    <strong>Advanced Algorithmic Trading Library for Node.js & TypeScript</strong>
  </p>
  <p>
    <a href="https://www.npmjs.com/package/meridianalgo" target="_blank">
      <img src="https://img.shields.io/npm/v/meridianalgo?color=blue&label=NPM%20Package" alt="NPM Version">
    </a>
    <a href="https://github.com/MeridianAlgo/Packages/actions" target="_blank">
      <img src="https://img.shields.io/github/actions/workflow/status/MeridianAlgo/Packages/js-package.yml?branch=main" alt="Build Status">
    </a>
    <a href="https://opensource.org/licenses/MIT" target="_blank">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
    </a>
    <a href="https://www.npmjs.com/package/meridianalgo" target="_blank">
      <img src="https://img.shields.io/node/v/meridianalgo" alt="Node Version">
    </a>
  </p>
  <p>
    <a href="https://meridianalgo.org" target="_blank">Website</a> • 
    <a href="https://github.com/MeridianAlgo/Packages" target="_blank">GitHub</a> • 
    <a href="https://www.npmjs.com/package/meridianalgo" target="_blank">NPM</a> • 
    <a href="mailto:meridianalgo@gmail.com">Contact</a>
  </p>
</div>

## 🚀 Introduction

MeridianAlgo.js is a high-performance TypeScript/JavaScript library for algorithmic trading and technical analysis. It's the Node.js counterpart to our popular Python library, providing the same powerful features with the flexibility of JavaScript's async/await patterns and TypeScript's type safety.

## Installation

```bash
npm install meridianalgo
```

## Usage

```typescript
import { Indicators } from 'meridianalgo';

const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const sma5 = Indicators.sma(prices, 5);
console.log('SMA(5):', sma5);

const ema5 = Indicators.ema(prices, 5);
console.log('EMA(5):', ema5);

const rsi = Indicators.rsi(prices, 14);
console.log('RSI(14):', rsi);
```

## 📊 Available Indicators

- **Moving Averages**
  - Simple Moving Average (SMA)
  - Exponential Moving Average (EMA)
  - Weighted Moving Average (WMA)
  - Volume Weighted Moving Average (VWMA)
  - Double Exponential Moving Average (DEMA)
  - Triple Exponential Moving Average (TEMA)
  - Triangular Moving Average (TRIMA)
  - Kaufman's Adaptive Moving Average (KAMA)
  - MESA Adaptive Moving Average (MAMA)

- **Oscillators**
  - Relative Strength Index (RSI)
  - Moving Average Convergence Divergence (MACD)
  - Stochastic Oscillator
  - Williams %R
  - Commodity Channel Index (CCI)
  - Awesome Oscillator
  - Klinger Oscillator
  - Chande Momentum Oscillator (CMO)
  - Rate of Change (ROC)
  - Money Flow Index (MFI)
  - True Strength Index (TSI)
  - Ultimate Oscillator
  - Williams' Accumulation/Distribution (WAD)

- **Volatility Indicators**
  - Bollinger Bands
  - Average True Range (ATR)
  - Keltner Channels
  - Donchian Channels
  - Standard Deviation
  - Variance
  - Average Deviation

- **Momentum Indicators**
  - Momentum
  - Rate of Change (ROC)
  - Chande Momentum Oscillator (CMO)
  - Relative Vigor Index (RVI)
  - Percentage Price Oscillator (PPO)
  - Percentage Volume Oscillator (PVO)
  - Detrended Price Oscillator (DPO)
  - Chande Forecast Oscillator
  - Coppock Curve
  - KST Oscillator

- **Volume Indicators**
  - On-Balance Volume (OBV)
  - Volume Weighted Average Price (VWAP)
  - Chaikin Money Flow (CMF)
  - Volume Price Trend (VPT)
  - Negative Volume Index (NVI)
  - Money Flow Index (MFI)
  - Ease of Movement (EMV)
  - Volume Oscillator

- **Cycle Indicators**
  - Hilbert Transform - Sine Wave
  - Hilbert Transform - Instantaneous Trendline
  - Hilbert Transform - Dominant Cycle Period
  - Hilbert Transform - Dominant Cycle Phase
  - Hilbert Transform - Phasor Components
  - Hilbert Transform - Trend vs Cycle Mode
  - Market Facilitation Index (MFI)

- **Pattern Recognition**
  - Candlestick Pattern Detection
  - Pivot Points
  - Support & Resistance Levels
  - Price Patterns (Head & Shoulders, Double Top/Bottom, etc.)

- **Utility Functions**
  - High/Low over period
  - Pivot Points
  - Fibonacci Retracement
  - Performance Metrics (Sharpe, Sortino, Max Drawdown, etc.)
  - Position Sizing
  - Risk Management

## 📦 Installation

```bash
# Using npm
npm install meridianalgo

# Using yarn
yarn add meridianalgo

# Using pnpm
pnpm add meridianalgo
```

## 🚀 Quick Start

### TypeScript/ES Modules
```typescript
import { Indicators, BacktestEngine, TradingEngine } from 'meridianalgo';

// Example: Calculate RSI
const prices = [45.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.29, 45.77, 45.35, 45.39];
const rsi = Indicators.rsi(prices, 14);
console.log('RSI:', rsi);

// Example: Simple Moving Average
const sma = Indicators.sma(prices, 5);
console.log('SMA(5):', sma);
```

### CommonJS
```javascript
const { Indicators } = require('meridianalgo');

// Example: MACD
const prices = [/* price data */];
const { macdLine, signalLine, histogram } = Indicators.macd(prices, 12, 26, 9);
console.log('MACD:', { macdLine, signalLine, histogram });
```

## 📚 Documentation

For complete documentation, please visit our [official documentation](https://meridianalgo.org/docs).

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](https://github.com/MeridianAlgo/Packages/blob/main/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, questions, or business inquiries:
- 📧 Email: [meridianalgo@gmail.com](mailto:meridianalgo@gmail.com)
- 📞 Phone: [+1 (630) 551-8785](tel:+16305518785)
- 🌐 Website: [meridianalgo.org](https://meridianalgo.org)
- 📍 Aurora, Illinois
- 📝 [GitHub Issues](https://github.com/MeridianAlgo/Packages/issues)

## 🌟 Chart Your Ascent

MeridianAlgo.js is more than a library—it's your partner in the financial markets. Whether you're building trading bots, analytical tools, or financial applications, we provide the tools you need to succeed.

---

<p align="center">
  Made with ❤️ by <a href="https://meridianalgo.org" target="_blank">MeridianAlgo</a>
  <br>
  <a href="https://www.npmjs.com/package/meridianalgo" target="_blank">NPM</a> • 
  <a href="https://github.com/MeridianAlgo/Packages" target="_blank">GitHub</a> • 
  <a href="https://meridianalgo.org" target="_blank">Website</a>
</p>