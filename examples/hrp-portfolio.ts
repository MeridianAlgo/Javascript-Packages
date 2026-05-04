/**
 * Hierarchical Risk Parity allocation across 5 synthetic assets.
 */
import { hrpAllocate } from '../src';

const n = 250;
const assets = ['SPY', 'TLT', 'GLD', 'IWM', 'EEM'];

function genReturns(mu: number, sigma: number): number[] {
  return Array.from({ length: n }, () => {
    const z = (Math.random() + Math.random() + Math.random() - 1.5) * 2;
    return mu + sigma * z;
  });
}

const series: number[][] = [
  genReturns(0.0008, 0.012),
  genReturns(0.0003, 0.008),
  genReturns(0.0004, 0.010),
  genReturns(0.0009, 0.018),
  genReturns(0.0006, 0.020),
];

// Transpose: rows = time, cols = assets
const returns: number[][] = [];
for (let t = 0; t < n; t++) {
  returns.push(series.map(s => s[t]));
}

const result = hrpAllocate({ returns });
const weights = result.weights;

console.log('HRP weights:');
assets.forEach((a, i) => {
  console.log(`  ${a}: ${(weights[i] * 100).toFixed(2)}%`);
});
console.log('Sum:', weights.reduce((a: number, b: number) => a + b, 0).toFixed(4));
