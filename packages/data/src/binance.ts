/**
 * Binance data adapter
 */

import { Bar } from '@meridianalgo/core';
import { DataAdapter, StreamSubscription } from './types';

export class BinanceAdapter implements DataAdapter {
  id = 'binance';
  private baseUrl = 'https://api.binance.com';
  private wsUrl = 'wss://stream.binance.com:9443/ws';
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor(private apiKey?: string, private apiSecret?: string) {}
  
  private intervalToBinance(interval: string): string {
    const map: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w'
    };
    return map[interval] || '1d';
  }
  
  async ohlcv(
    symbol: string,
    options: {
      start: Date | string;
      end: Date | string;
      interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    }
  ): Promise<Bar[]> {
    const startTime = typeof options.start === 'string' ? new Date(options.start).getTime() : options.start.getTime();
    const endTime = typeof options.end === 'string' ? new Date(options.end).getTime() : options.end.getTime();
    
    const binanceInterval = this.intervalToBinance(options.interval);
    const binanceSymbol = symbol.replace('/', '').toUpperCase();
    
    const url = `${this.baseUrl}/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data: any = await response.json();
    
    return data.map((kline: any[]) => ({
      t: new Date(kline[0]),
      o: parseFloat(kline[1]),
      h: parseFloat(kline[2]),
      l: parseFloat(kline[3]),
      c: parseFloat(kline[4]),
      v: parseFloat(kline[5]),
      symbol
    }));
  }
  
  stream(symbols: string[], callback: (bar: Bar) => void): StreamSubscription {
    const streams = symbols.map(s => {
      const binanceSymbol = s.replace('/', '').toLowerCase();
      return `${binanceSymbol}@kline_1m`;
    }).join('/');
    
    const wsUrl = `${this.wsUrl}/${streams}`;
    
    this.connectWebSocket(wsUrl, callback, symbols);
    
    return {
      unsubscribe: () => {
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
      }
    };
  }
  
  private connectWebSocket(url: string, callback: (bar: Bar) => void, symbols: string[]): void {
    if (typeof WebSocket === 'undefined') {
      console.warn('WebSocket not available in this environment');
      return;
    }
    
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.e === 'kline') {
          const kline = data.k;
          const bar: Bar = {
            t: new Date(kline.t),
            o: parseFloat(kline.o),
            h: parseFloat(kline.h),
            l: parseFloat(kline.l),
            c: parseFloat(kline.c),
            v: parseFloat(kline.v),
            symbol: symbols.find(s => s.replace('/', '').toLowerCase() === data.s.toLowerCase()) || data.s
          };
          
          if (kline.x) { // Only emit closed candles
            callback(bar);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => {
          this.connectWebSocket(url, callback, symbols);
        }, delay);
      }
    };
  }
}
