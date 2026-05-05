/**
 * Test for Volume Indicators
 */

import { VolumeIndicators } from '../src/indicators/volume';

async function main() {
  console.log('📊 MeridianAlgo Volume Indicators Test\n');

  const high = [100, 102, 101, 103, 105];
  const low = [98, 100, 99, 101, 103];
  const close = [99, 101, 100, 102, 104];
  const volume = [1000, 2000, 1500, 2500, 3000];

  try {
    // 1. VWAP
    console.log('[1/3] VWAP');
    const vwap = VolumeIndicators.vwap(high, low, close, volume);
    console.log(`  - Cumulative VWAP (last): ${vwap.slice(-1)[0].toFixed(2)}`);
    console.log();

    // 2. MFI
    console.log('[2/3] MFI');
    // MFI needs more data for a 14-period MA, let's use a smaller period for test
    const mfi = VolumeIndicators.mfi(high, low, close, volume, 2);
    console.log(`  - MFI (last): ${mfi.slice(-1)[0].toFixed(2)}`);
    console.log();

    // 3. Others
    console.log('[3/3] Other Volume Indicators');
    const nvi = VolumeIndicators.nvi(close, volume);
    const pvi = VolumeIndicators.pvi(close, volume);
    console.log(`  - NVI (last): ${nvi.slice(-1)[0].toFixed(2)}`);
    console.log(`  - PVI (last): ${pvi.slice(-1)[0].toFixed(2)}`);

    console.log();
    console.log('✅ Volume Indicators Test Complete!');
  } catch (err) {
    console.error('❌ Volume Indicators Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
