/**
 * Deep Test for Utilities (Time & Stats)
 */

import { TimeUtils } from '../src/utils/time';
import { StatUtils } from '../src/utils/stats';

async function main() {
  console.log('🛠️ MeridianAlgo Utils Deep Test\n');

  try {
    // 1. Time Utils
    console.log('[1/2] Time Utilities');
    const now = new Date();
    console.log(`  - Format Date: ${TimeUtils.formatDate(now)}`);
    // Jan 15, 2024 is MLK Day (market holiday), so test with Tuesday Jan 16, 2024.
    const tuesday = new Date(2024, 0, 16, 14, 0);
    console.log(`  - Is Market Open (Jan 16, 14:00): ${TimeUtils.isMarketOpen(tuesday)}`);
    console.log(`  - Trading Days between Jan 1 and Jan 10: ${TimeUtils.tradingDays(new Date(2024, 0, 1), new Date(2024, 0, 10))}`);
    console.log();

    // 2. Stat Utils
    console.log('[2/2] Statistics Utilities');
    console.log(`  - Normal CDF (0): ${StatUtils.normalCDF(0)} (Expected 0.5)`);
    console.log(`  - Normal CDF (1.96): ${StatUtils.normalCDF(1.96).toFixed(4)} (Expected ~0.975)`);
    
    const data = [1, 2, 3, 4, 5, 4, 3, 2, 1];
    console.log(`  - Jarque-Bera Statistic: ${StatUtils.jarqueBera(data).toFixed(4)}`);
    
    const sample1 = [10, 12, 9, 11, 10];
    const sample2 = [15, 14, 16, 15, 15];
    console.log(`  - T-Test Statistic: ${StatUtils.tTest(sample1, sample2).toFixed(4)}`);

    console.log();
    console.log('✅ Utils Test Complete!');
  } catch (err) {
    console.error('❌ Utils Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
