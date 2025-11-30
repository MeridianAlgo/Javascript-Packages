/**
 * Yahoo Finance data adapter
 */

import yahooFinance from 'yahoo-finance2';
import { Bar } from '@meridianalgo/core';
import { DataAdapter } from './types';

export class YahooAdapter implements DataAdapter {
  id = 'yahoo';
  
  async ohlcv(
    symbol: string,
    options: {
      start: Date | string;
      end: Date | string;
      interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    }
  ): Promise<Bar[]> {
    try {
      const start = typeof options.start === 'string' ? new Date(options.start) : options.start;
      const end = typeof options.end === 'string' ? new Date(options.end) : options.end;
      
      // Map our intervals to Yahoo Finance intervals
      const intervalMap: Record<string, string> = {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '1h': '1h',
        '4h': '1h', // Yahoo doesn't have 4h, use 1h
        '1d': '1d',
        '1w': '1wk'
      };
      
      const result = await yahooFinance.chart(symbol, {
        period1: start,
        period2: end,
        interval: intervalMap[options.interval] as any
      });
      
      if (!result || !result.quotes) {
        return [];
      }
      
      const bars: Bar[] = result.quotes.map((quote: any) => ({
        t: quote.date,
        o: quote.open || 0,
        h: quote.high || 0,
        l: quote.low || 0,
        c: quote.close || 0,
        v: quote.volume || 0,
        symbol
      }));
      
      return bars;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw new Error(`Failed to fetch data from Yahoo Finance: ${error}`);
    }
  }
}
