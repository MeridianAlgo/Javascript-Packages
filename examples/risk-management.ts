/**
 * Advanced Risk Management Example
 * Demonstrates professional risk management techniques:
 * - Value at Risk (VaR) - Historical, Parametric, Monte Carlo
 * - Conditional Value at Risk (CVaR)
 * - Maximum Drawdown Analysis
 * - Stress Testing
 * - Position Sizing
 */

import { YahooAdapter } from '@meridianalgo/data';
import { RiskMetrics, PerformanceMetrics } from '@meridianalgo/risk';
import { Indicators } from '@meridianalgo/indicators';

/**
 * Calculate Historical VaR
 */
function historicalVaR(returns: number[], confidence: number): number {
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);
    return sorted[index];
}

/**
 * Calculate Parametric VaR (assumes normal distribution)
 */
function parametricVaR(returns: number[], confidence: number): number {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const std = Math.sqrt(variance);

    // Z-score for confidence level
    const zScores: { [key: number]: number } = {
        0.90: 1.282,
        0.95: 1.645,
        0.99: 2.326
    };

    const z = zScores[confidence] || 1.645;
    return mean - z * std;
}

/**
 * Calculate CVaR (Expected Shortfall)
 */
function conditionalVaR(returns: number[], confidence: number): number {
    const var95 = historicalVaR(returns, confidence);
    const tailReturns = returns.filter(r => r <= var95);
    return tailReturns.reduce((a, b) => a + b, 0) / tailReturns.length;
}

/**
 * Monte Carlo VaR Simulation
 */
function monteCarloVaR(
    returns: number[],
    confidence: number,
    simulations: number = 10000
): number {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const std = Math.sqrt(variance);

    const simulatedReturns: number[] = [];

    for (let i = 0; i < simulations; i++) {
        // Box-Muller transform for normal random variables
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const simulatedReturn = mean + z * std;
        simulatedReturns.push(simulatedReturn);
    }

    return historicalVaR(simulatedReturns, confidence);
}

/**
 * Calculate Maximum Drawdown
 */
function maxDrawdown(equity: number[]): {
    maxDD: number;
    peak: number;
    trough: number;
    duration: number;
} {
    let maxDD = 0;
    let peak = equity[0];
    let peakIndex = 0;
    let troughIndex = 0;
    let currentPeak = equity[0];
    let currentPeakIndex = 0;

    for (let i = 1; i < equity.length; i++) {
        if (equity[i] > currentPeak) {
            currentPeak = equity[i];
            currentPeakIndex = i;
        }

        const dd = (equity[i] - currentPeak) / currentPeak;
        if (dd < maxDD) {
            maxDD = dd;
            peak = currentPeak;
            peakIndex = currentPeakIndex;
            troughIndex = i;
        }
    }

    return {
        maxDD,
        peak,
        trough: equity[troughIndex],
        duration: troughIndex - peakIndex
    };
}

/**
 * Kelly Criterion for Position Sizing
 */
function kellyCriterion(winRate: number, avgWin: number, avgLoss: number): number {
    const b = avgWin / Math.abs(avgLoss); // Win/loss ratio
    const p = winRate; // Probability of winning
    const q = 1 - p; // Probability of losing

    const kelly = (p * b - q) / b;

    // Use fractional Kelly for safety
    return Math.max(0, Math.min(kelly * 0.5, 0.25)); // Max 25% position
}

/**
 * Stress Testing - Scenario Analysis
 */
function stressTest(
    returns: number[],
    scenarios: { name: string; shockSize: number }[]
): { name: string; portfolioReturn: number }[] {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const std = Math.sqrt(variance);

    return scenarios.map(scenario => ({
        name: scenario.name,
        portfolioReturn: mean + scenario.shockSize * std
    }));
}

async function main() {
    console.log('Advanced Risk Management Demo\n');
    console.log('=============================\n');

    // Fetch data
    console.log('Fetching market data...');
    const yahoo = new YahooAdapter();
    const bars = await yahoo.ohlcv('SPY', {
        start: '2020-01-01',
        end: '2023-12-31',
        interval: '1d'
    });

    console.log(`Fetched ${bars.length} bars\n`);

    // Calculate returns
    const returns = bars.slice(1).map((bar, i) =>
        (bar.c - bars[i].c) / bars[i].c
    );

    const equity = [100000];
    for (const ret of returns) {
        equity.push(equity[equity.length - 1] * (1 + ret));
    }

    // 1. Value at Risk Analysis
    console.log('Value at Risk (VaR) Analysis');
    console.log('============================');

    const confidenceLevels = [0.90, 0.95, 0.99];

    for (const confidence of confidenceLevels) {
        const histVaR = historicalVaR(returns, confidence);
        const paramVaR = parametricVaR(returns, confidence);
        const mcVaR = monteCarloVaR(returns, confidence);

        console.log(`\n${(confidence * 100)}% Confidence Level:`);
        console.log(`  Historical VaR: ${(histVaR * 100).toFixed(3)}%`);
        console.log(`  Parametric VaR: ${(paramVaR * 100).toFixed(3)}%`);
        console.log(`  Monte Carlo VaR: ${(mcVaR * 100).toFixed(3)}%`);
        console.log(`  1-Day VaR (on $100k): $${(histVaR * 100000).toFixed(2)}`);
    }

    // 2. Conditional VaR (Expected Shortfall)
    console.log('\n\nConditional VaR (CVaR/Expected Shortfall)');
    console.log('=========================================');

    for (const confidence of confidenceLevels) {
        const cvar = conditionalVaR(returns, confidence);
        console.log(`${(confidence * 100)}% CVaR: ${(cvar * 100).toFixed(3)}%`);
        console.log(`  Expected loss in worst ${((1 - confidence) * 100).toFixed(0)}% of cases`);
    }

    // 3. Maximum Drawdown Analysis
    console.log('\n\nMaximum Drawdown Analysis');
    console.log('=========================');

    const dd = maxDrawdown(equity);
    console.log(`Maximum Drawdown: ${(dd.maxDD * 100).toFixed(2)}%`);
    console.log(`Peak Value: $${dd.peak.toFixed(2)}`);
    console.log(`Trough Value: $${dd.trough.toFixed(2)}`);
    console.log(`Duration: ${dd.duration} days`);
    console.log(`Recovery Required: ${((dd.peak / dd.trough - 1) * 100).toFixed(2)}%`);

    // 4. Volatility Analysis
    console.log('\n\nVolatility Analysis');
    console.log('===================');

    const dailyVol = Math.sqrt(
        returns.reduce((a, b) => a + b * b, 0) / returns.length
    );
    const annualizedVol = dailyVol * Math.sqrt(252);

    console.log(`Daily Volatility: ${(dailyVol * 100).toFixed(3)}%`);
    console.log(`Annualized Volatility: ${(annualizedVol * 100).toFixed(2)}%`);

    // Rolling volatility
    const rollingVol: number[] = [];
    const window = 20;

    for (let i = window; i < returns.length; i++) {
        const windowReturns = returns.slice(i - window, i);
        const vol = Math.sqrt(
            windowReturns.reduce((a, b) => a + b * b, 0) / windowReturns.length
        );
        rollingVol.push(vol);
    }

    const currentVol = rollingVol[rollingVol.length - 1];
    const avgVol = rollingVol.reduce((a, b) => a + b, 0) / rollingVol.length;

    console.log(`Current 20-day Volatility: ${(currentVol * 100).toFixed(3)}%`);
    console.log(`Average 20-day Volatility: ${(avgVol * 100).toFixed(3)}%`);
    console.log(`Volatility Regime: ${currentVol > avgVol * 1.2 ? 'High' : currentVol < avgVol * 0.8 ? 'Low' : 'Normal'}`);

    // 5. Performance Metrics
    console.log('\n\nPerformance Metrics');
    console.log('===================');

    const totalReturn = (equity[equity.length - 1] - equity[0]) / equity[0];
    const years = bars.length / 252;
    const annualizedReturn = Math.pow(1 + totalReturn, 1 / years) - 1;

    const sharpeRatio = annualizedReturn / annualizedVol;

    // Sortino Ratio (downside deviation)
    const downsideReturns = returns.filter(r => r < 0);
    const downsideVol = Math.sqrt(
        downsideReturns.reduce((a, b) => a + b * b, 0) / downsideReturns.length
    ) * Math.sqrt(252);
    const sortinoRatio = annualizedReturn / downsideVol;

    // Calmar Ratio
    const calmarRatio = annualizedReturn / Math.abs(dd.maxDD);

    console.log(`Total Return: ${(totalReturn * 100).toFixed(2)}%`);
    console.log(`Annualized Return: ${(annualizedReturn * 100).toFixed(2)}%`);
    console.log(`Sharpe Ratio: ${sharpeRatio.toFixed(2)}`);
    console.log(`Sortino Ratio: ${sortinoRatio.toFixed(2)}`);
    console.log(`Calmar Ratio: ${calmarRatio.toFixed(2)}`);

    // 6. Position Sizing (Kelly Criterion)
    console.log('\n\nPosition Sizing (Kelly Criterion)');
    console.log('==================================');

    const wins = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0);
    const winRate = wins.length / returns.length;
    const avgWin = wins.reduce((a, b) => a + b, 0) / wins.length;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;

    const kellySize = kellyCriterion(winRate, avgWin, avgLoss);

    console.log(`Win Rate: ${(winRate * 100).toFixed(2)}%`);
    console.log(`Average Win: ${(avgWin * 100).toFixed(3)}%`);
    console.log(`Average Loss: ${(avgLoss * 100).toFixed(3)}%`);
    console.log(`Win/Loss Ratio: ${(avgWin / Math.abs(avgLoss)).toFixed(2)}`);
    console.log(`Kelly Criterion: ${(kellySize * 100).toFixed(2)}% of capital`);
    console.log(`Recommended Position Size: ${(kellySize * 100).toFixed(2)}% (fractional Kelly)`);

    // 7. Stress Testing
    console.log('\n\nStress Testing');
    console.log('==============');

    const scenarios = [
        { name: '2008 Financial Crisis', shockSize: -5 },
        { name: '2020 COVID Crash', shockSize: -4 },
        { name: 'Moderate Correction', shockSize: -2 },
        { name: 'Flash Crash', shockSize: -3 },
        { name: 'Bull Market', shockSize: 2 }
    ];

    const stressResults = stressTest(returns, scenarios);

    for (const result of stressResults) {
        const portfolioValue = 100000 * (1 + result.portfolioReturn);
        const loss = 100000 - portfolioValue;
        console.log(`${result.name}:`);
        console.log(`  Portfolio Return: ${(result.portfolioReturn * 100).toFixed(2)}%`);
        console.log(`  Portfolio Value: $${portfolioValue.toFixed(2)}`);
        console.log(`  Gain/Loss: $${loss > 0 ? '-' : '+'}${Math.abs(loss).toFixed(2)}`);
    }

    // 8. Risk Summary
    console.log('\n\nRisk Summary');
    console.log('============');
    console.log('Key Risk Metrics:');
    console.log(`- 95% Daily VaR: ${(historicalVaR(returns, 0.95) * 100).toFixed(3)}%`);
    console.log(`- Maximum Drawdown: ${(dd.maxDD * 100).toFixed(2)}%`);
    console.log(`- Annualized Volatility: ${(annualizedVol * 100).toFixed(2)}%`);
    console.log(`- Sharpe Ratio: ${sharpeRatio.toFixed(2)}`);
    console.log(`- Recommended Position Size: ${(kellySize * 100).toFixed(2)}%`);

    console.log('\nRisk Management Recommendations:');
    console.log('- Use stop-losses at 2x daily VaR');
    console.log('- Maintain position sizes according to Kelly Criterion');
    console.log('- Monitor rolling volatility for regime changes');
    console.log('- Conduct regular stress tests');
    console.log('- Review and adjust risk limits quarterly');
}

main().catch(console.error);
