import { describe, it, expect } from '@jest/globals';
import { trendFollowing } from './trend-following';
import { meanReversion } from './mean-reversion';
import { StrategyComposer } from './composer';
import { PositionSizer } from './position-sizer';
import { Bar } from '@meridianalgo/core';

describe('Strategies', () => {
  const bars: Bar[] = Array.from({ length: 50 }, (_, i) => ({
    t: new Date(Date.now() + i * 86400000),
    o: 100 + Math.sin(i / 5) * 10,
    h: 105 + Math.sin(i / 5) * 10,
    l: 95 + Math.sin(i / 5) * 10,
    c: 100 + Math.sin(i / 5) * 10,
    v: 1000,
    symbol: 'TEST'
  }));

  describe('Trend Following', () => {
    it('should generate signals', () => {
      const strategy = trendFollowing({
        fastPeriod: 5,
        slowPeriod: 10,
        maType: 'ema'
      });

      strategy.init(bars.slice(0, 20));
      
      const signal = strategy.next(bars[20]);
      expect(signal).toBeDefined();
      expect(signal?.value).toBeGreaterThanOrEqual(-1);
      expect(signal?.value).toBeLessThanOrEqual(1);
    });

    it('should generate batch signals', () => {
      const strategy = trendFollowing({
        fastPeriod: 5,
        slowPeriod: 10
      });

      const signals = strategy.generate!(bars);
      expect(signals.length).toBeGreaterThan(0);
    });
  });

  describe('Mean Reversion', () => {
    it('should generate signals', () => {
      const strategy = meanReversion({
        period: 10,
        stdDev: 2,
        rsiPeriod: 14
      });

      strategy.init(bars.slice(0, 20));
      
      const signal = strategy.next(bars[20]);
      expect(signal).toBeDefined();
    });
  });

  describe('Strategy Composer', () => {
    it('should blend strategies', () => {
      const strategy1 = trendFollowing({ fastPeriod: 5, slowPeriod: 10 });
      const strategy2 = meanReversion({ period: 10, stdDev: 2 });

      const blended = StrategyComposer.blend([strategy1, strategy2], [0.6, 0.4]);
      
      blended.init(bars.slice(0, 20));
      const signal = blended.next(bars[20]);
      
      expect(signal).toBeDefined();
    });

    it('should vote on strategies', () => {
      const strategy1 = trendFollowing({ fastPeriod: 5, slowPeriod: 10 });
      const strategy2 = meanReversion({ period: 10, stdDev: 2 });

      const voted = StrategyComposer.vote([strategy1, strategy2], 2);
      
      voted.init(bars.slice(0, 20));
      const signal = voted.next(bars[20]);
      
      expect(signal).toBeDefined();
    });
  });

  describe('Position Sizer', () => {
    it('should calculate Kelly position size', () => {
      const size = PositionSizer.kelly(0.6, 2, 100000, 100);
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThanOrEqual(100000 / 100);
    });

    it('should calculate volatility-targeted size', () => {
      const returns = [0.01, -0.02, 0.015, -0.01, 0.02];
      const size = PositionSizer.volTarget(returns, 0.1, 100000, 100);
      expect(size).toBeGreaterThan(0);
    });

    it('should adjust for drawdown', () => {
      const equity = [100000, 95000, 90000, 92000, 94000];
      const size = PositionSizer.drawdownAware(equity, 1000, 0.1);
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThanOrEqual(1000);
    });
  });
});
