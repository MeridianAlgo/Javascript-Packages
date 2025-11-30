# MeridianAlgo.js

[![NPM Version](https://img.shields.io/npm/v/@meridianalgo/core.svg)](https://www.npmjs.com/package/@meridianalgo/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/workflow/status/MeridianAlgo/Javascript-Packages/CI)](https://github.com/MeridianAlgo/Javascript-Packages/actions)

A professional-grade quantitative finance framework for JavaScript and TypeScript, designed specifically for quantitative developers, researchers, and algorithmic traders.

## Overview

MeridianAlgo is a comprehensive, modular quantitative finance framework that provides institutional-quality tools for algorithmic trading, quantitative research, and financial analysis. Built with TypeScript, it offers a complete suite of packages covering data ingestion, technical analysis, backtesting, risk management, portfolio optimization, machine learning, and execution.

**IMPORTANT**: Please read the [DISCLAIMER](DISCLAIMER.md) before using this software. This framework is provided for educational and research purposes only.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Usage Examples](#usage-examples)
- [Documentation](#documentation)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

```bash
# Install dependencies
npm install -g pnpm
pnpm install

# Build all packages
pnpm build

# Run examples
pnpm example:basic      # Basic backtest
pnpm example:advanced   # Advanced features
pnpm example:utils      # Utilities demo
```

## Installation

### For End Users

Install individual packages as needed:

```bash
# Core packages
npm install @meridianalgo/core @meridianalgo/indicators @meridianalgo/data

# Strategy and backtesting
npm install @meridianalgo/strategies @meridianalgo/backtest

# Risk and portfolio management
npm install @meridianalgo/risk @meridianalgo/portfolio

# Machine learning
npm install @meridianalgo/models

# Live execution
npm install @meridianalgo/execution

# Utilities
npm install @meridianalgo/utils @meridianalgo/cli
```

### For Contributors

```bash
# Clone the repository
git clone https://github.com/MeridianAlgo/Javascript-Packages.git
cd Javascript-Packages

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Key Features

### Technical Indicators (100+)

**Classic Indicators**
- Moving Averages: SMA, EMA, WMA, DEMA, TEMA, HMA
- Momentum: RSI, MACD, Stochastic, Williams %R, CCI, ROC
- Volatility: Bollinger Bands, ATR, Keltner Channels, Donchian Channels
- Volume: OBV, MFI, VWAP, Volume Profile
- Trend: ADX, Aroon, Parabolic SAR, Supertrend

**Advanced Indicators**
- Volatility Models: GARCH, EWMA, Realized Volatility, Parkinson, Garman-Klass
- Regime Detection: Hidden Markov Models (HMM), Change Point Detection
- Market Microstructure: VPIN, Order Imbalance, Kyle's Lambda, Bid-Ask Spread Analysis
- Feature Engineering: PCA, Lagged Features, Rolling Statistics, Cross-sectional Ranks
- Seasonality: Day-of-week Effects, Month-end Effects, Holiday Analysis

### Data Management

**Supported Data Sources**
- Yahoo Finance (fully implemented with caching)
- Polygon.io (with rate limiting and WebSocket support)
- Binance (REST and WebSocket streaming)
- Alpaca (paper and live trading integration)
- Extensible adapter pattern for custom data sources

**Data Quality**
- Automated quality validation and gap detection
- Corporate action handling (splits, dividends)
- Missing data interpolation and normalization
- Multi-timeframe resampling
- Efficient caching mechanisms

### Trading Strategies

**Pre-built Strategy Templates**
- Trend Following (moving average crossovers, breakouts)
- Mean Reversion (Bollinger Band, RSI-based)
- Pairs Trading (cointegration-based statistical arbitrage)
- Momentum (relative strength, time-series momentum)

**Strategy Composition**
- Blend multiple strategies with custom weights
- Voting mechanisms for signal aggregation
- Regime-based strategy gating
- Dynamic position sizing (Kelly Criterion, Volatility Targeting, Drawdown-aware)

### Backtesting Engine

**Engine Types**
- Time-based backtesting for bar-by-bar simulation
- Event-driven architecture for tick-level precision
- Walk-forward analysis for out-of-sample validation
- Multi-scenario testing for robustness checks

**Realistic Simulation**
- Configurable commission models (fixed, percentage, tiered)
- Slippage modeling (fixed, volume-based, volatility-based)
- Borrow fees for short positions
- Corporate action adjustments
- Margin and leverage constraints

### Risk Management

**Risk Metrics**
- Value at Risk (VaR): Historical, Parametric, Monte Carlo
- Conditional Value at Risk (CVaR/Expected Shortfall)
- Maximum Drawdown and Drawdown Duration
- Volatility (realized, implied, conditional)
- Beta, Correlation, and Tracking Error

**Performance Metrics**
- Sharpe Ratio, Sortino Ratio, Calmar Ratio
- Information Ratio, Treynor Ratio
- Win Rate, Profit Factor, Payoff Ratio
- Risk-adjusted returns and attribution analysis

**Risk Monitoring**
- Real-time position monitoring
- Automated alert system
- Stress testing (scenario-based, historical, Monte Carlo)
- Performance attribution (Brinson model, factor exposure)
- Comprehensive reporting (PDF/HTML tear sheets)

### Portfolio Optimization

**Optimization Methods**
- Mean-Variance Optimization (Markowitz)
- Black-Litterman Model (incorporating views)
- Risk Parity (equal risk contribution)
- Hierarchical Risk Parity (HRP)
- Minimum Variance, Maximum Sharpe, Maximum Diversification

**Constraint Handling**
- Weight constraints (min/max per asset)
- Long-only or long-short portfolios
- Leverage limits
- Sector and factor exposure limits
- Turnover constraints

**Robustness Techniques**
- Covariance shrinkage (Ledoit-Wolf)
- Resampled efficient frontier
- Robust optimization
- Multi-objective optimization

### Machine Learning

**Supported Models**
- Tree-based: Random Forest, Gradient Boosting (XGBoost-style)
- Neural Networks: Feedforward, LSTM, GRU
- Time Series: ARIMA, VAR, State-Space Models, Kalman Filter
- Ensemble methods and model stacking

**ML Infrastructure**
- Hyperparameter tuning (Grid Search, Random Search, Bayesian Optimization)
- Cross-validation with time-series splits
- Feature selection and importance analysis
- Online learning with concept drift detection
- AutoML for automated model selection
- Labeling methods (Triple-Barrier, Meta-labeling)

### Execution

**Trading Modes**
- Paper trading with realistic simulation
- Live trading via Alpaca API
- Backtesting mode for historical analysis

**Order Management**
- Market, Limit, Stop, Stop-Limit orders
- Bracket orders (with take-profit and stop-loss)
- Time-in-force options (DAY, GTC, IOC, FOK)
- Pre-trade risk checks
- Smart order routing
- Position and order tracking

**Compliance**
- Comprehensive audit logging
- Trade compliance checks
- Risk limit enforcement
- Regulatory reporting support

### Developer Tools

**Command-Line Interface**
- Project initialization and scaffolding
- Automated backtesting workflows
- Parameter optimization utilities
- Live trading deployment
- Report generation

**Utilities**
- Mathematical functions (statistics, linear algebra)
- Time-series utilities (resampling, alignment)
- Market calendar (trading days, holidays)
- Logging and monitoring infrastructure

## Architecture

MeridianAlgo is built as a monorepo with independent, composable packages:

```
meridianalgo-js/
├── packages/
│   ├── core/           # Core types, interfaces, and plugin system
│   ├── indicators/     # 100+ technical indicators
│   ├── data/           # Data adapters and management
│   ├── strategies/     # Trading strategy templates
│   ├── backtest/       # Backtesting engines
│   ├── risk/           # Risk metrics and monitoring
│   ├── portfolio/      # Portfolio optimization
│   ├── models/         # Machine learning models
│   ├── execution/      # Order execution and management
│   ├── optimize/       # Parameter optimization
│   ├── visualize/      # Charting and visualization
│   ├── pipeline/       # Workflow orchestration
│   ├── compliance/     # Audit and compliance
│   ├── cli/            # Command-line tools
│   └── utils/          # Shared utilities
├── examples/           # Example scripts and tutorials
├── docs/               # Comprehensive documentation
└── tests/              # Integration tests
```

### Design Principles

- **Modularity**: Each package is independently usable
- **Type Safety**: Full TypeScript support with strict typing
- **Extensibility**: Plugin architecture for custom components
- **Performance**: Optimized for large-scale data processing
- **Testing**: Comprehensive test coverage
- **Documentation**: Extensive API documentation and examples

## Usage Examples

### Basic Backtest

```typescript
import { YahooAdapter } from '@meridianalgo/data';
import { trendFollowing } from '@meridianalgo/strategies';
import { TimeBasedEngine } from '@meridianalgo/backtest';

async function runBacktest() {
  // Fetch historical data
  const yahoo = new YahooAdapter();
  const bars = await yahoo.ohlcv('AAPL', {
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1d'
  });

  // Create a trend-following strategy
  const strategy = trendFollowing({
    fastPeriod: 10,
    slowPeriod: 30,
    maType: 'ema'
  });

  // Run backtest
  const engine = new TimeBasedEngine({
    strategy,
    data: bars,
    initialCash: 100000
  });

  const result = await engine.run();

  // Display results
  console.log('Total Return:', (result.metrics.totalReturn * 100).toFixed(2) + '%');
  console.log('Sharpe Ratio:', result.metrics.sharpeRatio.toFixed(2));
  console.log('Max Drawdown:', (result.metrics.maxDrawdown * 100).toFixed(2) + '%');
  console.log('Win Rate:', (result.metrics.winRate * 100).toFixed(2) + '%');
}

runBacktest();
```

### Advanced Indicators

```typescript
import { YahooAdapter } from '@meridianalgo/data';
import { AdvancedVolatilityIndicators, RegimeIndicators } from '@meridianalgo/indicators';

async function analyzeVolatility() {
  const yahoo = new YahooAdapter();
  const bars = await yahoo.ohlcv('SPY', {
    start: '2023-01-01',
    end: '2023-12-31',
    interval: '1d'
  });

  // Calculate returns
  const returns = bars.slice(1).map((bar, i) => 
    (bar.c - bars[i].c) / bars[i].c
  );

  // GARCH volatility model
  const garch = AdvancedVolatilityIndicators.garch(returns);
  console.log('Current Volatility:', garch.volatility[garch.volatility.length - 1]);

  // Regime detection with HMM
  const regimes = RegimeIndicators.hmm(returns, 2);
  console.log('Current Regime:', regimes.regimes[regimes.regimes.length - 1]);
}

analyzeVolatility();
```

### Portfolio Optimization

```typescript
import { MeanVarianceOptimizer } from '@meridianalgo/portfolio';
import { YahooAdapter } from '@meridianalgo/data';

async function optimizePortfolio() {
  const yahoo = new YahooAdapter();
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];
  const returns = [];

  // Fetch data for each symbol
  for (const symbol of symbols) {
    const bars = await yahoo.ohlcv(symbol, {
      start: '2023-01-01',
      end: '2023-12-31',
      interval: '1d'
    });
    
    const symbolReturns = bars.slice(1).map((bar, i) => 
      (bar.c - bars[i].c) / bars[i].c
    );
    returns.push(symbolReturns);
  }

  // Transpose returns matrix
  const returnsByDate = returns[0].map((_, i) => 
    returns.map(r => r[i])
  );

  // Optimize portfolio
  const optimizer = new MeanVarianceOptimizer();
  const result = optimizer.optimize(returnsByDate, symbols, {
    longOnly: true,
    maxWeight: 0.4
  });

  console.log('Optimal Weights:', result.weights);
  console.log('Expected Return:', result.expectedReturn);
  console.log('Expected Risk:', result.expectedRisk);
}

optimizePortfolio();
```

## Documentation

### Core Documentation

- [Quick Start Guide](docs/QUICK-START.md) - Get started in 5 minutes
- [API Reference](docs/API.md) - Complete API documentation
- [Setup Guide](docs/SETUP.md) - Installation and configuration

### Guides and Tutorials

- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Security Policy](docs/SECURITY.md) - Security guidelines and reporting
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards
- [Changelog](CHANGELOG.md) - Version history and updates

### Additional Resources

- [Examples](examples/) - Working code examples
- [Implementation Summary](docs/IMPLEMENTATION-SUMMARY.md) - Technical details
- [What's Next](docs/WHATS-NEXT.md) - Roadmap and future plans

## Development

### Building

```bash
# Build all packages
pnpm build

# Build specific package
cd packages/indicators
pnpm build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
cd packages/indicators
pnpm test

# Run tests with coverage
pnpm test --coverage
```

### Linting

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint --fix
```

### Cleaning

```bash
# Clean build artifacts
pnpm clean
```

## Package Overview

| Package | Description | Version | Status |
|---------|-------------|---------|--------|
| [@meridianalgo/core](packages/core) | Core types and plugin system | 2.0.0 | Stable |
| [@meridianalgo/indicators](packages/indicators) | 100+ technical indicators | 2.0.0 | Stable |
| [@meridianalgo/data](packages/data) | Data adapters and management | 2.0.0 | Stable |
| [@meridianalgo/strategies](packages/strategies) | Trading strategy templates | 2.0.0 | Stable |
| [@meridianalgo/backtest](packages/backtest) | Backtesting engines | 2.0.0 | Stable |
| [@meridianalgo/risk](packages/risk) | Risk metrics and monitoring | 2.0.0 | Stable |
| [@meridianalgo/portfolio](packages/portfolio) | Portfolio optimization | 2.0.0 | Stable |
| [@meridianalgo/models](packages/models) | Machine learning models | 2.0.0 | Stable |
| [@meridianalgo/execution](packages/execution) | Order execution | 2.0.0 | Stable |
| [@meridianalgo/optimize](packages/optimize) | Parameter optimization | 2.0.0 | Stable |
| [@meridianalgo/utils](packages/utils) | Shared utilities | 2.0.0 | Stable |
| [@meridianalgo/cli](packages/cli) | Command-line tools | 2.0.0 | Stable |

## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

### Contribution Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests and documentation
4. Ensure all tests pass (`pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Areas for Contribution

- New technical indicators
- Additional data adapters
- Strategy templates
- Documentation improvements
- Bug fixes and performance optimizations
- Example scripts and tutorials

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This software is provided for educational and research purposes only. Trading and investing in financial markets involves substantial risk of loss. Past performance is not indicative of future results. Please read the full [DISCLAIMER](DISCLAIMER.md) before using this software.

## Acknowledgments

MeridianAlgo is built with modern TypeScript best practices and inspired by leading quantitative finance frameworks including QuantLib, Zipline, and Backtrader.

## Support

- **Documentation**: Comprehensive guides in the `docs/` folder
- **Examples**: Working examples in the `examples/` folder
- **Issues**: [GitHub Issues](https://github.com/MeridianAlgo/Javascript-Packages/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MeridianAlgo/Javascript-Packages/discussions)

## Citation

If you use MeridianAlgo in your research, please cite:

```bibtex
@software{meridianalgo2025,
  title = {MeridianAlgo: A Quantitative Finance Framework for JavaScript/TypeScript},
  author = {Meridian Algorithmic Research Team},
  year = {2025},
  version = {2.0.0},
  url = {https://github.com/MeridianAlgo/Javascript-Packages}
}
```

---

**MeridianAlgo** - Professional quantitative finance tools for JavaScript/TypeScript

Copyright (c) 2025 Meridian Algorithmic Research Team
