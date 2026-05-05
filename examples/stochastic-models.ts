import { 
  GBM, 
  Heston, 
  MonteCarloEngine, 
  MathUtils 
} from '../src';

async function main() {
  console.log('🎲 MeridianAlgo Stochastic Models Demo\n');

  // 1. Geometric Brownian Motion (GBM)
  console.log('📈 Geometric Brownian Motion (GBM)');
  console.log('==================================');
  const gbm = new GBM({
    S0: 100,      // Initial price
    mu: 0.05,     // Expected return (annualized)
    sigma: 0.2,   // Volatility (annualized)
    T: 1,         // Time in years
    steps: 252    // Daily steps
  });

  const paths = gbm.simulate({ paths: 1, seed: 123 }); // Generate 1 path
  const gbmPath = paths[0];
  console.log(`Generated ${gbmPath.length} days of price data`);
  console.log('First 5 prices:', gbmPath.slice(0, 5).map((p: number) => p.toFixed(2)));
  console.log('Last 5 prices:', gbmPath.slice(-5).map((p: number) => p.toFixed(2)));
  console.log('Total Return:', ((gbmPath[gbmPath.length-1] / gbmPath[0] - 1) * 100).toFixed(2) + '%');
  console.log();

  // 2. Heston Model (Stochastic Volatility)
  console.log('🌪️ Heston Model (Stochastic Volatility)');
  console.log('=======================================');
  const heston = new Heston({
    S0: 100,
    v0: 0.04,     // Initial variance (sigma^2 = 0.2^2)
    kappa: 2.0,   // Rate of mean reversion
    theta: 0.04,  // Long-term variance
    xi: 0.3,      // Volatility of volatility (vol of vol)
    rho: -0.7,    // Correlation between asset and volatility
    mu: 0.05,
    T: 1,
    steps: 252
  });

  const hestonResult = heston.simulate({ paths: 1, seed: 123 });
  const hPrices = hestonResult[0].prices;
  const hVars = hestonResult[0].variances;
  console.log(`Generated ${hPrices.length} days of prices with stochastic volatility`);
  console.log('End Price:', hPrices[hPrices.length-1].toFixed(2));
  console.log('End Variance:', hVars[hVars.length-1].toFixed(4));
  console.log();

  // 3. Monte Carlo Simulation
  console.log('🔢 Monte Carlo Simulation');
  console.log('========================');
  const mc = new MonteCarloEngine(
    () => gbm.simulateTerminal({ paths: 1000, antithetic: true, seed: 42 }),
    (terminals: number[]) => terminals.map((s: number) => s) // Just returning the final price as the "payoff"
  );

  console.log('Running 1,000 simulations for 1 year...');
  const result = mc.run();
  
  console.log('Simulation Results:');
  console.log('  Estimate (Mean End Price):', result.estimate.toFixed(2));
  console.log('  Std Error:', result.stderr.toFixed(2));
  console.log('  95% CI:', `[${result.ci95[0].toFixed(2)}, ${result.ci95[1].toFixed(2)}]`);
  console.log();

  console.log('✅ Stochastic models demo complete!');
}

main().catch(console.error);
