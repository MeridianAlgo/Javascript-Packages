// Core
export * from './core';

// Utils
export { MathUtils, StatUtils, TimeUtils } from './utils';

// Indicators
export * from './indicators';
export { AdvancedMath } from './indicators/advanced-math';
export { KalmanFilter } from './indicators/ml';

// Data
export * from './data';

// Strategies
export * from './strategies';

// Backtesting
export * from './backtest';

// Risk Management
export { PerformanceMetrics as RiskPerformanceMetrics } from './risk/performance';
export { StressTesting } from './risk/stress-testing';
export { PerformanceAttribution } from './risk/attribution';

// Portfolio Optimization
export { MeanVarianceOptimizer } from './portfolio/mean-variance';
export { RiskParityOptimizer } from './portfolio/risk-parity';
export { BlackLittermanModel } from './portfolio/black-litterman';

// Optimization
export { GridSearchOptimizer, RandomSearchOptimizer } from './optimize';

// Execution
export * from './execution';

// Finance (TVM, Bonds)
export * from './finance';

// Options (Black-Scholes, IV, OptionChain)
export * from './options';

// Stochastic models (GBM, Heston, Merton, CIR, Monte Carlo)
export * from './stochastic';

// CLI (not exported as class usually, but internal)
// export * from './cli';
