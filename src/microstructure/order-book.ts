/**
 * Order book primitives — top-of-book/L2 snapshot analytics.
 */

export interface PriceLevel {
  /** Price (signed by side: bids ascending sort order, asks ascending). */
  price: number;
  /** Resting size (always positive). */
  size: number;
}

export interface OrderBookSnapshot {
  /** Bids sorted by price descending (best bid first). */
  bids: readonly PriceLevel[];
  /** Asks sorted by price ascending (best ask first). */
  asks: readonly PriceLevel[];
}

export class OrderBook {
  constructor(private snapshot: OrderBookSnapshot) {}

  bestBid(): PriceLevel | null {
    return this.snapshot.bids[0] ?? null;
  }

  bestAsk(): PriceLevel | null {
    return this.snapshot.asks[0] ?? null;
  }

  midPrice(): number | null {
    const b = this.bestBid();
    const a = this.bestAsk();
    if (!b || !a) return null;
    return (b.price + a.price) / 2;
  }

  /** Quoted spread = ask - bid. */
  quotedSpread(): number | null {
    const b = this.bestBid();
    const a = this.bestAsk();
    if (!b || !a) return null;
    return a.price - b.price;
  }

  /** Relative spread = (ask - bid) / mid. */
  relativeSpread(): number | null {
    const mid = this.midPrice();
    const sp = this.quotedSpread();
    if (mid === null || sp === null || mid === 0) return null;
    return sp / mid;
  }

  /**
   * Microprice — size-weighted mid:
   *   microprice = (askSize * bid + bidSize * ask) / (bidSize + askSize)
   * (more weight where there is less size, reflecting where the price is likely to move).
   */
  microprice(): number | null {
    const b = this.bestBid();
    const a = this.bestAsk();
    if (!b || !a) return null;
    const total = b.size + a.size;
    if (total === 0) return null;
    return (a.size * b.price + b.size * a.price) / total;
  }

  /** Order book imbalance: (bidSize - askSize) / (bidSize + askSize) at top-of-book. */
  imbalance(): number | null {
    const b = this.bestBid();
    const a = this.bestAsk();
    if (!b || !a) return null;
    const total = b.size + a.size;
    if (total === 0) return null;
    return (b.size - a.size) / total;
  }

  /**
   * Walk the book to fill a market order of `qty` shares.
   * Positive qty = buy (walk asks), negative qty = sell (walk bids).
   * Returns average fill price and total slippage vs. mid (per share).
   */
  walkMarketOrder(qty: number): { avgPrice: number; slippage: number; filled: number } {
    const side = qty >= 0 ? this.snapshot.asks : this.snapshot.bids;
    const mid = this.midPrice();
    let remaining = Math.abs(qty);
    let cost = 0;
    let filled = 0;
    for (const lvl of side) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, lvl.size);
      cost += take * lvl.price;
      filled += take;
      remaining -= take;
    }
    if (filled === 0) return { avgPrice: NaN, slippage: NaN, filled: 0 };
    const avgPrice = cost / filled;
    const slippage = mid === null ? NaN : (qty >= 0 ? avgPrice - mid : mid - avgPrice);
    return { avgPrice, slippage, filled };
  }
}
