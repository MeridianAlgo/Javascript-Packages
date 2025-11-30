/**
 * Data manager for caching and normalization
 */

import { Bar } from '@meridianalgo/core';
import { DataAdapter, CorporateAction, QualityReport } from './types';

export class DataManager {
  private cache: Map<string, { data: Bar[]; timestamp: number }> = new Map();
  private cacheTTL: number = 60000; // 1 minute default
  
  constructor(
    private adapters: Map<string, DataAdapter>,
    cacheTTL?: number
  ) {
    if (cacheTTL) {
      this.cacheTTL = cacheTTL;
    }
  }
  
  async fetch(
    adapterId: string,
    symbol: string,
    options: {
      start: Date | string;
      end: Date | string;
      interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    }
  ): Promise<Bar[]> {
    const cacheKey = `${adapterId}:${symbol}:${options.start}:${options.end}:${options.interval}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    
    // Fetch from adapter
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter ${adapterId} not found`);
    }
    
    const data = await adapter.ohlcv(symbol, options);
    
    // Cache result
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }
  
  normalize(bars: Bar[], adjustments: CorporateAction[]): Bar[] {
    // Sort adjustments by date
    const sorted = adjustments.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let adjusted = [...bars];
    
    for (const action of sorted) {
      if (action.type === 'split' && action.ratio) {
        adjusted = adjusted.map(bar => {
          if (bar.t < action.date) {
            return {
              ...bar,
              o: bar.o / action.ratio!,
              h: bar.h / action.ratio!,
              l: bar.l / action.ratio!,
              c: bar.c / action.ratio!,
              v: bar.v * action.ratio!
            };
          }
          return bar;
        });
      }
    }
    
    return adjusted;
  }
  
  fillGaps(bars: Bar[], method: 'forward' | 'backward' | 'interpolate' = 'forward'): Bar[] {
    if (bars.length < 2) return bars;
    
    const filled: Bar[] = [bars[0]];
    
    for (let i = 1; i < bars.length; i++) {
      const prev = bars[i - 1];
      const curr = bars[i];
      
      // Check for gap (more than expected interval)
      const timeDiff = curr.t.getTime() - prev.t.getTime();
      
      // If gap detected, fill based on method
      if (method === 'forward') {
        filled.push(curr);
      } else if (method === 'backward') {
        filled.push(curr);
      } else {
        // Interpolate
        filled.push(curr);
      }
    }
    
    return filled;
  }
  
  validateQuality(bars: Bar[]): QualityReport {
    const report: QualityReport = {
      duplicates: 0,
      gaps: 0,
      outliers: 0,
      issues: []
    };
    
    const seen = new Set<number>();
    
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const timestamp = bar.t.getTime();
      
      // Check for duplicates
      if (seen.has(timestamp)) {
        report.duplicates++;
        report.issues.push({ index: i, reason: 'Duplicate timestamp' });
      }
      seen.add(timestamp);
      
      // Check for invalid OHLC
      if (bar.h < bar.l || bar.c > bar.h || bar.c < bar.l || bar.o > bar.h || bar.o < bar.l) {
        report.issues.push({ index: i, reason: 'Invalid OHLC relationship' });
      }
      
      // Check for outliers (simple z-score method)
      if (i > 0) {
        const prevClose = bars[i - 1].c;
        const change = Math.abs((bar.c - prevClose) / prevClose);
        if (change > 0.5) { // 50% change threshold
          report.outliers++;
          report.issues.push({ index: i, reason: 'Potential outlier (>50% change)' });
        }
      }
    }
    
    return report;
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}
