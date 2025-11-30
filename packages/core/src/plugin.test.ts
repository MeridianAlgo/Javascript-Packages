import { describe, it, expect, beforeEach } from '@jest/globals';
import { createMeridian, MeridianPlugin } from './plugin';

describe('Core Plugin System', () => {
  let meridian: ReturnType<typeof createMeridian>;

  beforeEach(() => {
    meridian = createMeridian();
  });

  describe('Plugin Registration', () => {
    it('should register a valid plugin', () => {
      const plugin: MeridianPlugin = {
        id: 'test-plugin',
        version: '1.0.0',
        provides: {
          indicators: {
            testIndicator: (data: number[]) => data
          }
        }
      };

      meridian.use(plugin);
      const indicator = meridian.getIndicator('testIndicator');
      expect(indicator).toBeDefined();
    });

    it('should retrieve registered plugin by id', () => {
      const plugin: MeridianPlugin = {
        id: 'test-plugin',
        provides: {}
      };

      meridian.use(plugin);
      expect(() => meridian.getIndicator('nonexistent')).toThrow();
    });

    it('should handle multiple plugins', () => {
      const plugin1: MeridianPlugin = {
        id: 'plugin1',
        provides: {
          indicators: {
            indicator1: (data: number[]) => data
          }
        }
      };

      const plugin2: MeridianPlugin = {
        id: 'plugin2',
        provides: {
          indicators: {
            indicator2: (data: number[]) => data.map(x => x * 2)
          }
        }
      };

      meridian.use(plugin1).use(plugin2);
      
      const ind1 = meridian.getIndicator('indicator1');
      const ind2 = meridian.getIndicator('indicator2');
      
      expect(ind1).toBeDefined();
      expect(ind2).toBeDefined();
    });
  });

  describe('Plugin Validation', () => {
    it('should reject plugin without id', () => {
      const invalidPlugin = {
        provides: {}
      } as any;

      expect(() => meridian.use(invalidPlugin)).toThrow();
    });

    it('should reject plugin without provides', () => {
      const invalidPlugin = {
        id: 'test'
      } as any;

      expect(() => meridian.use(invalidPlugin)).toThrow();
    });

    it('should handle plugin with same capability', () => {
      const plugin1: MeridianPlugin = {
        id: 'plugin1',
        provides: {
          indicators: {
            sma: (data: number[]) => data
          }
        }
      };

      const plugin2: MeridianPlugin = {
        id: 'plugin2',
        provides: {
          indicators: {
            sma: (data: number[]) => data.map(x => x * 2)
          }
        }
      };

      meridian.use(plugin1);
      meridian.use(plugin2);
      
      // Last registered should win
      const sma = meridian.getIndicator('sma');
      expect(sma([1, 2, 3])).toEqual([2, 4, 6]);
    });
  });

  describe('Plugin Initialization', () => {
    it('should call init method with context', async () => {
      let initCalled = false;
      let receivedContext: any = null;

      const plugin: MeridianPlugin = {
        id: 'test-plugin',
        init: async (ctx) => {
          initCalled = true;
          receivedContext = ctx;
        },
        provides: {}
      };

      meridian.use(plugin);
      
      expect(initCalled).toBe(true);
      expect(receivedContext).toBeDefined();
      expect(receivedContext.config).toBeDefined();
    });

    it('should handle init errors gracefully', () => {
      const plugin: MeridianPlugin = {
        id: 'failing-plugin',
        init: () => {
          throw new Error('Init failed');
        },
        provides: {}
      };

      expect(() => meridian.use(plugin)).toThrow('Init failed');
    });
  });

  describe('Data Adapters', () => {
    it('should register and retrieve data adapters', () => {
      const mockAdapter = {
        id: 'mock',
        ohlcv: async () => []
      };

      const plugin: MeridianPlugin = {
        id: 'data-plugin',
        provides: {
          dataAdapters: {
            mock: mockAdapter
          }
        }
      };

      meridian.use(plugin);
      const adapter = meridian.getDataAdapter('mock');
      expect(adapter).toBe(mockAdapter);
    });
  });

  describe('Strategies', () => {
    it('should register and retrieve strategies', () => {
      const mockStrategy = () => ({
        id: 'test',
        next: () => null
      });

      const plugin: MeridianPlugin = {
        id: 'strategy-plugin',
        provides: {
          strategies: {
            testStrategy: mockStrategy
          }
        }
      };

      meridian.use(plugin);
      const strategy = meridian.getStrategy('testStrategy');
      expect(strategy).toBe(mockStrategy);
    });
  });
});
