import { describe, it, expect, beforeEach } from '@jest/globals';
import { DataManager } from './manager';
import { DataAdapter, CorporateAction } from './types';
import { Bar } from '@meridianalgo/core';

class MockAdapter implements DataAdapter {
  id = 'mock';
  
  async ohlcv(): Promise<Bar[]> {
    return [
      { t: new Date('2023-01-01'), o: 100, h: 105, l: 99, c: 102, v: 1000, symbol: 'TEST' },
      { t: new Date('2023-01-02'), o: 102, h: 106, l: 101, c: 104, v: 1100, symbol: 'TEST' },
      { t: new Date('2023-01-03'), o: 104, h: 108, l: 103, c: 106, v: 1200, symbol: 'TEST' }
    ];
  }
}

describe('DataManager', () => {
  let manager: DataManager;
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    mockAdapter = new MockAdapter();
    const adapters = new Map();
    adapters.set('mock', mockAdapter);
    manager = new DataManager(adapters, 60000);
  });

  describe('fetch', () => {
    it('should fetch data from adapter', async () => {
      const data = await manager.fetch('mock', 'TEST', {
        start: '2023-01-01',
        end: '2023-01-03',
        interval: '1d'
      });
      
      expect(data.length).toBe(3);
      expect(data[0].symbol).toBe('TEST');
    });

    it('should cache fetched data', async () => {
      const data1 = await manager.fetch('mock', 'TEST', {
        start: '2023-01-01',
        end: '2023-01-03',
        interval: '1d'
      });
      
      const data2 = await manager.fetch('mock', 'TEST', {
        start: '2023-01-01',
        end: '2023-01-03',
        interval: '1d'
      });
      
      expect(data1).toEqual(data2);
    });

    it('should throw error for unknown adapter', async () => {
      await expect(manager.fetch('unknown', 'TEST', {
        start: '2023-01-01',
        end: '2023-01-03',
        interval: '1d'
      })).rejects.toThrow();
    });
  });

  describe('normalize', () => {
    it('should adjust for stock splits', () => {
      const bars: Bar[] = [
        { t: new Date('2023-01-01'), o: 100, h: 105, l: 99, c: 102, v: 1000, symbol: 'TEST' },
        { t: new Date('2023-01-02'), o: 102, h: 106, l: 101, c: 104, v: 1100, symbol: 'TEST' },
        { t: new Date('2023-01-03'), o: 52, h: 54, l: 51, c: 53, v: 2200, symbol: 'TEST' }
      ];
      
      const adjustments: CorporateAction[] = [
        { date: new Date('2023-01-03'), type: 'split', ratio: 2 }
      ];
      
      const adjusted = manager.normalize(bars, adjustments);
      
      expect(adjusted[0].c).toBeCloseTo(51, 0);
      expect(adjusted[1].c).toBeCloseTo(52, 0);
      expect(adjusted[2].c).toBe(53);
    });
  });

  describe('fillGaps', () => {
    it('should fill gaps in data', () => {
      const bars: Bar[] = [
        { t: new Date('2023-01-01'), o: 100, h: 105, l: 99, c: 102, v: 1000, symbol: 'TEST' },
        { t: new Date('2023-01-03'), o: 104, h: 108, l: 103, c: 106, v: 1200, symbol: 'TEST' }
      ];
      
      const filled = manager.fillGaps(bars, 'forward');
      expect(filled.length).toBeGreaterThanOrEqual(bars.length);
    });
  });

  describe('validateQuality', () => {
    it('should detect duplicates', () => {
      const bars: Bar[] = [
        { t: new Date('2023-01-01'), o: 100, h: 105, l: 99, c: 102, v: 1000, symbol: 'TEST' },
        { t: new Date('2023-01-01'), o: 100, h: 105, l: 99, c: 102, v: 1000, symbol: 'TEST' }
      ];
      
      const report = manager.validateQuality(bars);
      expect(report.duplicates).toBeGreaterThan(0);
    });

    it('should detect invalid OHLC', () => {
      const bars: Bar[] = [
        { t: new Date('2023-01-01'), o: 100, h: 95, l: 99, c: 102, v: 1000, symbol: 'TEST' }
      ];
      
      const report = manager.validateQuality(bars);
      expect(report.issues.length).toBeGreaterThan(0);
    });

    it('should detect outliers', () => {
      const bars: Bar[] = [
        { t: new Date('2023-01-01'), o: 100, h: 105, l: 99, c: 102, v: 1000, symbol: 'TEST' },
        { t: new Date('2023-01-02'), o: 102, h: 200, l: 101, c: 180, v: 1100, symbol: 'TEST' }
      ];
      
      const report = manager.validateQuality(bars);
      expect(report.outliers).toBeGreaterThan(0);
    });
  });

  describe('clearCache', () => {
    it('should clear cached data', async () => {
      await manager.fetch('mock', 'TEST', {
        start: '2023-01-01',
        end: '2023-01-03',
        interval: '1d'
      });
      
      manager.clearCache();
      
      // After clearing, should fetch again
      const data = await manager.fetch('mock', 'TEST', {
        start: '2023-01-01',
        end: '2023-01-03',
        interval: '1d'
      });
      
      expect(data.length).toBe(3);
    });
  });
});
