# API Reference

This document provides a comprehensive overview of the modules and classes available in MeridianAlgo.

## Table of Contents
- [Core](#core)
- [Indicators](#indicators)
- [Data Adapters](#data-adapters)
- [Backtesting](#backtesting)
- [Risk Management](#risk-management)
- [Portfolio Optimization](#portfolio-optimization)
- [Technical Utilities](#utilities)

---

## Core
The `core` module contains essential types and the plugin architecture.

- `BaseIndicator`: Interface for all technical indicators.
- `Strategy`: Interface for backtesting strategies.
- `PluginSystem`: Allows extending the framework with custom modules.

## Indicators
MeridianAlgo supports 100+ technical and quantitative indicators.

### Classic Indicators
- `sma(data, options)`: Simple Moving Average.
- `ema(data, options)`: Exponential Moving Average.
- `rsi(data, options)`: Relative Strength Index.
- `macd(data, options)`: Moving Average Convergence Divergence.
- `bollinger(data, options)`: Bollinger Bands.

### Advanced Quantitative Signals
- `hurst(data)`: Hurst Exponent for mean reversion/trending analysis.
- `fracDiff(data, d)`: Fractional Differencing to achieve stationarity.
- `vpin(data)`: Volume-Synchronized Probability of Informed Trading.
- `kalman(data)`: Adaptive state-space filtering.

### Regime Detection
- `hiddenMarkovModel(data)`: Detect market regimes (Bull/Bear/Sideways).
- `hurstRegime(data)`: Identify switching between mean-reverting and trending phases.

## Data Adapters
Fetch market data from various providers.

- `YahooAdapter`: Integration with Yahoo Finance.
- `BinanceAdapter`: Real-time and historical crypto data.
- `AlpacaAdapter`: Professional-grade US equities data.
- `PolygonAdapter`: High-fidelity market data via Polygon.io.

## Backtesting
Run realistic simulations of trading strategies.

- `TimeBasedEngine`: The primary engine for historical simulations.
- `CostsModel`: Define custom commission, slippage, and spread models.
- `TimeRange`: Utility for managing simulation periods.

## Risk Management
Institutional-grade risk assessment tools.

- `PerformanceMetrics`: Calculate Sharpe, Sortino, Calmar ratios, and Max Drawdown.
- `ValueAtRisk (VaR)`: Historical, Parametric, and Monte Carlo VaR.
- `CVaR / Expected Shortfall`: Tail risk measurement.
- `StressTesting`: Simulate "Black Swan" events and historical crashes.

## Portfolio Optimization
Modern Portfolio Theory and beyond.

- `MeanVarianceOptimizer`: Classic Markowitz efficient frontier.
- `BlackLittermanModel`: Combine market equilibrium with investor views.
- `RiskParityOptimizer`: Allocate capital based on risk contribution.

## Utilities
Mathematical and statistical helper functions.

- `MathUtils`: Advanced math operations.
- `StatUtils`: Mean, variance, skewness, kurtosis, and correlation matrices.
- `TimeUtils`: Financial calendar and timestamp conversions.
