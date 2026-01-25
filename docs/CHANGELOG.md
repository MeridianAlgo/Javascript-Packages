# Changelog

All notable changes to the **MeridianAlgo** project will be documented in this file.

## [4.0.0] - 2026-01-25

### Added
- **Complete Framework Consolidation**: Merged multiple sub-packages into a single, unified `meridianalgo` package for better developer experience and performance.
- **Advanced Quantitative Signals**: Added support for Hurst Exponent, Fractional Differencing, and Ornstein-Uhlenbeck processes.
- **Machine Learning Integration**: Added Kalman Filter and Hidden Markov Models for regime detection.
- **Enhanced Portfolio Optimization**: Support for Black-Litterman and Risk Parity allocation models.
- **New Data Adapters**: Unified adapters for Yahoo Finance, Binance, Alpaca, and Polygon.
- **Institutional Risk Metrics**: Added Expected Shortfall (CVaR) and Stress Testing capabilities.

### Changed
- **API Overhaul**: Streamlined imports and exported all core functionality from the root package.
- **Performance Improvements**: Optimized indicators for large-scale time-series processing.
- **New Documentation**: Completely rewritten documentation including Quick Start, API Reference, and Mathematical Foundations.

### Fixed
- Fixed memory leakage issues in the backtesting engine for very long simulations.
- Corrected bias in the standard deviation calculation within the `bollinger` bands indicator.

---

## [3.5.0] - 2025-11-12
- Last release before the v4.0.0 consolidation.
- Improved Binance data fetcher stability.
- Added basic Sharpe Ratio calculation to the engine.
