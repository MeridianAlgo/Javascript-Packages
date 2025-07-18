# meridianalgo

Node.js/TypeScript port of the meridianalgo Python package for trading and backtesting technical indicators.

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

## Available Indicators
- Simple Moving Average (SMA)
- Exponential Moving Average (EMA)
- Relative Strength Index (RSI)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- Stochastic Oscillator
- Average True Range (ATR)
- Volume SMA
- Price Channels (Donchian Channels)
- Williams %R
- Commodity Channel Index (CCI)

## License
MIT 