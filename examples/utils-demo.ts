/**
 * Utils package demonstration
 * Shows math, statistics, and time utilities
 */

import { YahooAdapter } from '@meridianalgo/data';
import { MathUtils, StatUtils, TimeUtils } from '@meridianalgo/utils';

async function main() {
  console.log('🔧 MeridianAlgo Utils Package Demo\n');
  
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
  
  const prices = bars.map(b => b.c);
  
  // 1. Math Utilities
  console.log('📐 Math Utilities');
  console.log('=================');
  console.log('Mean Return:', (MathUtils.mean(returns) * 100).toFixed(4) + '%');
  console.log('Std Dev:', (MathUtils.std(returns) * 100).toFixed(4) + '%');
  console.log('Median Return:', (MathUtils.median(returns) * 100).toFixed(4) + '%');
  console.log('Skewness:', MathUtils.skewness(returns).toFixed(4));
  console.log('Kurtosis:', MathUtils.kurtosis(returns).toFixed(4));
  console.log('25th Percentile:', (MathUtils.percentile(returns, 0.25) * 100).toFixed(4) + '%');
  console.log('75th Percentile:', (MathUtils.percentile(returns, 0.75) * 100).toFixed(4) + '%');
  console.log();
  
  // Correlation with lagged returns
  const laggedReturns = returns.slice(0, -1);
  const currentReturns = returns.slice(1);
  const autocorr = MathUtils.correlation(laggedReturns, currentReturns);
  console.log('Autocorrelation (lag 1):', autocorr.toFixed(4));
  console.log();
  
  // Cumulative returns
  const cumReturns = MathUtils.cumsum(returns);
  console.log('Cumulative Return:', (cumReturns[cumReturns.length - 1] * 100).toFixed(2) + '%');
  console.log();
  
  // 2. Statistical Tests
  console.log('📊 Statistical Tests');
  console.log('====================');
  
  // Normality test
  const jb = StatUtils.jarqueBera(returns);
  console.log('Jarque-Bera Test:', jb.toFixed(4));
  console.log('  (Higher values indicate non-normality)');
  console.log();
  
  // Stationarity test
  const adf = StatUtils.adfTest(prices, 1);
  console.log('ADF Test Statistic:', adf.toFixed(4));
  console.log('  (More negative = more stationary)');
  console.log();
  
  // Split data for t-test
  const midpoint = Math.floor(returns.length / 2);
  const firstHalf = returns.slice(0, midpoint);
  const secondHalf = returns.slice(midpoint);
  
  const tStat = StatUtils.tTest(firstHalf, secondHalf);
  console.log('T-Test (first vs second half):', tStat.toFixed(4));
  console.log('  (Tests if means are different)');
  console.log();
  
  // Normal distribution
  const zScore = (returns[returns.length - 1] - MathUtils.mean(returns)) / MathUtils.std(returns);
  const prob = StatUtils.normalCDF(zScore);
  console.log('Last Return Z-Score:', zScore.toFixed(4));
  console.log('Cumulative Probability:', (prob * 100).toFixed(2) + '%');
  console.log();
  
  // Bootstrap confidence interval
  console.log('Bootstrap Confidence Interval (mean):');
  const bootstrap = StatUtils.bootstrap(
    returns,
    (sample) => MathUtils.mean(sample),
    1000,
    0.95
  );
  console.log('  Lower:', (bootstrap.lower * 100).toFixed(4) + '%');
  console.log('  Mean:', (bootstrap.mean * 100).toFixed(4) + '%');
  console.log('  Upper:', (bootstrap.upper * 100).toFixed(4) + '%');
  console.log();
  
  // 3. Time Utilities
  console.log('⏰ Time Utilities');
  console.log('=================');
  
  const now = new Date();
  console.log('Current Time:', now.toISOString());
  console.log('Is Market Open?:', TimeUtils.isMarketOpen(now));
  console.log('Next Market Open:', TimeUtils.nextMarketOpen(now).toISOString());
  console.log();
  
  // Trading days
  const start = new Date('2023-01-01');
  const end = new Date('2023-12-31');
  const tradingDays = TimeUtils.tradingDays(start, end);
  console.log('Trading Days in 2023:', tradingDays);
  console.log('Calendar Days in 2023:', 365);
  console.log('Trading Day Percentage:', ((tradingDays / 365) * 100).toFixed(2) + '%');
  console.log();
  
  // Holiday detection
  const holidays = [
    new Date('2023-01-01'), // New Year
    new Date('2023-07-04'), // Independence Day
    new Date('2023-12-25')  // Christmas
  ];
  
  console.log('Holiday Detection:');
  holidays.forEach(date => {
    const isHoliday = TimeUtils.isHoliday(date);
    console.log(`  ${TimeUtils.formatDate(date)}: ${isHoliday ? 'Holiday' : 'Trading Day'}`);
  });
  console.log();
  
  // Resampling
  console.log('Data Resampling:');
  console.log('  Original bars (1d):', bars.length);
  
  // Note: Resampling to larger timeframe requires intraday data
  // This is just a demonstration of the API
  console.log('  Resample function available for intraday data');
  console.log();
  
  // Date arithmetic
  const today = new Date('2023-06-15');
  const nextWeek = TimeUtils.addDays(today, 7);
  const next5TradingDays = TimeUtils.addTradingDays(today, 5);
  
  console.log('Date Arithmetic:');
  console.log('  Today:', TimeUtils.formatDate(today));
  console.log('  +7 calendar days:', TimeUtils.formatDate(nextWeek));
  console.log('  +5 trading days:', TimeUtils.formatDate(next5TradingDays));
  console.log();
  
  // 4. Practical Applications
  console.log('💡 Practical Applications');
  console.log('=========================');
  
  // Annualized metrics
  const annualReturn = MathUtils.mean(returns) * 252;
  const annualVol = MathUtils.std(returns) * Math.sqrt(252);
  const sharpe = annualReturn / annualVol;
  
  console.log('Annualized Metrics:');
  console.log('  Return:', (annualReturn * 100).toFixed(2) + '%');
  console.log('  Volatility:', (annualVol * 100).toFixed(2) + '%');
  console.log('  Sharpe Ratio:', sharpe.toFixed(2));
  console.log();
  
  // Value at Risk
  const var95 = MathUtils.percentile(returns, 0.05);
  const var99 = MathUtils.percentile(returns, 0.01);
  
  console.log('Value at Risk:');
  console.log('  95% VaR:', (var95 * 100).toFixed(2) + '%');
  console.log('  99% VaR:', (var99 * 100).toFixed(2) + '%');
  console.log();
  
  // Drawdown calculation
  const cumPrices = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    cumPrices.push(cumPrices[i - 1] * (1 + returns[i - 1]));
  }
  
  let maxDrawdown = 0;
  let peak = cumPrices[0];
  
  for (const price of cumPrices) {
    if (price > peak) peak = price;
    const drawdown = (peak - price) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  console.log('Maximum Drawdown:', (maxDrawdown * 100).toFixed(2) + '%');
  console.log();
  
  // Distribution analysis
  const positiveReturns = returns.filter(r => r > 0).length;
  const negativeReturns = returns.filter(r => r < 0).length;
  const winRate = positiveReturns / returns.length;
  
  console.log('Distribution Analysis:');
  console.log('  Positive Days:', positiveReturns);
  console.log('  Negative Days:', negativeReturns);
  console.log('  Win Rate:', (winRate * 100).toFixed(2) + '%');
  console.log('  Avg Positive Return:', (MathUtils.mean(returns.filter(r => r > 0)) * 100).toFixed(4) + '%');
  console.log('  Avg Negative Return:', (MathUtils.mean(returns.filter(r => r < 0)) * 100).toFixed(4) + '%');
  console.log();
  
  console.log('✅ Utils demo complete!');
  console.log('\n💡 These utilities are essential for:');
  console.log('  - Statistical analysis');
  console.log('  - Risk management');
  console.log('  - Performance measurement');
  console.log('  - Data preprocessing');
  console.log('  - Time series analysis');
}

main().catch(console.error);
