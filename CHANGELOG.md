# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.14.0] - 2026-06-29

### Added
- **Vortex Indicator** (`vortex`): VI+/VI- trend direction and strength from up/down
  vortex movement normalized by true range. Returns `{ viPlus, viMinus }`.
- **Awesome Oscillator** (`awesomeOscillator`): SMA(5) − SMA(34) of the median price.
- **Ultimate Oscillator** (`ultimateOscillator`): Larry Williams' three-timeframe
  buying-pressure oscillator, bounded 0–100.
- **TRIX** (`trix`): 1-period rate of change of a triple-smoothed EMA, in percent.
- **Hull Moving Average** (`hullMovingAverage`): low-lag WMA-composed trend follower,
  with clean NaN warmup (no window bleeds the smoothing region).
- **Balance of Power** (`balanceOfPower`): (close−open)/(high−low), optional SMA smoothing.

All six are exported from the indicators module and pick up no new dependencies.

## [3.13.0] - 2026-06-20

### Added
- **Parabolic SAR** (`Indicators.parabolicSAR`): Stop-and-reverse indicator with configurable
  acceleration factor. Returns per-bar SAR values and trend direction (`'up'`/`'down'`).
- **True Strength Index** (`MomentumIndicators.tsi`): Double-smoothed momentum oscillator
  (long/short/signal EMA periods). Also exported as top-level `tsi` from the indicators module.
- **Accumulation/Distribution Line** (`VolumeIndicators.adLine`): Cumulative CLV-based
  volume indicator. Also exported as top-level `adLine`.

### Changed (Performance)
- `Indicators.sma`: Replaced O(n·period) nested loops with O(n) sliding-window sum.
- `Indicators.bollingerBands`: Replaced per-bar `slice` + variance loop with O(n)
  incremental sum-of-squares (no allocations inside the hot path).
- `Indicators.stochastic`, `donchianChannels`, `williamsR`: Replaced
  `Math.max/min(...spread)` with inline loops — avoids spread-operator overhead and
  argument-count limits on large arrays.
- `MomentumIndicators.cmo`: Rolling sliding-window replaces O(n·period) inner loop.
- `VolumeIndicators.vwma`, `cmf`: Sliding-window sums replace O(n·period) inner loops.

### Fixed
- **`Indicators.kama`**: Corrected per-bar Efficiency Ratio (ER) and Smoothing Constant
  (SC) computation. Previously ER and SC were computed once for the whole series using
  global min/max rather than the rolling `period`-bar window, producing incorrect values.
  KAMA now matches the standard Kaufman algorithm.

## [3.12.0] - 2026-06-04

### Added
- **Higher-order option Greeks** (`higherOrderGreeks`): vanna, charm, vomma
  (volga), veta, speed, zomma, color, ultima, dual delta and dual gamma for
  European options. All closed-form formulas are verified against finite
  differences; the time-decay Greeks (charm/color/veta) share a single calendar
  -time (`∂/∂t`) sign convention.
- **Tail-risk analytics** (`src/risk/tail-risk.ts`): `modifiedExpectedShortfall`
  (Cornish-Fisher Expected Shortfall), `adjustedSharpeRatio` (Pézier-White, which
  penalises negative skew and excess kurtosis), and `tailRatio` (right-tail vs
  left-tail magnitude).
- New Jest suites covering the higher-order Greeks (finite-difference
  cross-checks) and the tail-risk metrics.

### Fixed
- `PerformanceMetrics.calmarRatio` and `PerformanceMetrics.recoveryFactor` always
  returned `0`: they guarded with `maxDrawdown > 0` while `maxDrawdown().value` is
  negative. Both now use the drawdown magnitude (`Math.abs`). Added regression
  tests.

### Changed
- Upgraded dev tooling to resolve all known advisories (0 vulnerabilities, down
  from 10): `@typescript-eslint/*` 6 → 8, `jest`/`@jest/globals`/`@types/jest`
  29 → 30, plus patch bumps to `ts-jest`, `tsc-alias`, `@types/node`, `rimraf`.
- ESLint config now scopes `no-console` off for the CLI and test/example scripts
  (where console output is intentional) and removes residual unused imports, so
  `npm run lint` passes clean.

## [3.11.1] - 2026-05-05

### Fixed
- `ARIMAModel.predict`: Fixed `diffSeeds` order (using `unshift`) to ensure correct integration of forecasts when `d > 0`.
- `TimeUtils.addTradingDays`: Now correctly uses `isTradingDay` instead of `isMarketOpen`, ensuring holiday awareness in day addition logic.
- `tests/utils_deep_test.ts`: Updated test date to a non-holiday (Tuesday) to avoid false failures on MLK Day.

### Added
- `tests/streaming_indicators_test.ts`: Added strict assertions for SMA, EMA, and RSI streaming logic verification.
- `tests/run_all_deep_tests.ts`: Enhanced failure reporting to include `stdout`/`stderr` details when a test script fails.

## [3.11.0] - 2026-05-04

### Fixed
- `garmanKlassVolatility` now uses the correct Garman-Klass formula:
  `0.5 * ln(H/L)^2 - (2*ln(2)-1) * ln(C/O)^2` (previously yielded 0 frequently).
- `ARIMAModel.predict` now integrates differenced forecasts back to the
  original series level when `d > 0` (was returning stationary forecasts).
- `TimeUtils.tradingDays` now counts weekday/non-holiday calendar days and
  ignores intraday market hours, fixing 0-count when called with midnight dates.
  Added new `TimeUtils.isTradingDay(date)` helper.
- `Indicators.rsi` now throws `IndicatorError` (instead of silently returning
  `[]`) when input is shorter than `period + 1`, matching MACD behavior.

### Added
- Fully-implemented `meridianalgo` CLI:
  - `meridianalgo backtest` runs a real backtest via `YahooAdapter` +
    `TimeBasedEngine`, supports `--strategy trend-following|mean-reversion`,
    `--fast`, `--slow`, `--cash`, `--commission`, `--slippage`, and prints a
    JSON metrics report.
  - `meridianalgo init <name>` scaffolds a starter project with
    `package.json`, `tsconfig.json`, `index.ts`, and `README.md`. Supports
    `--template basic|strategy`.
- Module documentation: `docs/BACKTEST.md`, `CLI.md`, `CORE.md`, `CURVES.md`,
  `DATA.md`, `GARCH.md`, `MICROSTRUCTURE.md`, `MODELS.md`, `OPTIMIZE.md`,
  `PORTFOLIO.md`, `STOCHASTIC.md`, `TYPES.md`, `UTILS.md`.
- Examples: `examples/stochastic-models.ts`, `volatility-modeling.ts`,
  `yield-curve-fitting.ts`.
- Deep manual test scripts under `tests/*_deep_test.ts`.

### Changed
- Examples use relative `../src` imports instead of unresolved
  `@meridianalgo/*` aliases, so `npm run example:*` works without
  `tsconfig-paths`.
- Removed unused `paths` aliases from `tsconfig.json`.

## [3.10.0] - 2026-05-03

### Fixed (CodeQL findings)
- Removed unused vars / imports flagged by CodeQL:
  - `src/portfolio/black-litterman.ts` — `assets`, `n`, `weight`.
  - `src/portfolio/mean-variance.ts` — `portReturn`, `portRisk`.
  - `src/models/linear-regression.ts` — `n`, `m`.
  - `src/indicators/advanced-volatility.ts` — `maxIter` destructure (renamed to `_options`).
  - `src/indicators/performance.ts` — orphan `calculateCumulativeReturns`.
  - `examples/quantitative-strategies.ts` — unused `highs`, `lows`, `volumes`, `returns`, and unused imports `AdvancedVolatilityIndicators`, `FeatureEngineering`, `RiskMetrics`, `PerformanceMetrics`.
  - `examples/risk-management.ts` — unused imports `RiskMetrics`, `PerformanceMetrics`, `Indicators`.
  - `examples/advanced-features.ts` — unused `prices`.
  - `examples/ml-regime-detection.ts` — unused `logReturns`.

### Added
- README expanded with detailed examples for HRP, Kelly, Brinson attribution, factor models (CAPM/FF3/FF5), execution algorithms (VWAP/TWAP/POV/Almgren-Chriss), order-book microstructure, streaming indicators, pure-JS LSTM/GRU + HMM regime detection, and CPPI/TIPP wealth protection.
- Capability table extended to surface candlestick patterns, options pricing, fixed income, credit, and microstructure.

## [3.9.1] - 2026-05-03

### Fixed
- Lint errors blocking CI:
  - Removed unused `prevT` in `src/credit/cds.ts`, `uncond` in `src/garch/garch11.ts`, `mean()` helper in `src/portfolio/hrp.ts`.
  - `let` → `const`: `fvals` (garch), `w` (risk-budgeting), `u2` (rng), `s1`/`s2` (ml.test).
  - Removed unused `factorRegression` import from `tests/factor-models.test.ts`.
  - ESLint config now ignores `_`-prefixed unused vars (consistent with TS convention).
- Build: TypeScript can't follow `yahoo-finance2`'s ESM-only `exports` map under classic node moduleResolution. Added `src/types/yahoo-finance2.d.ts` shim covering the surface used by `YahooAdapter`.
- Replaced `!` non-null assertion in `src/portfolio/hrp.ts` recursive bisection with explicit guard.

### Added
- `tests/ml.test.ts` — expanded coverage per AI review:
  - `rollingMean`/`rollingStd`: assert NaN-padded prefix + multiple intermediate values.
  - `logReturns`: assert NaN at index 0 + second-period log return.
  - `zScore`: now also asserts std ≈ 1 (test name had claimed it).
  - `minMaxScale`: assert midpoint scales to 0.5.
  - `diff`: assert NaN prefix + each intermediate diff.
- README: active-development notice pointing to upcoming v4.0.0 milestone with guidance to pin `^3.9` for stability.

## [3.9.0] - 2026-05-03

### Fixed
- CI workflows (`.github/workflows/ci.yml`, `release.yml`): switch from pnpm to npm. The repo ships `package-lock.json`, so `actions/setup-node` was failing with "Dependencies lock file is not found". Replaced `pnpm/action-setup` + `pnpm install --no-frozen-lockfile` with `npm ci || npm install`.

### Added
- **Examples** under `examples/`:
  - `ml-regime-detection.ts` — train Gaussian HMM on synthetic two-regime returns, decode with Viterbi.
  - `walk-forward-validation.ts` — expanding-window walk-forward CV with linear model.
  - `hrp-portfolio.ts` — Hierarchical Risk Parity allocation across 5 synthetic assets.
  - `streaming-indicators.ts` — incremental SMA/EMA/RSI/MACD/Bollinger on tick stream.
  - `execution-algos.ts` — VWAP/TWAP/POV/Almgren-Chriss schedules side-by-side.

## [3.8.0] - 2026-05-03

### Added
- **Pure-JS RNN cells** (`src/ml/lstm.ts`, `src/ml/gru.ts`):
  - `LSTMCell` with `[i, f, g, o]` gate ordering, weights `Wi[4H×N]`, `Wh[4H×H]`, `b[4H]`.
  - `GRUCell` with `[r, z, n]` gate ordering, weights `Wi`, `Wh`, `bi`, `bh`.
  - Forward pass only — load pre-trained weights from Python/JAX for inference.
- **Walk-forward validation** (`src/ml/walk-forward.ts`):
  - `walkForward(X, y, cfg)` with `expanding` and `rolling` modes.
  - Per-fold MSE/MAE/R² plus combined out-of-sample predictions.
- **Feature engineering** (`src/ml/feature-engineer.ts`):
  - `lagFeatures`, `rollingMean`, `rollingStd`, `logReturns`, `simpleReturns`, `zScore`, `minMaxScale`, `diff`.
- **HMM regime detection** (`src/ml/hmm-regime.ts`):
  - `trainHMM` — Gaussian-emission Baum-Welch with scaled forward-backward.
  - `viterbi` — log-domain decoding.
- Docs: `docs/ML.md`.
- Tests: `tests/ml.test.ts` (10 tests, including 2-state regime decode >70% accuracy).

## [3.7.0] - 2026-05-03

### Added
- **Candlestick patterns** (`src/indicators/candlestick.ts`):
  - 15 detectors: doji, hammer, shooting star, bullish/bearish engulfing, morning/evening star, three white soldiers / black crows, marubozu, spinning top, piercing line, dark cloud cover, tweezer top/bottom, hanging man, plus `detectAllPatterns` aggregator.
- **Advanced indicators** (`src/indicators/advanced.ts`):
  - `ichimoku` (Tenkan/Kijun/Span A/B/Chikou with configurable displacement).
  - `supertrend` (ATR-based trend with ±1 direction).
  - `donchianChannels`, `keltnerChannels` (channels).
  - `aroon`, `choppinessIndex`, `connorsRSI`, `massIndex`, `fisherTransform`, `coppockCurve`, `dpo`, `elderRay`, `pivotPoints` (classic floor pivots).
- **Streaming API** (`src/indicators/streaming.ts`):
  - `StreamingSMA`, `StreamingEMA`, `StreamingRSI`, `StreamingMACD`, `StreamingBollinger`.
  - All implement `nextValue(x)` / `replace(x)` / `reset()` for incremental real-time use.
  - `replace()` snapshots prior state so mid-bar tick updates don't compound.
- Docs: `docs/INDICATORS-PATTERNS.md`.
- Tests: `candlestick`, `advanced-indicators`, `streaming-indicators` (227 tests pass total).

## [3.6.0] - 2026-05-03

### Added
- **Hierarchical Risk Parity** (`src/portfolio/hrp.ts`):
  - `hrpAllocate` — Lopez de Prado HRP: correlation-distance clustering + recursive bisection with inverse-variance allocation. No matrix inversion.
- **Kelly criterion** (`src/portfolio/kelly.ts`):
  - `kellyBet`, `kellyContinuous`, `kellyMultiAsset` (Σ⁻¹μ), `fractionalKelly`.
- **Brinson-Hood-Beebower attribution** (`src/risk/brinson.ts`):
  - `brinsonAttribution` — decomposes active return into allocation, selection, interaction effects.
- **Factor models** (`src/risk/factor-models.ts`):
  - OLS factor regression via Gaussian elimination on (X'X)β = X'y.
  - `capmRegression`, `famaFrench3`, `famaFrench5`, generic `factorRegression`.
- **Benchmark analytics** (`src/risk/benchmark-analytics.ts`):
  - `upCaptureRatio`, `downCaptureRatio`, `battingAverage`, `informationRatio`, `trackingError`, `activeShare` (Cremers-Petajisto).
- **CPPI / TIPP** (`src/risk/cppi.ts`):
  - `cppiStrategy` (constant floor), `tippStrategy` (ratcheting floor).
- Docs: `docs/PORTFOLIO-ATTRIBUTION.md`.
- Tests: `hrp`, `kelly`, `brinson`, `factor-models`, `benchmark-analytics`, `cppi` (199 tests pass total).

## [3.5.0] - 2026-05-03

### Added
- **Execution algorithms** (`src/execution/algorithms.ts`):
  - `vwapSchedule` — slice parent order proportional to forecasted volume profile.
  - `twapSchedule` — equal-quantity time-weighted slicing.
  - `povSchedule` — participation-of-volume scheduler.
  - `implementationShortfallSchedule` — Almgren-Chriss closed-form `x_k = X·sinh(κ(T-t))/sinh(κT)` with `κ = √(λσ²/η)`.
- **Microstructure** (`src/microstructure/`):
  - `OrderBook` — top-of-book + L2 analytics: mid, quoted/relative spread, microprice, imbalance, market-order walk.
  - Spread estimators: `effectiveSpread`, `realizedSpread`, `rollSpread`, `quotedSpread` (Roll 1984 implicit estimator from price autocovariance).
  - `squareRootImpact` — BARRA-style `c·σ·√(Q/ADV)`.
  - `almgrenChrissExpectedCost` — linear-impact expected cost + variance.
- Docs: `docs/EXECUTION.md`.
- Tests: `execution-algos`, `microstructure` (180 tests pass total).

## [3.4.0] - 2026-05-02

### Added
- **GARCH family** (`src/garch/`):
  - `fitGARCH11` — GARCH(1,1) MLE via pure-JS Nelder-Mead.
  - `fitEGARCH` — exponential GARCH with asymmetric leverage term.
  - `fitGJR` — Glosten-Jagannathan-Runkle GARCH with leverage indicator.
  - `garch11Forecast`, `garch11Variances`, `egarchVariances`, `gjrVariances`.
- **Range-based volatility estimators** (`src/indicators/range-vol.ts`):
  - `parkinsonVolatility`, `garmanKlassVolatility`, `rogersSatchellVolatility`, `yangZhangVolatility`.
  - `fitHARRV` — Corsi (2009) HAR-RV model with daily/weekly/monthly components.
- **Advanced risk metrics** (`src/risk/advanced.ts`):
  - `cornishFisherVaR` — skew/kurt-adjusted VaR.
  - `painIndex`, `drawdownSeries`, `conditionalDrawdownAtRisk`.
  - `topNDrawdowns` with start/trough/recovery indices.
  - `gainToPainRatio`.
  - `probabilisticSharpeRatio` (Bailey & Lopez de Prado).
  - `minTrackRecordLength`.
  - `sharpeConfidenceInterval` (bootstrap, deterministic seed).
  - `inverseNormalCdf` (Beasley-Springer-Moro).
- **Named stress scenarios** (`src/risk/stress-scenarios.ts`):
  - `2008-crisis`, `covid-crash`, `dot-com`, `black-monday`, `taper-tantrum`, `asian-crisis`, `lehman-week`.
  - `applyStressScenario` to portfolio exposure vectors.
- **Risk budgeting** (`src/risk/risk-budgeting.ts`):
  - `equalRiskContribution` — Spinu cyclic coordinate descent.
  - `riskBudgetingWeights` with custom budget vector.
- 33 new tests (163 total passing).
- `docs/VOL-RISK.md` reference.

## [3.3.0] - 2026-05-02

### Added
- **YieldCurve module** (`src/curves/`):
  - `YieldCurve.fit()` — Nelson-Siegel fit via tau grid + OLS.
  - `spotRate`, `discountFactor`, `forwardRate`, `forwardRateBetween`.
- **Credit module** (`src/credit/`):
  - `mertonStructural` — equity-as-call structural model with PD and distance-to-default.
  - `impliedAssetVol` — Newton-Raphson asset-vol solver.
  - `priceCDS` — premium leg, protection leg, net PV, fair spread under piecewise-constant hazard.
  - `survivalProbability`, `bootstrapHazardCurve` — par-spread bootstrapping.
  - `zSpread` — parallel curve shift solver.
  - `expectedLoss`, `portfolioExpectedLoss`, `impliedCreditSpread`, `pdFromSpread`.
- 15 new tests (130 total passing).
- `docs/CREDIT.md` reference.

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
