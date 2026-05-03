# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.2.0] - 2026-05-02

### Added
- **Options module** (`src/options/`):
  - `blackScholesPrice` for European call/put with continuous dividend yield.
  - `blackScholesGreeks` — delta, gamma, theta, vega, rho.
  - `putCallParity` deviation check.
  - `impliedVolatility` (Newton-Raphson with Brent fallback), plus standalone `impliedVolNewton` / `impliedVolBrent`.
  - `OptionChain` class — strikes × expiries grid with chained `computePrices`/`computeImpliedVols`/`computeGreeks`.
- **Stochastic models** (`src/stochastic/`):
  - Seeded PRNG (Mulberry32 + Box-Muller).
  - `GBM` with antithetic variates and terminal-only fast path.
  - `Heston` stochastic volatility (full-truncation Euler).
  - `MertonJump` jump-diffusion.
  - `CIR` interest-rate / variance with closed-form bond pricing.
  - `MonteCarloEngine` — generic engine with optional control variates and 95% CI.
- 25 new tests (115 total passing).
- `docs/OPTIONS.md` reference.

## [3.1.0] - 2026-05-02

### Added
- **Finance module (`src/finance/`)** with TVM and bond analytics.
- **TVM functions** (Excel-compatible): `fv`, `pv`, `pmt`, `nper`, `ipmt`, `ppmt`, `rate`, `npv`, `irr`, `mirr`, `cagr`, `compoundInterest`, `discountFactor`, `amortizationSchedule`.
- **Bond pricing**: `cleanPrice`, `dirtyPrice`, `accruedInterest`, `yieldToMaturity`, `macaulayDuration`, `modifiedDuration`, `convexity`, `dv01`, `priceChangeApprox`.
- 24 new tests (90 total passing).
- `docs/FINANCE.md` reference.

### Removed
- Stale `test-install/` directory.
- Duplicate `pnpm-lock.yaml` (kept `package-lock.json`).

### Notes
This is **Phase 1** of a multi-phase expansion. Subsequent minor releases will add: Black-Scholes + stochastic models (3.2), yield curves + credit (3.3), risk/vol upgrade (3.4), execution algos + microstructure (3.5), HRP/Kelly/factor models (3.6), candlestick patterns + advanced indicators (3.7), ML + regime detection (3.8), Deno/Bun/UMD targets (3.9).

## [3.0.0] - 2026-04-21

### Added
- Completely rewritten professional README with 9+ runnable code examples covering indicators, advanced quant math, risk metrics, portfolio optimization, strategies, parameter search, plugins, and CLI usage.
- Expanded documentation index linking every guide under `docs/`.
- Performance notes and benchmark guidance.
- Capability matrix and module map for faster discovery.

### Changed
- Major version bump to 3.0.0 signalling the unified single-package architecture is stable and production-ready on npm.
- README restructured with badges, capability matrix, module map, and clear API import surface.
- CLI and plugin extension points documented with concrete adapter examples.

### Fixed
- README code snippets updated to match current public API (`TimeBasedEngine`, `Indicators`, `RiskPerformanceMetrics`, `StressTesting`, `MeanVarianceOptimizer`, `BlackLittermanModel`, `RiskParityOptimizer`, `GridSearchOptimizer`).

## [4.0.0] - 2026-01-25

### Added
- Advanced Quantitative Indicators: Hurst Exponent, Fractional Differencing, Ornstein-Uhlenbeck (OU) process estimation.
- Kalman Filter implementation for signal smoothing and state estimation.
- Black-Litterman Portfolio Optimization model.
- Unified single-package architecture for streamlined usage and improved performance.
- Automated CI/CD workflow with Node 22 support.

### Changed
- **Major Structure Reductions**: Consolidated 12 independent packages into a single unified meridianalgo package.
- Migrated all source code from individual packages/*/src to root src/.
- Updated all internal imports to relative paths.
- Rebranded as meridianalgo (removing @meridianalgo/ scope for simplicity in the unified version).
- Improved Technical Indicators with consistent NaN padding and robust empty-array handling.

### Fixed
- Fixed Bollinger Bands calculation errors where bands were misaligned with the middle line.
- Corrected HMM regime detection crash on short datasets.
- Adjusted risk metrics conventions to match industry standards (negative drawdowns).

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
