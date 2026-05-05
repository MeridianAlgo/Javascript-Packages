/**
 * Deep Test for Options Pricing
 */

import { blackScholesPrice, blackScholesGreeks, putCallParity } from '../src/options/black-scholes';
import { impliedVolatility } from '../src/options/implied-volatility';

async function main() {
  console.log('📈 MeridianAlgo Options Deep Test\n');

  const S = 100;
  const K = 105;
  const T = 0.5; // 6 months
  const r = 0.05; // 5%
  const sigma = 0.2; // 20%
  const q = 0.01; // 1% dividend

  const inputs = { S, K, T, r, sigma, q };

  try {
    // 1. Black-Scholes Pricing
    console.log('[1/3] Black-Scholes Pricing');
    const callPrice = blackScholesPrice(inputs, 'call');
    const putPrice = blackScholesPrice(inputs, 'put');
    
    console.log(`  - Call Price: $${callPrice.toFixed(4)}`);
    console.log(`  - Put Price: $${putPrice.toFixed(4)}`);
    
    const parity = putCallParity(S, K, T, r, callPrice, putPrice, q);
    console.log(`  - Put-Call Parity Deviation: ${parity.toExponential(4)}`);
    console.log();

    // 2. Greeks
    console.log('[2/3] Greeks');
    const callGreeks = blackScholesGreeks(inputs, 'call');
    const putGreeks = blackScholesGreeks(inputs, 'put');
    
    console.log('  - Call Delta:', callGreeks.delta.toFixed(4));
    console.log('  - Call Gamma:', callGreeks.gamma.toFixed(4));
    console.log('  - Call Theta (yearly):', callGreeks.theta.toFixed(4));
    console.log('  - Call Vega:', callGreeks.vega.toFixed(4));
    console.log('  - Call Rho:', callGreeks.rho.toFixed(4));
    console.log();
    
    console.log('  - Put Delta:', putGreeks.delta.toFixed(4));
    console.log('  - Put Gamma:', putGreeks.gamma.toFixed(4));
    console.log();

    // 3. Implied Volatility
    console.log('[3/3] Implied Volatility');
    const iv = impliedVolatility(
      callPrice,
      S, K, T, r, 'call', q
    );
    
    console.log(`  - Recovered IV: ${(iv * 100).toFixed(2)}% (Target: ${(sigma * 100).toFixed(2)}%)`);
    
    console.log();
    console.log('✅ Options Test Complete!');
  } catch (err) {
    console.error('❌ Options Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
