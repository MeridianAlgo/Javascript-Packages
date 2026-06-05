# MeridianAlgo Documentation

Welcome to the official documentation for **MeridianAlgo**, a professional-grade quantitative finance framework for JavaScript and TypeScript.

## Getting Started

If you are new to MeridianAlgo, start here:

- **[Getting Started](./GETTING-STARTED.md)** — orientation and first steps.
- **[Quick Start](./QUICK-START.md)** — install and run your first backtest in minutes.
- **[Setup & Development](./SETUP.md)** — environment setup for developers and contributors.
- **[API Reference](./API.md)** — comprehensive reference for all modules, classes, and methods.

## Indicators & Strategies

- **[Indicators Catalog](./INDICATORS.md)** — 100+ classic and advanced technical indicators.
- **[Candlestick Patterns](./INDICATORS-PATTERNS.md)** — pattern detectors and the `detectAllPatterns` aggregator.
- **[Streaming Indicators](./STREAMING.md)** — O(1)-per-tick incremental SMA/EMA/RSI/MACD/Bollinger for live feeds.
- **[Strategies Guide](./STRATEGIES.md)** — mean-reversion, momentum, trend-following, pairs, composer.
- **[Backtesting](./BACKTEST.md)** — the event-driven `TimeBasedEngine` and cost models.
- **[Parameter Optimization](./OPTIMIZE.md)** — grid and random search.

## Risk, Portfolio & Performance

- **[Risk Management](./RISK-MANAGEMENT.md)** — VaR/CVaR, drawdown, Sharpe/Sortino/Calmar, and more.
- **[Volatility & Tail Risk](./VOL-RISK.md)** — Cornish-Fisher VaR, modified Expected Shortfall, Adjusted Sharpe, tail ratio, drawdown analytics.
- **[GARCH](./GARCH.md)** — GARCH(1,1), EGARCH, GJR-GARCH volatility models.
- **[Portfolio Optimization](./PORTFOLIO.md)** — mean-variance, Black-Litterman, risk-parity, HRP, Kelly.
- **[Performance Attribution](./PORTFOLIO-ATTRIBUTION.md)** — Brinson, CAPM, Fama-French, CPPI/TIPP.

## Derivatives & Fixed Income

- **[Options & Greeks](./OPTIONS.md)** — Black-Scholes, implied vol, full and higher-order Greeks, option chains.
- **[Stochastic Models](./STOCHASTIC.md)** — GBM, Heston, CIR, Merton jump-diffusion, Monte Carlo.
- **[Fixed Income](./FINANCE.md)** — time value of money, bond pricing, duration, convexity.
- **[Yield Curves](./CURVES.md)** — bootstrapping and Nelson-Siegel fitting.
- **[Credit](./CREDIT.md)** — Merton structural model, CDS, Z-spread, expected loss.

## Execution, Data & Machine Learning

- **[Execution Algorithms](./EXECUTION.md)** — VWAP, TWAP, POV, Almgren-Chriss.
- **[Microstructure](./MICROSTRUCTURE.md)** — order book, spread estimators, market impact.
- **[Machine Learning](./ML.md)** — LSTM/GRU, walk-forward CV, HMM regime detection, feature engineering.
- **[Time-Series Models](./MODELS.md)** — ARIMA, linear regression, state-space models.
- **[Data Adapters](./DATA.md)** — Yahoo, Binance, Alpaca, Polygon, and custom adapters.

## Reference

- **[Core](./CORE.md)** — types, config, logger, plugin registry, errors.
- **[Utilities](./UTILS.md)** — math, statistics, and time helpers.
- **[Types](./TYPES.md)** — shared TypeScript type definitions.
- **[CLI](./CLI.md)** — the `meridianalgo` command-line interface.

## Project Information

- **[Contributing](../CONTRIBUTING.md)** — how to help improve the framework.
- **[Changelog](../CHANGELOG.md)** — recent updates and version history.
- **[Security Policy](./SECURITY.md)** — how to report vulnerabilities.
- **[Future Roadmap](./WHATS-NEXT.md)** — what we are building next.
- **[Disclaimer](./DISCLAIMER.md)** — important usage and risk notices.

---

*Copyright (c) 2026 Meridian Algorithmic Research Team. Licensed under the MIT License.*
