/**
 * OptionChain — manages a grid of strikes/expiries with prices, IV, Greeks.
 */

import { blackScholesPrice, blackScholesGreeks, OptionType, Greeks } from './black-scholes';
import { impliedVolatility } from './implied-volatility';

export interface OptionQuote {
  strike: number;
  expiry: number; // years to expiry
  type: OptionType;
  price?: number;
  iv?: number;
  greeks?: Greeks;
}

export interface ChainContext {
  spot: number;
  rate: number;
  dividendYield?: number;
}

export class OptionChain {
  private quotes: OptionQuote[] = [];
  constructor(private ctx: ChainContext) {}

  add(quote: OptionQuote): this {
    this.quotes.push({ ...quote });
    return this;
  }

  addBulk(quotes: OptionQuote[]): this {
    quotes.forEach((q) => this.add(q));
    return this;
  }

  /** Compute IV for any quote with a market price. */
  computeImpliedVols(): this {
    const { spot, rate, dividendYield = 0 } = this.ctx;
    this.quotes = this.quotes.map((q) => {
      if (q.price === undefined) return q;
      try {
        const iv = impliedVolatility(q.price, spot, q.strike, q.expiry, rate, q.type, dividendYield);
        return { ...q, iv };
      } catch {
        return q;
      }
    });
    return this;
  }

  /** Compute Greeks for any quote with an IV (or sigma assumption). */
  computeGreeks(defaultSigma?: number): this {
    const { spot, rate, dividendYield = 0 } = this.ctx;
    this.quotes = this.quotes.map((q) => {
      const sigma = q.iv ?? defaultSigma;
      if (sigma === undefined) return q;
      const greeks = blackScholesGreeks(
        { S: spot, K: q.strike, T: q.expiry, r: rate, sigma, q: dividendYield },
        q.type
      );
      return { ...q, greeks };
    });
    return this;
  }

  /** Theoretical price using a fixed sigma (fills `price` if missing). */
  computePrices(sigma: number): this {
    const { spot, rate, dividendYield = 0 } = this.ctx;
    this.quotes = this.quotes.map((q) => {
      if (q.price !== undefined) return q;
      const price = blackScholesPrice(
        { S: spot, K: q.strike, T: q.expiry, r: rate, sigma, q: dividendYield },
        q.type
      );
      return { ...q, price };
    });
    return this;
  }

  /** Filter by expiry (within tolerance) and/or type. */
  slice(opts: { expiry?: number; type?: OptionType; expiryTol?: number } = {}): OptionQuote[] {
    const { expiry, type, expiryTol = 1e-9 } = opts;
    return this.quotes.filter((q) => {
      if (type && q.type !== type) return false;
      if (expiry !== undefined && Math.abs(q.expiry - expiry) > expiryTol) return false;
      return true;
    });
  }

  /** All quotes (immutable copy). */
  all(): readonly OptionQuote[] {
    return this.quotes.map((q) => ({ ...q }));
  }

  /** Unique sorted strikes. */
  strikes(): number[] {
    return [...new Set(this.quotes.map((q) => q.strike))].sort((a, b) => a - b);
  }

  /** Unique sorted expiries. */
  expiries(): number[] {
    return [...new Set(this.quotes.map((q) => q.expiry))].sort((a, b) => a - b);
  }
}
