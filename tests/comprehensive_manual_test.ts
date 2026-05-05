/**
 * Comprehensive Manual Test
 * Exercises multiple packages to ensure they work together
 */

import { 
  createMeridian, 
  indicatorsPlugin,
  MathUtils,
  StatUtils,
  YieldCurve,
  GBM,
  fitGARCH11,
  OrderBook
} from '../src';

async function main() {
  console.log('🚀 MeridianAlgo Comprehensive Test Suite\n');

  try {
    // 1. Framework & Plugin System
    console.log('[1/5] Core & Plugins');
    const meridian = createMeridian();
    meridian.use(indicatorsPlugin);
    console.log('  - Meridian instance created');
    console.log('  - Indicators plugin registered');
    console.log();

    // 2. Utils & Stats
    console.log('[2/5] Utils & Statistics');
    const data = [1, 2, 3, 4, 5, 4, 3, 2, 1];
    const mean = MathUtils.mean(data);
    const std = MathUtils.std(data);
    const jb = StatUtils.jarqueBera(data);
    console.log(`  - Mean: ${mean}, Std: ${std}`);
    console.log(`  - Jarque-Bera: ${jb.toFixed(4)}`);
    console.log();

    // 3. Curves & Finance
    console.log('[3/5] Curves & Stochastic');
    const curve = YieldCurve.fit([
      { maturity: 1, yield: 0.05 },
      { maturity: 2, yield: 0.048 },
      { maturity: 5, yield: 0.045 },
      { maturity: 10, yield: 0.042 }
    ]);
    console.log(`  - 5Y Spot Rate: ${(curve.spotRate(5) * 100).toFixed(2)}%`);

    const gbm = new GBM({ S0: 100, mu: 0.05, sigma: 0.2, T: 1, steps: 10 });
    const paths = gbm.simulate({ paths: 1 });
    console.log(`  - GBM Path (10 steps) end: ${paths[0][10].toFixed(2)}`);
    console.log();

    // 4. Volatility Modeling
    console.log('[4/5] GARCH Modeling');
    // Generating some dummy returns for GARCH
    const returns = Array.from({ length: 50 }, () => Math.random() * 0.02 - 0.01);
    const garchResult = fitGARCH11(returns);
    console.log(`  - GARCH(1,1) alpha: ${garchResult.params.alpha.toFixed(4)}`);
    console.log();

    // 5. Microstructure
    console.log('[5/5] Microstructure');
    const ob = new OrderBook({
      bids: [{ price: 99.9, size: 100 }],
      asks: [{ price: 100.1, size: 200 }]
    });
    console.log(`  - Mid Price: ${ob.midPrice()}`);
    console.log(`  - Microprice: ${ob.microprice()?.toFixed(4)}`);
    console.log();

    console.log('✅ Comprehensive Test Passed!');
  } catch (err) {
    console.error('❌ Comprehensive Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
