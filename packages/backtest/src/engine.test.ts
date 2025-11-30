import { describe, it, expect } from '@jest/globals';
import { TimeBasedEngine } from './engine';
import { FixedCommission, FixedSlippage } from './costs';
import { Bar } from '@meridianalgo/core';
import { Strategy } from '@meridianalgo/strategies';

describe('Backtest Engine', () => {
  const bars: Bar[] = Array.from({ length: 100 }, (_, i) => ({
    t: new Date(Date.now() + i * 86400000),
    o: 100 + i * 0.5,
    h: 105 + i * 0.5,
    l: 95 + i * 0.5,
    c: 100 + i * 0.5,
    v: 1000,
    symbol: 'TEST'
  }));

  const simpleStrategy: Strategy = {
    id: 'test-strategy',
    next: (bar: Bar) => {
      // Buy every 10 bars, sell every 10 bars
      const index = bars.findIndex(b => b.t.getTime() === bar.t.getTime());
      if (index % 20 === 0) return { t: bar.t, value: 1 };
      if (index % 20 === 10) return { t: bar.t, value: -1 };
      return { t: bar.t, value: 0 };
    }
  };

  describe('TimeBasedEngine', () => {
    it('should run backtest', async () => {
      const engine = new TimeBasedEngine({
        strategy: simpleStrategy,
        data: bars,
        initialCash: 100000
      });

      const result = await engine.run();

      expect(result.equity).toBeDefined();
      expect(result.trades).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.equity.length).toBeGreaterThan(0);
    });

    it('should apply commission', async () => {
      const engine = new TimeBasedEngine({
        strategy: simpleStrategy,
        data: bars,
        initialCash: 100000,
        commission: new FixedCommission(10)
      });

      const result = await engine.run();

      // With commission, final equity should be less
      expect(result.equity[result.equity.length - 1].equity).toBeLessThan(100000 + bars.length * 0.5 * 10);
    });

    it('should apply slippage', async () => {
      const engine = new TimeBasedEngine({
        strategy: simpleStrategy,
        data: bars,
        initialCash: 100000,
        slippage: new FixedSlippage(10)
      });

      const result = await engine.run();

      expect(result.trades.length).toBeGreaterThan(0);
    });

    it('should calculate performance metrics', async () => {
      const engine = new TimeBasedEngine({
        strategy: simpleStrategy,
        data: bars,
        initialCash: 100000
      });

      const result = await engine.run();

      expect(result.metrics.totalReturn).toBeDefined();
      expect(result.metrics.sharpeRatio).toBeDefined();
      expect(result.metrics.maxDrawdown).toBeDefined();
      expect(result.metrics.winRate).toBeDefined();
    });

    it('should track trades', async () => {
      const engine = new TimeBasedEngine({
        strategy: simpleStrategy,
        data: bars,
        initialCash: 100000
      });

      const result = await engine.run();

      expect(result.trades.length).toBeGreaterThan(0);
      result.trades.forEach(trade => {
        expect(trade.symbol).toBe('TEST');
        expect(trade.qty).toBeGreaterThan(0);
        expect(trade.entryPrice).toBeGreaterThan(0);
      });
    });

    it('should handle insufficient cash', async () => {
      const engine = new TimeBasedEngine({
        strategy: simpleStrategy,
        data: bars,
        initialCash: 100 // Very low cash
      });

      const result = await engine.run();

      // Should still complete without errors
      expect(result.equity).toBeDefined();
    });
  });
});
