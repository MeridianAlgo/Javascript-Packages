/**
 * Higher-Order Greeks & Tail-Risk Example
 *
 * Demonstrates the v3.12 additions:
 * - higherOrderGreeks: vanna, charm, vomma, veta, speed, zomma, color, ultima,
 *   dual delta and dual gamma for a European option.
 * - Tail-risk analytics: modified Expected Shortfall (Cornish-Fisher),
 *   Pézier-White Adjusted Sharpe Ratio, and the tail ratio.
 *
 * Run: npx ts-node examples/higher-order-greeks-and-tail-risk.ts
 */

// Import from the specific modules (rather than the root barrel) so this demo
// runs without pulling in the optional market-data adapters.
import { higherOrderGreeks, blackScholesGreeks } from '../src/options';
import {
  modifiedExpectedShortfall,
  adjustedSharpeRatio,
  tailRatio,
} from '../src/risk/tail-risk';
import { cornishFisherVaR } from '../src/risk/advanced';

// ---------------------------------------------------------------------------
// 1. Option Greeks
// ---------------------------------------------------------------------------
const option = { S: 100, K: 105, T: 0.75, r: 0.03, sigma: 0.25, q: 0.01 };

console.log('First-order Greeks:', blackScholesGreeks(option, 'call'));
console.log('Higher-order Greeks:', higherOrderGreeks(option, 'call'));

// Time-decay Greeks are per year — convert charm to a per-day delta drift:
const { charm } = higherOrderGreeks(option, 'call');
console.log(`Charm per calendar day: ${(charm / 365).toFixed(6)}`);

// ---------------------------------------------------------------------------
// 2. Tail-risk analytics on a fat-tailed daily return series
// ---------------------------------------------------------------------------
const dailyReturns = [
  0.006, 0.004, -0.003, 0.008, -0.002, 0.005, 0.007, -0.001, 0.003, 0.004,
  -0.045, 0.006, 0.002, -0.004, 0.005, 0.003, -0.06, 0.004, 0.006, 0.002,
];

console.log('\nTail risk (95% confidence):');
console.log('  Cornish-Fisher VaR:        ', cornishFisherVaR(dailyReturns, 0.95).toFixed(5));
console.log('  Modified Expected Shortfall:', modifiedExpectedShortfall(dailyReturns, 0.95).toFixed(5));
console.log('  Adjusted Sharpe (annual):  ', adjustedSharpeRatio(dailyReturns, 0.02, 252).toFixed(4));
console.log('  Tail ratio (5%):           ', tailRatio(dailyReturns, 0.05).toFixed(4));
