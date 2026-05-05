/**
 * Test for Seasonality Indicators
 */

import { SeasonalityIndicators } from '../src/indicators/seasonality';
import { Bar } from '../src/core';

async function main() {
  console.log('📅 MeridianAlgo Seasonality Test\n');

  // Generate synthetic daily data for 2 months
  const bars: Bar[] = [];
  const start = new Date(2024, 0, 1); // Monday
  for (let i = 0; i < 60; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    bars.push({
      t: d,
      o: 100, h: 105, l: 95, c: 100 + (i % 7 === 4 ? 1 : 0), // Extra return on Fridays
      v: 1000
    });
  }

  try {
    // 1. Day of Week
    console.log('[1/3] Day of Week Effect');
    const dow = SeasonalityIndicators.dayOfWeekEffect(bars);
    console.log('  - Monday Avg Return:', dow[1].toFixed(4));
    console.log('  - Friday Avg Return (expected high):', dow[5].toFixed(4));
    console.log();

    // 2. Month-End
    console.log('[2/3] Month-End Effect');
    const me = SeasonalityIndicators.monthEndEffect(bars);
    console.log(`  - Month-end return: ${me.monthEndReturn.toFixed(4)}`);
    console.log(`  - Other days return: ${me.otherDaysReturn.toFixed(4)}`);
    console.log();

    // 3. Intraday
    console.log('[3/3] Intraday Seasonality');
    const intradayBars: Bar[] = Array.from({ length: 48 }, (_, i) => ({
      t: new Date(2024, 0, 1, i % 24, 0),
      o: 100, h: 101, l: 99, c: 100 + (i % 24 === 9 ? 2 : 0), // Spike at 9 AM
      v: 1000
    }));
    const intra = SeasonalityIndicators.intradaySeasonality(intradayBars);
    console.log('  - 9 AM Avg Return:', intra[9].toFixed(4));
    console.log('  - 3 PM Avg Return:', intra[15].toFixed(4));

    console.log();
    console.log('✅ Seasonality Test Complete!');
  } catch (err) {
    console.error('❌ Seasonality Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
