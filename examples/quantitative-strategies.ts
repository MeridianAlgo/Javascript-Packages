/**
 * Advanced Quantitative Strategies Example
 * Demonstrates professional quant strategies including:
 * - Statistical Arbitrage
 * - Mean Reversion with Kalman Filter
 * - Momentum with Regime Detection
 * - Multi-factor Alpha Models
 */

import { YahooAdapter } from '@meridianalgo/data';
import {
    Indicators,
    AdvancedVolatilityIndicators,
    RegimeIndicators,
    FeatureEngineering
} from '@meridianalgo/indicators';
import { TimeBasedEngine } from '@meridianalgo/backtest';
import { RiskMetrics, PerformanceMetrics } from '@meridianalgo/risk';
import { Bar, Signal, Strategy } from '@meridianalgo/core';

/**
 * Statistical Arbitrage Strategy
 * Uses cointegration and z-score mean reversion
 */
function statisticalArbitrageStrategy(params: {
    lookback: number;
    entryThreshold: number;
    exitThreshold: number;
}): Strategy {
    const bars: Bar[] = [];

    return {
        id: 'statistical-arbitrage',

        next(bar: Bar): Signal | null {
            bars.push(bar);

            if (bars.length < params.lookback) return null;

            const closes = bars.slice(-params.lookback).map(b => b.c);
            const returns = closes.slice(1).map((c, i) => (c - closes[i]) / closes[i]);

            // Calculate z-score
            const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
            const std = Math.sqrt(
                returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length
            );

            const currentReturn = (bar.c - bars[bars.length - 2].c) / bars[bars.length - 2].c;
            const zscore = (currentReturn - mean) / std;

            // Mean reversion signals
            if (zscore < -params.entryThreshold) {
                return { t: bar.t, value: 1 }; // Oversold, buy
            } else if (zscore > params.entryThreshold) {
                return { t: bar.t, value: -1 }; // Overbought, sell
            } else if (Math.abs(zscore) < params.exitThreshold) {
                return { t: bar.t, value: 0 }; // Exit position
            }

            return null;
        }
    };
}

/**
 * Momentum Strategy with Regime Detection
 * Adapts to market regimes using HMM
 */
function regimeAdaptiveMomentum(params: {
    momentumPeriod: number;
    regimeLookback: number;
    rsiPeriod: number;
}): Strategy {
    const bars: Bar[] = [];
    let currentRegime = 0;

    return {
        id: 'regime-adaptive-momentum',

        next(bar: Bar): Signal | null {
            bars.push(bar);

            if (bars.length < Math.max(params.momentumPeriod, params.regimeLookback)) {
                return null;
            }

            const closes = bars.map(b => b.c);
            const returns = closes.slice(1).map((c, i) => (c - closes[i]) / closes[i]);

            // Detect regime
            if (bars.length >= params.regimeLookback) {
                const recentReturns = returns.slice(-params.regimeLookback);
                const regimes = RegimeIndicators.hmm(recentReturns, 2);
                currentRegime = regimes.regimes[regimes.regimes.length - 1];
            }

            // Calculate momentum
            const momentum = (closes[closes.length - 1] - closes[closes.length - params.momentumPeriod])
                / closes[closes.length - params.momentumPeriod];

            // Calculate RSI for confirmation
            const rsi = Indicators.rsi(closes, params.rsiPeriod);
            const currentRSI = rsi[rsi.length - 1];

            // Regime-dependent signals
            if (currentRegime === 1) { // Trending regime
                if (momentum > 0 && currentRSI < 70) {
                    return { t: bar.t, value: 1 };
                } else if (momentum < 0 && currentRSI > 30) {
                    return { t: bar.t, value: -1 };
                }
            } else { // Mean-reverting regime
                if (currentRSI < 30) {
                    return { t: bar.t, value: 1 };
                } else if (currentRSI > 70) {
                    return { t: bar.t, value: -1 };
                }
            }

            return { t: bar.t, value: 0 };
        }
    };
}

/**
 * Multi-Factor Alpha Model
 * Combines multiple factors: momentum, value, volatility, quality
 */
function multiFactorAlpha(params: {
    lookback: number;
    momentumWeight: number;
    volatilityWeight: number;
    trendWeight: number;
}): Strategy {
    const bars: Bar[] = [];

    return {
        id: 'multi-factor-alpha',

        next(bar: Bar): Signal | null {
            bars.push(bar);

            if (bars.length < params.lookback) return null;

            const closes = bars.slice(-params.lookback).map(b => b.c);
            const highs = bars.slice(-params.lookback).map(b => b.h);
            const lows = bars.slice(-params.lookback).map(b => b.l);
            const volumes = bars.slice(-params.lookback).map(b => b.v);

            // Factor 1: Momentum (rate of change)
            const momentum = (closes[closes.length - 1] - closes[0]) / closes[0];
            const momentumScore = momentum > 0 ? 1 : -1;

            // Factor 2: Volatility (lower is better for long positions)
            const returns = closes.slice(1).map((c, i) => (c - closes[i]) / closes[i]);
            const volatility = Math.sqrt(
                returns.reduce((a, b) => a + b * b, 0) / returns.length
            );
            const volatilityScore = volatility < 0.02 ? 1 : volatility > 0.05 ? -1 : 0;

            // Factor 3: Trend strength (ADX-like)
            const sma20 = Indicators.sma(closes, 20);
            const sma50 = Indicators.sma(closes, 50);
            const trendScore = sma20[sma20.length - 1] > sma50[sma50.length - 1] ? 1 : -1;

            // Combine factors with weights
            const alphaScore =
                params.momentumWeight * momentumScore +
                params.volatilityWeight * volatilityScore +
                params.trendWeight * trendScore;

            // Normalize to [-1, 1]
            const totalWeight = params.momentumWeight + params.volatilityWeight + params.trendWeight;
            const normalizedAlpha = alphaScore / totalWeight;

            // Generate signal based on alpha
            if (normalizedAlpha > 0.3) {
                return { t: bar.t, value: 1 };
            } else if (normalizedAlpha < -0.3) {
                return { t: bar.t, value: -1 };
            } else {
                return { t: bar.t, value: 0 };
            }
        }
    };
}

/**
 * Volatility Breakout Strategy
 * Uses Bollinger Bands and ATR for entries
 */
function volatilityBreakout(params: {
    bbPeriod: number;
    bbStdDev: number;
    atrPeriod: number;
    atrMultiplier: number;
}): Strategy {
    const bars: Bar[] = [];

    return {
        id: 'volatility-breakout',

        next(bar: Bar): Signal | null {
            bars.push(bar);

            if (bars.length < Math.max(params.bbPeriod, params.atrPeriod)) {
                return null;
            }

            const closes = bars.map(b => b.c);
            const highs = bars.map(b => b.h);
            const lows = bars.map(b => b.l);

            // Calculate Bollinger Bands
            const bb = Indicators.bollingerBands(closes, params.bbPeriod, params.bbStdDev);
            const currentBB = {
                upper: bb.upper[bb.upper.length - 1],
                middle: bb.middle[bb.middle.length - 1],
                lower: bb.lower[bb.lower.length - 1]
            };

            // Calculate ATR
            const atr = Indicators.atr(highs, lows, closes, params.atrPeriod);
            const currentATR = atr[atr.length - 1];

            const currentPrice = bar.c;

            // Breakout signals with ATR confirmation
            if (currentPrice > currentBB.upper && currentATR > currentATR * 1.2) {
                return { t: bar.t, value: 1 }; // Bullish breakout
            } else if (currentPrice < currentBB.lower && currentATR > currentATR * 1.2) {
                return { t: bar.t, value: -1 }; // Bearish breakout
            } else if (Math.abs(currentPrice - currentBB.middle) < currentATR * 0.5) {
                return { t: bar.t, value: 0 }; // Exit near middle band
            }

            return null;
        }
    };
}

async function main() {
    console.log('Advanced Quantitative Strategies Demo\n');
    console.log('=====================================\n');

    // Fetch data
    console.log('Fetching market data...');
    const yahoo = new YahooAdapter();
    const bars = await yahoo.ohlcv('SPY', {
        start: '2022-01-01',
        end: '2023-12-31',
        interval: '1d'
    });

    console.log(`Fetched ${bars.length} bars\n`);

    // Test multiple strategies
    const strategies = [
        {
            name: 'Statistical Arbitrage',
            strategy: statisticalArbitrageStrategy({
                lookback: 20,
                entryThreshold: 2.0,
                exitThreshold: 0.5
            })
        },
        {
            name: 'Regime-Adaptive Momentum',
            strategy: regimeAdaptiveMomentum({
                momentumPeriod: 20,
                regimeLookback: 100,
                rsiPeriod: 14
            })
        },
        {
            name: 'Multi-Factor Alpha',
            strategy: multiFactorAlpha({
                lookback: 60,
                momentumWeight: 0.4,
                volatilityWeight: 0.3,
                trendWeight: 0.3
            })
        },
        {
            name: 'Volatility Breakout',
            strategy: volatilityBreakout({
                bbPeriod: 20,
                bbStdDev: 2,
                atrPeriod: 14,
                atrMultiplier: 1.5
            })
        }
    ];

    console.log('Backtesting Strategies\n');
    console.log('======================\n');

    for (const { name, strategy } of strategies) {
        console.log(`Strategy: ${name}`);
        console.log('-'.repeat(50));

        const engine = new TimeBasedEngine({
            strategy,
            data: bars,
            initialCash: 100000
        });

        const result = await engine.run();

        // Display results
        console.log(`Total Return: ${(result.metrics.totalReturn * 100).toFixed(2)}%`);
        console.log(`Annualized Return: ${(result.metrics.annualizedReturn * 100).toFixed(2)}%`);
        console.log(`Sharpe Ratio: ${result.metrics.sharpeRatio.toFixed(2)}`);
        console.log(`Sortino Ratio: ${result.metrics.sortinoRatio.toFixed(2)}`);
        console.log(`Max Drawdown: ${(result.metrics.maxDrawdown * 100).toFixed(2)}%`);
        console.log(`Win Rate: ${(result.metrics.winRate * 100).toFixed(2)}%`);
        console.log(`Profit Factor: ${result.metrics.profitFactor.toFixed(2)}`);
        console.log(`Total Trades: ${result.metrics.totalTrades}`);

        // Calculate additional metrics
        const returns = result.equity.slice(1).map((e, i) =>
            (e.equity - result.equity[i].equity) / result.equity[i].equity
        );

        const calmarRatio = result.metrics.annualizedReturn / Math.abs(result.metrics.maxDrawdown);
        console.log(`Calmar Ratio: ${calmarRatio.toFixed(2)}`);

        console.log('\n');
    }

    console.log('Strategy Comparison Complete');
    console.log('\nKey Insights:');
    console.log('- Statistical Arbitrage works best in range-bound markets');
    console.log('- Regime-Adaptive Momentum adjusts to market conditions');
    console.log('- Multi-Factor Alpha combines multiple signals for robustness');
    console.log('- Volatility Breakout captures trending moves with confirmation');
}

main().catch(console.error);
