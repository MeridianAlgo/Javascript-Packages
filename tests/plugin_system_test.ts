/**
 * Test for Plugin System
 */

import { createMeridian, MeridianPlugin } from '../src/core/plugin';

async function main() {
  console.log('🔌 MeridianAlgo Plugin System Test\n');

  const meridian = createMeridian({ logLevel: 'debug' });

  // 1. Define a mock plugin
  const mockPlugin: MeridianPlugin = {
    id: 'test-plugin',
    version: '1.0.0',
    provides: {
      indicators: {
        'custom-indicator': (data: number[]) => data.map(x => x * 2)
      },
      strategies: {
        'custom-strategy': { id: 'custom', next: () => ({ t: new Date(), value: 1 }) }
      }
    },
    init: (ctx) => {
      console.log('  - Plugin init called with log level:', ctx.config.logLevel);
    }
  };

  try {
    // 2. Register plugin
    console.log('[1/3] Plugin Registration');
    meridian.use(mockPlugin);
    console.log('  - Registered plugins:', meridian.listPlugins());
    console.log();

    // 3. Use provided capabilities
    console.log('[2/3] Capability Discovery');
    console.log('  - Registered indicators:', meridian.listIndicators());
    const indicator = meridian.getIndicator('custom-indicator');
    const result = indicator([1, 2, 3]);
    console.log('  - Custom indicator result:', result);
    
    console.log('  - Registered strategies:', meridian.listStrategies());
    const strategy = meridian.getStrategy('custom-strategy');
    console.log('  - Custom strategy signal:', strategy.next());
    console.log();

    // 4. Error Handling
    console.log('[3/3] Error Handling');
    try {
      meridian.use(mockPlugin); // Duplicate ID
    } catch (e) {
      console.log('  - Caught expected error (duplicate plugin):', (e as Error).message);
    }

    try {
      meridian.getIndicator('non-existent');
    } catch (e) {
      console.log('  - Caught expected error (missing indicator):', (e as Error).message);
    }

    console.log();
    console.log('✅ Plugin System Test Complete!');
  } catch (err) {
    console.error('❌ Plugin System Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
