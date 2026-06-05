/**
 * Deep Test for Market Microstructure
 */

import { OrderBook } from '../src/microstructure/order-book';
import { squareRootImpact, almgrenChrissExpectedCost } from '../src/microstructure/market-impact';
import { rollSpread } from '../src/microstructure/spread-analyzer';

async function main() {
  console.log('🏛️ MeridianAlgo Microstructure Deep Test\n');

  try {
    // 1. Order Book
    console.log('[1/3] Order Book Analytics');
    const ob = new OrderBook({
      bids: [{ price: 99.95, size: 1000 }, { price: 99.90, size: 500 }],
      asks: [{ price: 100.05, size: 800 }, { price: 100.10, size: 600 }]
    });
    console.log(`  - Mid Price: ${ob.midPrice().toFixed(4)}`);
    console.log(`  - Microprice: ${ob.microprice().toFixed(4)}`);
    console.log(`  - Imbalance: ${ob.imbalance().toFixed(4)}`);
    console.log();

    // 2. Market Impact
    console.log('[2/3] Market Impact Models');
    const impact = squareRootImpact({ 
      qty: 50000, 
      adv: 1000000, 
      sigma: 0.20, 
      c: 0.5 
    });
    console.log(`  - Square-root impact: ${(impact * 10000).toFixed(2)} bps`);
    
    const acCost = almgrenChrissExpectedCost({
      qty: 50000,
      T: 10,
      sigma: 0.002, // volatility per bucket
      gamma: 1e-7,
      eta: 1e-6
    });
    console.log(`  - AC Expected Cost: $${acCost.expectedCost.toFixed(2)}`);
    console.log(`  - AC Variance: ${acCost.variance.toFixed(4)}`);
    console.log();

    // 3. Spreads
    console.log('[3/3] Spread Analysis');
    const tradePrices = [100.0, 100.05, 100.02, 100.08, 100.04];
    const roll = rollSpread(tradePrices);
    console.log(`  - Roll Effective Spread: ${roll.toFixed(4)}`);

    console.log();
    console.log('✅ Microstructure Test Complete!');
  } catch (err) {
    console.error('❌ Microstructure Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
