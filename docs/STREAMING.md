# Streaming Indicators

O(1)-per-tick incremental indicators for real-time data. Each maintains internal
state so you feed one value at a time instead of recomputing over a whole array —
ideal for live WebSocket feeds and event-driven backtests.

All streaming indicators share the same small interface:

- `nextValue(x)` — push a new observation, return the updated indicator value.
- `replace(x)` — revise the **most recent** observation (e.g. an intrabar update)
  without compounding state; snapshots the prior state internally.
- `reset()` — clear all state.

Outputs are `NaN` until enough observations have accumulated for a valid reading.

## Available indicators

| Class | Constructor | Output |
|-------|-------------|--------|
| `StreamingSMA` | `new StreamingSMA(period)` | `number` |
| `StreamingEMA` | `new StreamingEMA(period)` | `number` |
| `StreamingRSI` | `new StreamingRSI(period)` | `number` (Wilder smoothing) |
| `StreamingMACD` | `new StreamingMACD(fast = 12, slow = 26, signal = 9)` | `{ macd, signal, histogram }` |
| `StreamingBollinger` | `new StreamingBollinger(period = 20, k = 2)` | `{ upper, middle, lower }` |

## Basic usage

```typescript
import { StreamingSMA, StreamingRSI } from 'meridianalgo';

const sma = new StreamingSMA(20);
const rsi = new StreamingRSI(14);

for (const price of priceStream) {
  const avg = sma.nextValue(price);   // NaN until 20 values seen
  const r = rsi.nextValue(price);     // NaN until 14+ values seen
  if (!Number.isNaN(r) && r > 70) console.log('overbought', avg);
}
```

## MACD and Bollinger Bands

```typescript
import { StreamingMACD, StreamingBollinger } from 'meridianalgo';

const macd = new StreamingMACD(12, 26, 9);
const bb = new StreamingBollinger(20, 2);

ws.on('tick', ({ price }) => {
  const m = macd.nextValue(price);    // { macd, signal, histogram }
  const b = bb.nextValue(price);      // { upper, middle, lower }
  if (!Number.isNaN(b.upper) && price > b.upper && m.histogram < 0) {
    signalShort();
  }
});
```

## Intrabar revisions with `replace()`

When a bar's price updates before it closes, use `replace()` so the in-progress
value is corrected without permanently advancing the indicator's state:

```typescript
const ema = new StreamingEMA(12);

ema.nextValue(open);        // provisional value for the forming bar
ema.replace(currentPrice);  // revise as the bar moves
ema.replace(closePrice);    // final value once the bar closes
// the next nextValue() starts a fresh bar from the corrected state
```

## Notes

- Streaming results match the batch `Indicators.*` functions once warmed up.
- These classes are pure JavaScript with no dependencies — they run in Node,
  Deno, Bun, and the browser.
- For batch (array-in, array-out) computation, see [Indicators](./INDICATORS.md).
