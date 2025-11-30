/**
 * Advanced features example
 * Demonstrates GARCH, regime detection, microstructure, and feature engineering
 */

import { YahooAdapter } from '@meridianalgo/data';
import {
  AdvancedVolatilityIndicators,
  RegimeIndicators,
  MicrostructureIndicators,
  FeatureEngineering,
  SeasonalityIndicators
} from '@meridianalgo/indicators';

async function main() {
  console.log('🚀 MeridianAlgo Advanced Features Demo\n');
  
  // Fetch data
  console.log('📊 Fetching AAPL data...');
  const yahoo = new YahooAdapter();
  const bars = await yahoo.ohlcv('AAPL', {
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1d'
  });
  
  console.log(`✅ Fetched ${bars.length} bars\n`);
  
  // Calculate returns
  const returns: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    returns.push((bars[i].c - bars[i - 1].c) / bars[i - 1].c);
  }
  
  // 1. GARCH Volatility
  console.log('📈 GARCH(1,1) Volatility Model');
  console.log('================================');
  const garch = AdvancedVolatilityIndicators.garch(returns);
  console.log('Parameters:', garch.params);
  console.log('Log-Likelihood:', garch.logLikelihood.toFixed(2));
  console.log('Current Volatility:', (garch.volatility[garch.volatility.length - 1] * 100).toFixed(2) + '%');
  console.log('Annualized Vol:', (garch.volatility[garch.volatility.length - 1] * Math.sqrt(252) * 100).toFixed(2) + '%\n');
  
  // 2. EWMA Volatility
  console.log('📉 EWMA Volatility');
  console.log('==================');
  const ewma = AdvancedVolatilityIndicators.ewmaVol(returns, 0.94);
  console.log('Current EWMA Vol:', (ewma[ewma.length - 1] * 100).toFixed(2) + '%');
  console.log('Annualized EWMA Vol:', (ewma[ewma.length - 1] * Math.sqrt(252) * 100).toFixed(2) + '%\n');
  
  // 3. Regime Detection
  console.log('🔄 Regime Detection (HMM)');
  console.log('==========================');
  const regimes = RegimeIndicators.hmm(returns, 2);
  const currentRegime = regimes.regimes[regimes.regimes.length - 1];
  console.log('Current Regime:', currentRegime);
  console.log('Regime Distribution:', {
    regime0: regimes.regimes.filter(r => r === 0).length,
    regime1: regimes.regimes.filter(r => r === 1).length
  });
  console.log('Transition Matrix:');
  regimes.transitions.forEach((row, i) => {
    console.log(`  From ${i}:`, row.map(p => p.toFixed(3)).join(', '));
  });
  console.log();
  
  // 4. Change Point Detection
  console.log('📍 Change Point Detection');
  console.log('=========================');
  const changePoints = RegimeIndicators.changePoints(returns, 3);
  console.log('Detected Change Points:', changePoints.length);
  if (changePoints.length > 0) {
    console.log('Recent Change Points:', changePoints.slice(-3).map(i => bars[i].t.toISOString().split('T')[0]));
  }
  console.log();
  
  // 5. Trend Classification
  console.log('📊 Trend Classification');
  console.log('=======================');
  const trendClass = RegimeIndicators.trendClassifier(returns, 50);
  const currentTrend = trendClass[trendClass.length - 1];
  const trendLabel = currentTrend > 0 ? 'Trending' : currentTrend < 0 ? 'Mean-Reverting' : 'Random Walk';
  console.log('Current Market State:', trendLabel);
  console.log('Trend Distribution:', {
    trending: trendClass.filter(t => t > 0).length,
    meanReverting: trendClass.filter(t => t < 0).length,
    neutral: trendClass.filter(t => t === 0).length
  });
  console.log();
  
  // 6. Microstructure Indicators
  console.log('🔬 Microstructure Analysis');
  console.log('==========================');
  const vpin = MicrostructureIndicators.vpin(bars, 50);
  const orderImbalance = MicrostructureIndicators.orderImbalance(bars);
  const kylesLambda = MicrostructureIndicators.kylesLambda(bars, 20);
  
  console.log('Current VPIN:', vpin[vpin.length - 1]?.toFixed(4) || 'N/A');
  console.log('Current Order Imbalance:', orderImbalance[orderImbalance.length - 1].toFixed(4));
  console.log('Current Kyle\'s Lambda:', kylesLambda[kylesLambda.length - 1]?.toFixed(6) || 'N/A');
  console.log();
  
  // 7. Feature Engineering
  console.log('🛠️  Feature Engineering');
  console.log('======================');
  const prices = bars.map(b => b.c);
  
  // Rolling statistics
  const rollingStats = FeatureEngineering.rollingStats(returns, 20);
  console.log('20-day Rolling Stats:');
  console.log('  Mean:', (rollingStats.mean[rollingStats.mean.length - 1] * 100).toFixed(4) + '%');
  console.log('  Std:', (rollingStats.std[rollingStats.std.length - 1] * 100).toFixed(4) + '%');
  console.log('  Skewness:', rollingStats.skew[rollingStats.skew.length - 1].toFixed(4));
  console.log('  Kurtosis:', rollingStats.kurt[rollingStats.kurt.length - 1].toFixed(4));
  console.log();
  
  // Z-scores
  const zscores = FeatureEngineering.zscore(returns, 20);
  console.log('Current Z-Score:', zscores[zscores.length - 1].toFixed(2));
  console.log();
  
  // Lagged features
  const laggedFeatures = FeatureEngineering.lags(returns, [1, 2, 3, 5, 10]);
  console.log('Lagged Features (last observation):', laggedFeatures[laggedFeatures.length - 1].map(x => x.toFixed(4)));
  console.log();
  
  // 8. Seasonality Analysis
  console.log('📅 Seasonality Analysis');
  console.log('=======================');
  
  // Day of week effect
  const dayOfWeek = SeasonalityIndicators.dayOfWeekEffect(bars);
  console.log('Day of Week Effect:');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  Object.entries(dayOfWeek).forEach(([day, ret]) => {
    console.log(`  ${dayNames[parseInt(day)]}: ${(ret * 100).toFixed(3)}%`);
  });
  console.log();
  
  // Month-end effect
  const monthEnd = SeasonalityIndicators.monthEndEffect(bars, 3);
  console.log('Month-End Effect:');
  console.log('  Month-End Return:', (monthEnd.monthEndReturn * 100).toFixed(3) + '%');
  console.log('  Other Days Return:', (monthEnd.otherDaysReturn * 100).toFixed(3) + '%');
  console.log('  Effect:', (monthEnd.effect * 100).toFixed(3) + '%');
  console.log();
  
  // Holiday effect
  const holiday = SeasonalityIndicators.holidayEffect(bars);
  console.log('Holiday Effect:');
  console.log('  Pre-Holiday Return:', (holiday.preHolidayReturn * 100).toFixed(3) + '%');
  console.log('  Post-Holiday Return:', (holiday.postHolidayReturn * 100).toFixed(3) + '%');
  console.log('  Normal Return:', (holiday.normalReturn * 100).toFixed(3) + '%');
  console.log();
  
  // 9. Correlation Analysis
  console.log('🔗 Correlation Analysis');
  console.log('=======================');
  
  // Create feature matrix
  const featureMatrix: number[][] = [];
  for (let i = 20; i < returns.length; i++) {
    featureMatrix.push([
      returns[i],
      rollingStats.mean[i - 20],
      rollingStats.std[i - 20],
      zscores[i - 20]
    ]);
  }
  
  const correlation = FeatureEngineering.correlation(featureMatrix);
  console.log('Feature Correlation Matrix:');
  console.log('Features: [return, mean, std, zscore]');
  correlation.forEach((row, i) => {
    console.log(`  ${i}:`, row.map(x => x.toFixed(3)).join(', '));
  });
  console.log();
  
  // 10. PCA
  console.log('🎯 Principal Component Analysis');
  console.log('================================');
  const pca = FeatureEngineering.pca(featureMatrix);
  console.log('First Principal Component:', pca.component.map(x => x.toFixed(3)));
  console.log('Explained Variance:', pca.variance.toFixed(4));
  console.log();
  
  console.log('✅ Advanced analysis complete!');
  console.log('\n💡 These features can be used for:');
  console.log('  - Building sophisticated trading strategies');
  console.log('  - Risk management and portfolio optimization');
  console.log('  - Machine learning model features');
  console.log('  - Market regime identification');
  console.log('  - Microstructure analysis');
}

main().catch(console.error);
