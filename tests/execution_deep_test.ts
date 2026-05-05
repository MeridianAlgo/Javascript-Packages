/**
 * Deep Test for Execution Algorithms
 */

import { 
  vwapSchedule, 
  twapSchedule, 
  povSchedule, 
  implementationShortfallSchedule 
} from '../src/execution/algorithms';

async function main() {
  console.log('⚡ MeridianAlgo Execution Algorithms Test\n');

  try {
    // 1. VWAP
    console.log('[1/4] VWAP Slicing');
    const vwap = vwapSchedule({
      totalQty: 100000,
      volumeProfile: [0.1, 0.2, 0.4, 0.2, 0.1]
    });
    console.log(`  - VWAP Slices: ${vwap.length}`);
    console.log(`  - Slice 2 Qty (expected 40,000): ${vwap[2].qty}`);
    console.log();

    // 2. TWAP
    console.log('[2/4] TWAP Slicing');
    const twap = twapSchedule({
      totalQty: 100000,
      buckets: 10
    });
    console.log(`  - TWAP Slices: ${twap.length}`);
    console.log(`  - Qty per slice (expected 10,000): ${twap[0].qty}`);
    console.log();

    // 3. POV
    console.log('[3/4] POV Slicing');
    const pov = povSchedule({
      totalQty: 10000,
      participation: 0.1,
      marketVolume: [50000, 50000, 50000, 50000]
    });
    console.log(`  - POV Slices: ${pov.length}`);
    console.log(`  - Final CumQty (expected 10,000): ${pov[pov.length-1].cumQty}`);
    console.log();

    // 4. Implementation Shortfall (Almgren-Chriss)
    console.log('[4/4] Implementation Shortfall');
    const is = implementationShortfallSchedule({
      totalQty: 100000,
      buckets: 10,
      sigma: 0.2,
      gamma: 1e-6,
      eta: 1e-5,
      riskAversion: 0.1
    });
    console.log(`  - IS Slices: ${is.length}`);
    console.log(`  - First Slice Qty: ${is[0].qty.toFixed(2)}`);
    console.log(`  - Last Slice Qty: ${is[9].qty.toFixed(2)}`);
    console.log('  - Front-loading check:', is[0].qty > is[9].qty ? 'YES' : 'NO');
    
    console.log();
    console.log('✅ Execution Test Complete!');
  } catch (err) {
    console.error('❌ Execution Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
