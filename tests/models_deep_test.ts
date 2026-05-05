/**
 * Deep Test for Models (ARIMA & Regression)
 */

import { LinearRegressionModel } from '../src/models/linear-regression';
import { ARIMAModel } from '../src/models/arima';

async function main() {
  console.log('📉 MeridianAlgo Models Deep Test\n');

  try {
    // 1. Linear Regression
    console.log('[1/2] Linear Regression');
    const x = [[1], [2], [3], [4], [5]];
    const y = [2.1, 3.9, 6.2, 8.1, 10.1]; // y ≈ 2x
    
    const lr = new LinearRegressionModel();
    await lr.train(x, y);
    const predictions = await lr.predict([[6], [7]]);
    console.log(`  - Prediction for x=6: ${predictions[0].toFixed(2)} (Expected ~12.0)`);
    console.log(`  - Feature Importance: [${lr.featureImportance().map(w => w.toFixed(2)).join(', ')}]`);
    console.log();

    // 2. ARIMA
    console.log('[2/2] ARIMA Model');
    const series = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const arima = new ARIMAModel({ p: 1, d: 1, q: 0 });
    await arima.train(series);
    const forecast = await arima.predict(3);
    console.log(`  - Forecast (3 steps): [${forecast.map((f: number) => f.toFixed(2)).join(', ')}]`);

    console.log();
    console.log('✅ Models Test Complete!');
  } catch (err) {
    console.error('❌ Models Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
