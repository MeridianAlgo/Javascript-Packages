/**
 * Simple package test - Tests core functionality
 */

import { Indicators } from './src/indicators';
import { trendFollowing, meanReversion } from './src/strategies';
import { StrategyComposer } from './src/strategies/composer';
import { PositionSizer } from './src/strategies/position-sizer';
import { RiskMetrics } from './src/risk';
import { PerformanceMetrics } from './src/risk/performance';
import { Bar } from './src/core';

console.log('🧪 Testing MeridianAlgo Package...\n');

// Test 1: Technical Indicators
console.log('📊 Test 1: Technical Indicators');
const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i / 5) * 10 + i * 0.1);

const sma = Indicators.sma(prices, 5);
console.log('✅ SMA:', sma.slice(-3).map(v => v.toFixed(2)));

const ema = Indicators.ema(prices, 5);
console.log('✅ EMA:', ema.slice(-3).map(v => v.toFixed(2)));

const rsi = Indicators.rsi(prices, 14);
console.log('✅ RSI:', rsi.slice(-3).map(v => v.toFixed(2)));

const macd = Indicators.macd(prices);
console.log('✅ MACD:', macd.macd.slice(-1)[0]?.toFixed(2));

// Test 2: Risk Metrics
console.log('\n📉 Test 2: Risk Metrics');
const returns = [0.01, 0.02, -0.01, 0.03, -0.02, 0.015, 0.025, -0.015, 0.02, 0.01];

const var95 = RiskMetrics.var(returns, 0.95);
console.log('✅ VaR (95%):', (var95 * 100).toFixed(2) + '%');

const cvar95 = RiskMetrics.cvar(returns, 0.95);
console.log('✅ CVaR (95%):', (cvar95 * 100).toFixed(2) + '%');

const sharpe = PerformanceMetrics.sharpeRatio(returns);
console.log('✅ Sharpe Ratio:', sharpe.toFixed(4));

// Test 3: Strategies
console.log('\n🎯 Test 3: Strategies');
const bars: Bar[] = Array.from({ length: 50 }, (_, i) => ({
  t: new Date(Date.now() + i * 86400000),
  o: 100 + Math.sin(i / 5) * 10,
  h: 105 + Math.sin(i / 5) * 10,
  l: 95 + Math.sin(i / 5) * 10,
  c: 100 + Math.sin(i / 5) * 10,
  v: 1000000,
  symbol: 'TEST'
}));

const strategy1 = trendFollowing({ fastPeriod: 5, slowPeriod: 10 });
const strategy2 = meanReversion({ period: 10, stdDev: 2 });

const blended = StrategyComposer.blend([strategy1, strategy2], [0.6, 0.4]);
blended.init(bars.slice(0, 20));

const signal = blended.next(bars[20]);
console.log('✅ Blended strategy signal:', signal?.value.toFixed(2));

// Test 4: Position Sizing
console.log('\n💰 Test 4: Position Sizing');
const testSignal = { t: new Date(), value: 1 };

const kellySize = PositionSizer.kelly(testSignal, 0.6, 2, 1);
console.log('✅ Kelly position size:', kellySize.toFixed(4));

console.log('\n🎉 All tests passed!');
