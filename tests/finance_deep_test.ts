/**
 * Deep Test for Finance Modules (TVM & Bonds)
 */

import * as TVM from '../src/finance/tvm';
import * as Bonds from '../src/finance/bonds';

async function main() {
  console.log('💰 MeridianAlgo Finance Deep Test\n');

  try {
    // 1. TVM Calculations
    console.log('[1/2] Time Value of Money (TVM)');
    const fv = TVM.fv(0.05, 10, 0, -1000);
    console.log(`  - FV of $1000 at 5% for 10 years: $${fv.toFixed(2)} (Expected ~$1628.89)`);
    
    const pmt = TVM.pmt(0.05 / 12, 30 * 12, 300000);
    console.log(`  - Monthly Payment for $300k mortgage at 5% (30yr): $${Math.abs(pmt).toFixed(2)} (Expected ~$1610.46)`);
    
    const irr = TVM.irr([-1000, 200, 200, 200, 200, 300]);
    console.log(`  - IRR of project [-1000, 200...300]: ${(irr * 100).toFixed(2)}%`);
    console.log();

    // 2. Bond Pricing
    console.log('[2/2] Bond Pricing & Risk');
    const bondParams: Bonds.BondParams = {
      face: 1000,
      couponRate: 0.04,
      yearsToMaturity: 5,
      ytm: 0.05,
      frequency: 2
    };
    
    const price = Bonds.cleanPrice(bondParams);
    console.log(`  - Clean Price of 4% coupon bond (5yr) at 5% YTM: $${price.toFixed(2)}`);
    
    const duration = Bonds.macaulayDuration(bondParams);
    console.log(`  - Macaulay Duration: ${duration.toFixed(2)} years`);
    
    const ytm = Bonds.yieldToMaturity(price, 1000, 0.04, 5, 2);
    console.log(`  - Calculated YTM: ${(ytm * 100).toFixed(2)}% (Expected 5.00%)`);

    console.log();
    console.log('✅ Finance Test Complete!');
  } catch (err) {
    console.error('❌ Finance Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
