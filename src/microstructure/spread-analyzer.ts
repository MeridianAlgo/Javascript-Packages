/**
 * Spread estimators — quoted, effective, realized, and Roll's covariance estimator.
 */

export interface TradeQuote {
  /** Trade price. */
  price: number;
  /** Mid-price at trade time. */
  mid: number;
  /** Trade direction: +1 buy (lifted ask), -1 sell (hit bid). */
  side: 1 | -1;
  /** Mid-price 5 (or N) seconds after trade — used for realized spread. */
  midFuture?: number;
}

/**
 * Effective spread:
 *   effSpread_t = 2 * D_t * (P_t - M_t)
 * Mean over a sample gives the average effective spread paid by liquidity takers.
 */
export function effectiveSpread(trades: readonly TradeQuote[]): number {
  if (trades.length === 0) return 0;
  let sum = 0;
  for (const t of trades) sum += 2 * t.side * (t.price - t.mid);
  return sum / trades.length;
}

/**
 * Realized spread:
 *   realSpread_t = 2 * D_t * (P_t - M_{t+τ})
 * Captures the portion of effective spread that is NOT permanent (mean-reverting component).
 * Requires `midFuture` populated on each trade.
 */
export function realizedSpread(trades: readonly TradeQuote[]): number {
  let n = 0;
  let sum = 0;
  for (const t of trades) {
    if (t.midFuture === undefined) continue;
    sum += 2 * t.side * (t.price - t.midFuture);
    n++;
  }
  if (n === 0) return 0;
  return sum / n;
}

/**
 * Roll (1984) implicit spread estimator from price changes alone.
 *   spread = 2 * sqrt(-cov(ΔP_t, ΔP_{t-1}))
 * If the autocovariance is non-negative, returns 0 (estimator fails).
 */
export function rollSpread(prices: readonly number[]): number {
  if (prices.length < 3) return 0;
  const dp: number[] = [];
  for (let i = 1; i < prices.length; i++) dp.push(prices[i] - prices[i - 1]);
  const mean = dp.reduce((s, x) => s + x, 0) / dp.length;
  let cov = 0;
  for (let i = 1; i < dp.length; i++) cov += (dp[i] - mean) * (dp[i - 1] - mean);
  cov /= dp.length - 1;
  if (cov >= 0) return 0;
  return 2 * Math.sqrt(-cov);
}

/**
 * Quoted spread (ask - bid). Convenience for a single snapshot.
 */
export function quotedSpread(bid: number, ask: number): number {
  return ask - bid;
}
