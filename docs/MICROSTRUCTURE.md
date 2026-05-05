# Market Microstructure Package

The `@meridianalgo/microstructure` package provides primitives for order book analysis, spread estimation, and market impact modeling.

## Order Book Primitives

Analyze Level 2 market data snapshots.

```typescript
import { OrderBook, OrderBookSnapshot } from '@meridianalgo/microstructure';

const snapshot: OrderBookSnapshot = {
  bids: [{ price: 99.98, size: 100 }, { price: 99.95, size: 500 }],
  asks: [{ price: 100.02, size: 200 }, { price: 100.05, size: 300 }]
};

const ob = new OrderBook(snapshot);

console.log('Mid Price:', ob.midPrice());
console.log('Quoted Spread:', ob.quotedSpread());
console.log('Microprice:', ob.microprice());
console.log('Imbalance:', ob.imbalance());
```

### Walking the Book
Calculate the expected fill price for a market order.

```typescript
const fill = ob.walkMarketOrder(250); // Buy 250 shares
console.log('Avg Fill Price:', fill.avgPrice);
console.log('Total Slippage vs Mid:', fill.slippage);
```

## Spread Analytics

Estimate liquidity and transaction costs.
- **Roll Spread**: Estimating effective spread from price covariance.
- **Corwin-Schultz**: Spread estimation using high-low prices.

## Market Impact

Models for estimating how a trade affects the market price.
- **Square Root Law**: Impact is proportional to the square root of the trade size relative to daily volume.
- **Linear Impact**: Simple linear relationship.

```typescript
import { squareRootImpact } from '@meridianalgo/microstructure';

const impact = squareRootImpact({
  size: 10000,
  dailyVolume: 1000000,
  dailyVol: 0.02,
  Y: 0.4
});

console.log('Expected price impact (bps):', impact * 10000);
```
