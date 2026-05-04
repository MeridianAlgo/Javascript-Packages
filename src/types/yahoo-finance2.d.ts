/**
 * Type shim for yahoo-finance2 — package uses ESM-only `exports` map
 * which TypeScript's classic node resolution can't follow.
 * Provides minimal surface used by `src/data/yahoo.ts`.
 */
declare module 'yahoo-finance2' {
  interface HistoricalRow {
    date: Date;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    adjClose?: number;
    volume?: number;
  }

  interface HistoricalOptions {
    period1: Date | string;
    period2?: Date | string;
    interval?: string;
    events?: string;
  }

  interface QuoteSummary {
    [key: string]: unknown;
  }

  interface ChartResult {
    quotes: Array<{
      date: Date;
      open?: number;
      high?: number;
      low?: number;
      close?: number;
      adjclose?: number;
      volume?: number;
    }>;
    meta?: Record<string, unknown>;
  }

  const yahooFinance: {
    historical(symbol: string, options: HistoricalOptions): Promise<HistoricalRow[]>;
    chart(symbol: string, options: HistoricalOptions): Promise<ChartResult>;
    quote(symbol: string): Promise<unknown>;
    quoteSummary(symbol: string, options?: { modules?: string[] }): Promise<QuoteSummary>;
    search(query: string, options?: Record<string, unknown>): Promise<unknown>;
  };

  export default yahooFinance;
}
