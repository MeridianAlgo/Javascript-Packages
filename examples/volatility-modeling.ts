/**
 * Volatility modeling demonstration
 * Fits GARCH(1,1) and EGARCH models to asset returns
 */

import { 
  fitGARCH11, 
  garch11Forecast, 
  GBM, 
  MathUtils 
} from '../src';

async function main() {
  console.log('📈 MeridianAlgo Volatility Modeling Demo\n');

  // 1. Generate synthetic returns with time-varying volatility
  // We'll use a GBM with high vol for the first half and low vol for the second half
  // to create some heteroskedasticity.
  console.log('Generating synthetic returns...');
  const gbm1 = new GBM({ S0: 100, mu: 0.05, sigma: 0.3, T: 0.5, steps: 126 });
  const gbm2 = new GBM({ S0: 100, mu: 0.05, sigma: 0.1, T: 0.5, steps: 126 });
  
  const path1 = gbm1.simulate({ paths: 1, seed: 42 })[0];
  const path2 = gbm2.simulate({ paths: 1, seed: 43 })[0];
  
  const prices = [...path1, ...path2.slice(1)];
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }

  console.log(`Generated ${returns.length} days of returns`);
  console.log('Unconditional Volatility:', (MathUtils.std(returns) * Math.sqrt(252) * 100).toFixed(2) + '%');
  console.log();

  // 2. Fit GARCH(1,1) model
  console.log('Fitting GARCH(1,1) model...');
  try {
    const result = fitGARCH11(returns);
    const { params, converged, logLikelihood } = result;

    console.log('Fitted Parameters:');
    console.log(`  Omega (Constant): ${params.omega.toExponential(4)}`);
    console.log(`  Alpha (ARCH):     ${params.alpha.toFixed(4)}`);
    console.log(`  Beta (GARCH):     ${params.beta.toFixed(4)}`);
    console.log(`  Mu (Mean):        ${params.mu.toExponential(4)}`);
    console.log(`  Persistence:      ${(params.alpha + params.beta).toFixed(4)}`);
    console.log();
    
    console.log(`Converged: ${converged}`);
    console.log(`Log-Likelihood: ${logLikelihood.toFixed(2)}`);
    console.log();

    // 3. Volatility Forecast
    console.log('Volatility Forecast (next 10 days):');
    const lastVar = result.variances[result.variances.length - 1];
    const lastRes = returns[returns.length - 1] - params.mu;
    const forecast = garch11Forecast(lastVar, lastRes, params, 10);
    
    forecast.forEach((v, i) => {
      const vol = Math.sqrt(v) * Math.sqrt(252);
      console.log(`  Day ${i + 1}: ${(vol * 100).toFixed(2)}% (annualized vol)`);
    });
    
    const uncondVol = Math.sqrt(params.omega / (1 - params.alpha - params.beta)) * Math.sqrt(252);
    console.log(`  Long-run Vol: ${(uncondVol * 100).toFixed(2)}%`);
  } catch (err) {
    console.error('GARCH fitting failed:', err);
  }

  console.log('\n✅ Volatility modeling demo complete!');
}

main().catch(console.error);
