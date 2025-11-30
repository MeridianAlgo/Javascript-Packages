/**
 * Alpaca data adapter
 */

import { Bar } from '@meridianalgo/core';
import { DataAdapter, Quote, SymbolMetadata } from './types';

export class AlpacaAdapter implements DataAdapter {
  id = 'alpaca';
  private baseUrl: string;
  private dataUrl: string;
  
  constructor(
    private apiKey: string,
    private secretKey: string,
    private paper: boolean = true
  ) {
    this.baseUrl = paper
      ? 'https://paper-api.alpaca.markets'
      : 'https://api.alpaca.markets';
    this.dataUrl = 'https://data.alpaca.markets';
  }
  
  private getHeaders(): Record<string, string> {
    return {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.secretKey
    };
  }
  
  private intervalToAlpaca(interval: string): { timeframe: string; limit: number } {
    const map: Record<string, { timeframe: string; limit: number }> = {
      '1m': { timeframe: '1Min', limit: 10000 },
      '5m': { timeframe: '5Min', limit: 10000 },
      '15m': { timeframe: '15Min', limit: 10000 },
      '1h': { timeframe: '1Hour', limit: 10000 },
      '4h': { timeframe: '4Hour', limit: 10000 },
      '1d': { timeframe: '1Day', limit: 10000 },
      '1w': { timeframe: '1Week', limit: 10000 }
    };
    return map[interval] || { timeframe: '1Day', limit: 10000 };
  }
  
  async ohlcv(
    symbol: string,
    options: {
      start: Date | string;
      end: Date | string;
      interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    }
  ): Promise<Bar[]> {
    const startDate = typeof options.start === 'string' ? options.start : options.start.toISOString().split('T')[0];
    const endDate = typeof options.end === 'string' ? options.end : options.end.toISOString().split('T')[0];
    
    const { timeframe, limit } = this.intervalToAlpaca(options.interval);
    
    const url = `${this.dataUrl}/v2/stocks/${symbol}/bars?start=${startDate}&end=${endDate}&timeframe=${timeframe}&limit=${limit}&adjustment=all`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status} ${response.statusText}`);
    }
    
    const data: any = await response.json();
    
    if (!data.bars || data.bars.length === 0) {
      return [];
    }
    
    return data.bars.map((bar: any) => ({
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
    const url = `${this.dataUrl}/v2/stocks/${symbol}/quotes/latest`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status} ${response.statusText}`);
    }
    
    const data: any = await response.json();
    const quote = data.quote;
    
    return {
      symbol,
      bid: quote.bp,
      ask: quote.ap,
      last: (quote.bp + quote.ap) / 2,
      volume: quote.bs + quote.as,
      ts: new Date(quote.t)
    };
  }
  
  async metadata(symbol: string): Promise<SymbolMetadata> {
    const url = `${this.baseUrl}/v2/assets/${symbol}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status} ${response.statusText}`);
    }
    
    const data: any = await response.json();
    
    return {
      symbol,
      name: data.name || symbol,
      exchange: data.exchange || 'UNKNOWN',
      sector: undefined,
      industry: undefined,
      marketCap: undefined,
      avgVolume: undefined
    };
  }
  
  /**
   * Switch between paper and live trading
   */
  setPaperMode(paper: boolean): void {
    this.paper = paper;
    this.baseUrl = paper
      ? 'https://paper-api.alpaca.markets'
      : 'https://api.alpaca.markets';
  }
  
  /**
   * Check if in paper mode
   */
  isPaperMode(): boolean {
    return this.paper;
  }
}
