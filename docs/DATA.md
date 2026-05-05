# Data Package

The `@meridianalgo/data` package provides adapters for various financial data providers and a unified `DataManager` to handle fetching and caching.

## Data Manager

The `DataManager` acts as a central hub for multiple data sources.

```typescript
import { DataManager, YahooAdapter, PolygonAdapter } from '@meridianalgo/data';

const manager = new DataManager(new Map([
  ['yahoo', new YahooAdapter()],
  ['polygon', new PolygonAdapter({ apiKey: 'YOUR_API_KEY' })]
]));

const bars = await manager.fetch('yahoo', 'AAPL', {
  start: '2023-01-01',
  interval: '1d'
});
```

## Supported Adapters

### Yahoo Finance (`YahooAdapter`)
Free, limited data for stocks and ETFs. Use `yahoo-finance2` under the hood.

### Polygon.io (`PolygonAdapter`)
Professional-grade data for stocks, options, and forex.

### Alpaca (`AlpacaAdapter`)
Stock and crypto data, integration with Alpaca trading API.

### Binance (`BinanceAdapter`)
Real-time and historical crypto data from Binance.

## Custom Adapters

You can implement your own adapter by following the `DataAdapter` interface.

```typescript
export interface DataAdapter {
  id: string;
  ohlcv(symbol: string, options: DataOptions): Promise<Bar[]>;
  quotes?(symbol: string, options: DataOptions): Promise<Quote[]>;
  trades?(symbol: string, options: DataOptions): Promise<Trade[]>;
}
```

## Data Types

- `Bar`: OHLCV (Open, High, Low, Close, Volume) data.
- `Quote`: Bid/Ask data.
- `Trade`: Execution data.
- `Interval`: Support for '1m', '5m', '15m', '1h', '1d', '1wk'.
