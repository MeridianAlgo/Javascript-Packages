/**
 * Yield curve fitting demonstration
 * Fits a Nelson-Siegel curve to market observations
 */

import { 
  YieldCurve, 
  YieldObservation 
} from '../src';

async function main() {
  console.log('📉 MeridianAlgo Yield Curve Fitting Demo\n');

  // 1. Define market observations (Treasury yields)
  // Maturity in years, Yield as decimal
  const observations: YieldObservation[] = [
    { maturity: 0.25, yield: 0.0525 }, // 3M
    { maturity: 0.5,  yield: 0.0535 }, // 6M
    { maturity: 1,    yield: 0.0515 }, // 1Y
    { maturity: 2,    yield: 0.0485 }, // 2Y
    { maturity: 5,    yield: 0.0445 }, // 5Y
    { maturity: 10,   yield: 0.0425 }, // 10Y
    { maturity: 30,   yield: 0.0435 }  // 30Y
  ];

  console.log('Market Observations:');
  observations.forEach(o => {
    console.log(`  ${o.maturity}Y: ${(o.yield * 100).toFixed(2)}%`);
  });
  console.log();

  // 2. Fit Nelson-Siegel curve
  console.log('Fitting Nelson-Siegel curve...');
  const curve = YieldCurve.fit(observations);
  const params = curve.parameters();

  console.log('Fitted Parameters:');
  console.log(`  b0 (Level): ${params.b0.toFixed(4)}`);
  console.log(`  b1 (Slope): ${params.b1.toFixed(4)}`);
  console.log(`  b2 (Curvature): ${params.b2.toFixed(4)}`);
  console.log(`  tau (Decay): ${params.tau.toFixed(4)}`);
  console.log();

  // 3. Query the curve
  console.log('Interpolated Spot Rates:');
  const points = [0, 0.5, 1, 3, 7, 15, 20, 25];
  points.forEach(t => {
    const rate = curve.spotRate(t);
    const df = curve.discountFactor(t);
    console.log(`  ${t.toFixed(1)}Y: ${(rate * 100).toFixed(2)}% (Discount Factor: ${df.toFixed(4)})`);
  });
  console.log();

  // 4. Forward Rates
  console.log('Forward Rates:');
  const fwd1y1y = curve.forwardRateBetween(1, 2);
  const fwd5y5y = curve.forwardRateBetween(5, 10);
  console.log(`  1Y1Y Forward: ${(fwd1y1y * 100).toFixed(2)}%`);
  console.log(`  5Y5Y Forward: ${(fwd5y5y * 100).toFixed(2)}%`);
  console.log();

  console.log('✅ Yield curve demo complete!');
}

main().catch(console.error);
