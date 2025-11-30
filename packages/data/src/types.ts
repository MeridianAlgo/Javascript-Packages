/**
 * Data adapter types
 */

import { Bar } from '@meridianalgo/core';

export interface DataAdapter {
  id: string;
  
  // Fetch OHLCV data
  ohlcv(
    symbol: string,
    options: {
      start: Date | string;
      end: Date | string;
      interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    }
  ): Promise<Bar[]>;
  
  // Fetch real-time quote
  quote?(symbol: string): Promise<Quote>;
  
  // Subscribe to real-time stream
  stream?(
    symbols: string[],
    callback: (bar: Bar) => void
  ): StreamSubscription;
  
  // Fetch symbol metadata
  metadata?(symbol: string): Promise<SymbolMetadata>;
}

export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  ts: Date;
}

export interface SymbolMetadata {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  avgVolume?: number;
}

export interface StreamSubscription {
  unsubscribe(): void;
}

export interface CorporateAction {
  date: Date;
  type: 'split' | 'dividend';
  ratio?: number;
  amount?: number;
}

export interface QualityReport {
  duplicates: number;
  gaps: number;
  outliers: number;
  issues: Array<{ index: number; reason: string }>;
}
