# Mathematical Foundations & Implementation Summary

MeridianAlgo is built on rigorous quantitative methodologies. This document summarizes the mathematical models and implementation details for the core components of the framework.

## 1. Time-Series Analysis

### Hurst Exponent ($H$)
Used to identify the memory of a time series.
- $H < 0.5$: Mean-reverting (Anti-persistent).
- $H = 0.5$: Random Walk (Geometric Brownian Motion).
- $H > 0.5$: Trending (Persistent).

We implement the Hurst Exponent using the **Rescaled Range (R/S) Analysis** method, optimized for large datasets using sliding window buffers.

### Fractional Differencing
Classic integer differencing (e.g., $d=1$) removes non-stationarity but destroys long-term memory. We implement **Fractional Differencing** using the Fixed-Window Fractional Differencing (FWFD) method, allowing for a non-integer $d$ (e.g., $0.4$) to achieve stationarity while preserving memory.

## 2. Filtering & Signal Processing

### Kalman Filter
A recursive Bayesian filter used for real-time estimation of latent states. It computes the "optimal" estimate of a system state based on noisy observations.
- **State Transition**: $\hat{x}_{k|k-1} = F_k \hat{x}_{k-1|k-1}$
- **Measurement Update**: $\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k(z_k - H_k \hat{x}_{k|k-1})$

Implemented as a highly configurable class for signal smoothing and dynamic hedge ratio estimation.

## 3. Risk Management

### Value at Risk (VaR)
We provide three methodologies:
1.  **Historical**: Uses actual historical returns to determine the percentile loss.
2.  **Parametric (Variance-Covariance)**: Assumes a normal distribution of returns.
3.  **Monte Carlo**: Simulates thousands of price paths using Geometric Brownian Motion (GBM).

### Expected Shortfall (CVaR)
Measures the average loss exceeding the VaR threshold. It is a coherent risk measure that accounts for "fat tails" (kurtosis).

## 4. Portfolio Optimization

### Black-Litterman Model
Solves the "concentration" problem of Mean-Variance optimization by blending market equilibrium returns with specific investor views using a Bayesian approach.
- **Formula**: $E[R] = [(\tau \Sigma)^{-1} + P^T \Omega^{-1} P]^{-1} [(\tau \Sigma)^{-1} \Pi + P^T \Omega^{-1} Q]$

### Risk Parity
Allocates capital such that each asset contributes equally to the total portfolio risk (volatility). We use iterative numerical optimization to solve the risk-budgeting equations.

## 5. Backtesting Engine

### Time-Based Simulation
Our engine operates on a time-step basis rather than event-based, which allows for significantly faster execution for historical research while maintaining high fidelity for daily and intra-day frequencies.

### Cost Modeling
- **Linear Commission**: Percentage-based fee.
- **Slippage**: Simulated using the volume-weighted average price (VWAP) or a fixed basis-point penalty based on trade size relative to market liquidity.
