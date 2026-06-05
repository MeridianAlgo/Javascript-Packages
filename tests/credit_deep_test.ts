/**
 * Deep Test for Credit Risk
 */

import { expectedLoss, portfolioExpectedLoss, impliedCreditSpread } from '../src/credit/expected-loss';
import { mertonStructural, impliedAssetVol } from '../src/credit/merton-structural';

async function main() {
  console.log('💳 MeridianAlgo Credit Risk Test\n');

  try {
    // 1. Expected Loss
    console.log('[1/3] Expected Loss');
    const exposure = { pd: 0.02, lgd: 0.45, ead: 1000000 };
    const el = expectedLoss(exposure);
    console.log(`  - Single EL ($1M, 2% PD, 45% LGD): $${el.toFixed(2)}`);
    
    const portfolio = [
      { pd: 0.01, lgd: 0.4, ead: 500000 },
      { pd: 0.05, lgd: 0.6, ead: 200000 }
    ];
    const pel = portfolioExpectedLoss(portfolio);
    console.log(`  - Portfolio EL: $${pel.toFixed(2)}`);
    
    const spread = impliedCreditSpread(0.02, 0.6, 1);
    console.log(`  - Implied Spread (2% PD, 60% LGD): ${(spread * 10000).toFixed(2)} bps`);
    console.log();

    // 2. Merton Model
    console.log('[2/3] Merton Structural Model');
    const mertonIn = {
      V: 100,
      D: 80,
      T: 1,
      r: 0.03,
      sigmaV: 0.25
    };
    const mertonOut = mertonStructural(mertonIn);
    console.log(`  - Equity Value: $${mertonOut.equityValue.toFixed(2)}`);
    console.log(`  - Distance to Default: ${mertonOut.distanceToDefault.toFixed(4)}`);
    console.log(`  - Prob of Default: ${(mertonOut.defaultProb * 100).toFixed(2)}%`);
    console.log();

    // 3. Implied Asset Volatility
    console.log('[3/3] Implied Asset Volatility');
    const iv = impliedAssetVol(mertonOut.equityValue, 100, 80, 1, 0.03);
    console.log(`  - Recovered Asset Vol: ${(iv * 100).toFixed(2)}% (Target: 25.00%)`);
    
    console.log();
    console.log('✅ Credit Test Complete!');
  } catch (err) {
    console.error('❌ Credit Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
