/**
 * Comprehensive package test
 * Tests all major features of meridianalgo
 */

import { Indicators } from './src/indicators';
import { TimeBasedEngine } from './src/backtest';
import { DataManager } from './src/data';
import { trendFollowing, meanReversion } from './src/strategies';
import { StrategyComposer } from './src/strategies/composer';
import { PositionSizer } from './src/strategies/position-sizer';
import { RiskMetrics } from './src/risk';
import { PerformanceMetrics } from './src/risk/performance';
import { Bar } from './src/core';

console.log('🧪 Testing MeridianAlgo Package...\n');

// Test 1: Technical Indicators
console.log('📊 Test 1: Technical Indicators');
try {
  const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 114, 113];
  
  const sma = Indicators.sma(prices, 5);
  console.log('✅ SMA calculated:', sma.slice(-3));
  
  const ema = Indicators.ema(prices, 5);
  console.log('✅ EMA calculated:', ema.slice(-3));
  
  const rsi = Indicators.rsi(prices, 14);
  console.log('✅ RSI calculated:', rsi.slice(-3));
  
  const macd = Indicators.macd(prices, 12, 26, 9);
  console.log('✅ MACD calculated:', {
    macd: macd.macd.slice(-1),
    signal: macd.signal.slice(-1),
    histogram: macd.histogram.slice(-1)
  });
  
  console.log('✅ All indicator tests passed!\n');
} catch (error) {
  console.error('❌ Indicator test failed:', error);
}

// Test 2: Backtesting Engine
console.log('📈 Test 2: Backtesting Engine');
try {
  const bars: Bar[] = Array.from({ length: 100 }, (_, i) => ({
    t: new Date(Date.now() + i * 86400000),
    o: 100 + Math.sin(i / 10) * 10,
    h: 105 + Math.sin(i / 10) * 10,
    l: 95 + Math.sin(i / 10) * 10,
    c: 100 + Math.sin(i / 10) * 10,
    v: 1000000,
    symbol: 'TEST'
  }));

  const strategy = trendFollowing({
    fastPeriod: 10,
    slowPeriod: 20,
    maType: 'ema'
  });

  const engine = new TimeBasedEngine({
    initialCapital: 100000,
    commission: 0.001,
    slippage: 0.0005
  });

  const results = engine.run(bars, strategy);
  
  console.log('✅ Backtest completed:', {
    finalCapital: results.finalCapital.toFixed(2),
    totalReturn: (results.totalReturn * 100).toFixed(2) + '%',
    trades: results.trades.length,
    sharpeRatio: results.sharpeRatio?.toFixed(2) || 'N/A'
  });
  console.log('✅ Backtest engine test passed!\n');
} catch (error) {
  console.error('❌ Backtest test failed:', error);
}

// Test 3: Strategy Composition
console.log('🎯 Test 3: Strategy Composition');
try {
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
  console.log('✅ Blended strategy signal:', signal);
  
  const voted = StrategyComposer.vote([strategy1, strategy2], 2);
  voted.init(bars.slice(0, 20));
  const voteSignal = voted.next(bars[20]);
  console.log('✅ Voted strategy signal:', voteSignal);
  
  console.log('✅ Strategy composition test passed!\n');
} catch (error) {
  console.error('❌ Strategy composition test failed:', error);
}

// Test 4: Position Sizing
console.log('💰 Test 4: Position Sizing');
try {
  const signal = { t: new Date(), value: 1 };
  
  const kellySize = PositionSizer.kelly(signal, 0.6, 2, 1);
  console.log('✅ Kelly position size:', kellySize.toFixed(4));
  
  const volTargetSize = PositionSizer.volTarget(signal, 0.15, 0.20, 100000);
  console.log('✅ Vol-targeted size:', volTargetSize.toFixed(2));
  
  const drawdownSize = PositionSizer.drawdownAware(signal, 0.05, 0.10, 1000);
  console.log('✅ Drawdown-aware size:', drawdownSize.toFixed(2));
  
  console.log('✅ Position sizing test passed!\n');
} catch (error) {
  console.error('❌ Position sizing test failed:', error);
}

// Test 5: Risk Metrics
console.log('📉 Test 5: Risk Metrics');
try {
  const returns = [0.01, 0.02, -0.01, 0.03, -0.02, 0.015, 0.025, -0.015, 0.02, 0.01];
  
  const var95 = RiskMetrics.var(returns, 0.95);
  console.log('✅ VaR (95%):', (var95 * 100).toFixed(2) + '%');
  
  const cvar95 = RiskMetrics.cvar(returns, 0.95);
  console.log('✅ CVaR (95%):', (cvar95 * 100).toFixed(2) + '%');
  
  const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
  const sharpe = PerformanceMetrics.sharpeRatio(returns);
  console.log('✅ Sharpe Ratio:', sharpe.toFixed(4));
  
  const sortino = PerformanceMetrics.sortinoRatio(returns);
  console.log('✅ Sortino Ratio:', sortino.toFixed(4));
  
  console.log('✅ Risk metrics test passed!\n');
} catch (error) {
  console.error('❌ Risk metrics test failed:', error);
}

// Test 6: Data Manager
console.log('📊 Test 6: Data Manager');
try {
  const adapters = new Map();
  const dataManager = new DataManager(adapters);
  console.log('✅ Data manager initialized');
  console.log('✅ Data manager test passed!\n');
} catch (error) {
  console.error('❌ Data manager test failed:', error);
}

console.log('🎉 All tests completed!');
