/**
 * Polygon.io data adapter
 */

import { Bar } from '@meridianalgo/core';
import { DataAdapter, Quote, SymbolMetadata } from './types';

export class PolygonAdapter implements DataAdapter {
  id = 'polygon';
  private baseUrl = 'https://api.polygon.io';
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly rateLimitPerSecond = 5; // requests per second
  
  constructor(private apiKey: string) {}
  
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    if (now - this.lastRequestTime < 1000) {
      this.requestCount++;
      if (this.requestCount >= this.rateLimitPerSecond) {
        const waitTime = 1000 - (now - this.lastRequestTime);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.lastRequestTime = Date.now();
      }
    } else {
      this.requestCount = 1;
      this.lastRequestTime = now;
    }
  }
  
  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    await this.rateLimit();
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        
        if (response.status === 429) {
          // Rate limited, wait and retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  private intervalToPolygon(interval: string): { multiplier: number; timespan: string } {
    const map: Record<string, { multiplier: number; timespan: string }> = {
      '1m': { multiplier: 1, timespan: 'minute' },
      '5m': { multiplier: 5, timespan: 'minute' },
      '15m': { multiplier: 15, timespan: 'minute' },
      '1h': { multiplier: 1, timespan: 'hour' },
      '4h': { multiplier: 4, timespan: 'hour' },
      '1d': { multiplier: 1, timespan: 'day' },
      '1w': { multiplier: 1, timespan: 'week' }
    };
    return map[interval] || { multiplier: 1, timespan: 'day' };
  }
  
  async ohlcv(
    symbol: string,
    options: {
      start: Date | string;
      end: Date | string;
      interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    }
  ): Promise<Bar[]> {
    const startDate = typeof options.start === 'string' ? new Date(options.start) : options.start;
    const endDate = typeof options.end === 'string' ? new Date(options.end) : options.end;
    
    const { multiplier, timespan } = this.intervalToPolygon(options.interval);
    
    const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${startDate.getTime()}/${endDate.getTime()}?adjusted=true&sort=asc&limit=50000&apiKey=${this.apiKey}`;
    
    const data = await this.fetchWithRetry(url);
    
    if (!data.results || data.results.length === 0) {
      return [];
    }
    
    return data.results.map((bar: any) => ({
      t: new Date(bar.t),
      o: bar.o,
      h: bar.h,
      l: bar.l,
      c: bar.c,
      v: bar.v,
      symbol
    }));
  }
  
  async quote(symbol: string): Promise<Quote> {
    const url = `${this.baseUrl}/v2/last/trade/${symbol}?apiKey=${this.apiKey}`;
    const data = await this.fetchWithRetry(url);
    
    return {
      symbol,
      bid: data.results?.p || 0,
      ask: data.results?.p || 0,
      last: data.results?.p || 0,
      volume: data.results?.s || 0,
      ts: new Date(data.results?.t || Date.now())
    };
  }
  
  async metadata(symbol: string): Promise<SymbolMetadata> {
    const url = `${this.baseUrl}/v3/reference/tickers/${symbol}?apiKey=${this.apiKey}`;
    const data = await this.fetchWithRetry(url);
    
    return {
      symbol,
      name: data.results?.name || symbol,
      exchange: data.results?.primary_exchange || 'UNKNOWN',
      sector: data.results?.sic_description,
      industry: data.results?.industry,
      marketCap: data.results?.market_cap,
      avgVolume: data.results?.share_class_shares_outstanding
    };
  }
}
