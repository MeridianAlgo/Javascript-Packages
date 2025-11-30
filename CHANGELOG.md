# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-10-13

### Added

#### Core Framework
- Complete monorepo architecture with 15 packages
- Plugin system for extensibility
- TypeScript support with full type definitions
- Comprehensive test coverage

#### Data Layer
- Yahoo Finance adapter (fully functional)
- Polygon.io adapter with rate limiting
- Binance adapter with WebSocket streaming
- Alpaca adapter with paper/live trading support
- Data manager with caching and quality validation
- Corporate action handling
- Gap filling and normalization

#### Indicators (100+)
- Classic indicators: SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic, ATR
- Advanced volatility: GARCH, EWMA, Realized Volatility
- Regime detection: HMM, Change Point Detection
- Microstructure: VPIN, Order Imbalance, Kyle's Lambda
- Feature engineering: PCA, Lags, Rolling Statistics
- Seasonality detection: Day-of-week, Month-end, Holiday effects

#### Strategies
- Trend Following strategy
- Mean Reversion strategy
- Pairs Trading strategy
- Momentum strategy
- Strategy composition (blend, vote, regime-gating)
- Position sizing (Kelly, Vol Target, Drawdown Aware)
- Trade rules and constraints

#### Backtesting
- Time-based backtest engine
- Event-driven backtest engine
- Realistic cost models (commission, slippage, borrow fees)
- Walk-forward analysis
- Multi-scenario testing
- Corporate action handling
- Performance metrics calculation

#### Risk Management
- VaR (Historical, Parametric, Monte Carlo)
- CVaR, Max Drawdown, Volatility
- Sharpe, Sortino, Calmar, Information Ratios
- Performance Attribution (Brinson, Factor Exposure)
- Stress Testing (scenario, historical, Monte Carlo)
- Real-time monitoring and alerts
- Reporting system (PDF/HTML tear sheets)

#### Portfolio Optimization
- Mean-Variance Optimization
- Black-Litterman
- Risk Parity
- Hierarchical Risk Parity (HRP)
- Constraint handling (min/max weights, long-only, leverage, sector limits)
- Robustness techniques (covariance shrinkage, resampled frontier)
- Multi-objective optimization

#### Machine Learning
- Random Forest, Gradient Boosting
- Neural Networks, LSTM, GRU
- ARIMA, VAR, Kalman Filter
- Hyperparameter tuning (grid search, random search, Bayesian)
- Online learning with drift detection
- Feature selection and importance
- AutoML system
- Labeling methods (triple-barrier, meta-labeling)

#### Execution
- Paper trading (fully functional)
- Live trading (Alpaca integration)
- Order Management System
- Pre-trade risk checks
- Risk limits enforcement
- Smart order routing
- Bracket orders
- Compliance logging

#### Optimization
- Grid search
- Random search
- Bayesian optimization
- Genetic algorithms
- Parallel evaluation
- Overfitting prevention
- Result visualization

#### Visualization
- Equity curves
- Drawdown charts
- Return distributions
- Correlation heatmaps
- Factor exposure charts
- Dashboard system
- Export functionality (CSV, JSON, PNG, SVG, PDF)

#### Pipeline & Workflow
- DAG execution
- Feature store with versioning
- Scheduling support (cron, event-triggered)
- State management (SQLite, PostgreSQL, file-based)
- Pipeline monitoring

#### Compliance & Reproducibility
- Audit logging
- Run management
- Artifact tracking
- Policy enforcement
- Snapshot system
- Regression testing

#### Developer Tools
- CLI for common tasks (init, backtest, optimize, live, report)
- Project templates
- Configuration validation (Zod)
- Progress reporting
- Comprehensive documentation
- Code examples

#### Utilities
- Math utilities (mean, std, correlation, percentile, skewness, kurtosis)
- Statistical tests (t-test, chi-square, ADF, Jarque-Bera, bootstrap)
- Time utilities (market hours, trading days, holidays, resampling)
- Structured logging with trace IDs

### Changed
- Migrated from single package to monorepo architecture
- Improved TypeScript type safety
- Enhanced error handling
- Optimized performance for large datasets

### Fixed
- Various bug fixes and improvements

## [1.0.0] - Previous Version

### Added
- Initial release with basic indicators
- Simple backtesting functionality
- Basic performance metrics

---

For more details, see the [documentation](docs/).
