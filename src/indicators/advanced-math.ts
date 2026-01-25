/**
 * Advanced Mathematical Indicators for Quantitative Finance
 */

import { Series } from '../core';
import { MathUtils, StatUtils } from '../utils';

export class AdvancedMath {
    /**
     * Hurst Exponent
     * Measures the long-term memory of time series.
     * H < 0.5: Mean reverting
     * H = 0.5: Random walk
     * H > 0.5: Trending
     */
    static hurstExponent(series: Series, maxLag: number = 20): number {
        const prices = series;
        const lags = Array.from({ length: maxLag - 2 }, (_, i) => i + 2);

        const tau = lags.map(lag => {
            const diffs: number[] = [];
            for (let i = lag; i < prices.length; i++) {
                diffs.push(Math.pow(prices[i] - prices[i - lag], 2));
            }
            return Math.sqrt(MathUtils.mean(diffs));
        });

        // Log-Log regression
        const logLags = lags.map(l => Math.log(l));
        const logTau = tau.map(t => Math.log(t));

        // Simple linear regression slope
        let n = logLags.length;
        let sumX = logLags.reduce((a, b) => a + b, 0);
        let sumY = logTau.reduce((a, b) => a + b, 0);
        let sumXY = logLags.reduce((sum, x, i) => sum + x * logTau[i], 0);
        let sumXX = logLags.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope * 2.0; // Hurst exponent is slope * 2 for this variance method
    }

    /**
     * Fractional Differencing (Fixed Window Method)
     * Preserves memory while achieving stationarity.
     * Based on Marcos Lopez de Prado's "Advances in Financial Machine Learning"
     */
    static fracDiff(series: Series, d: number, threshold: number = 1e-4): Series {
        const weights = this.getWeights(d, threshold);
        const n = weights.length;
        const result: number[] = [];

        for (let i = n - 1; i < series.length; i++) {
            let val = 0;
            for (let j = 0; j < n; j++) {
                val += weights[j] * series[i - j];
            }
            result.push(val);
        }

        return result;
    }

    private static getWeights(d: number, threshold: number): number[] {
        const weights: number[] = [1];
        let k = 1;
        while (true) {
            const w = -weights[weights.length - 1] * (d - k + 1) / k;
            if (Math.abs(w) < threshold) break;
            weights.push(w);
            k++;
        }
        return weights;
    }

    /**
     * Ornstein-Uhlenbeck Process Estimation
     * Estimates mean reversion speed (theta), long-term mean (mu), and volatility (sigma)
     */
    static estimateOU(series: Series, dt: number = 1 / 252): { theta: number; mu: number; sigma: number } {
        const n = series.length - 1;
        const x = series.slice(0, n);
        const y = series.slice(1);

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXX = x.reduce((a, b) => a + b * b, 0);
        const sumYY = y.reduce((a, b) => a + b * b, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);

        const mu = (sumY * sumXX - sumX * sumXY) / (n * (sumXX - sumXY) - (sumX * sumX - sumX * sumY));
        const theta = -(1 / dt) * Math.log((sumXY - mu * sumX - mu * sumY + n * mu * mu) / (sumXX - 2 * mu * sumX + n * mu * mu));

        const a = Math.exp(-theta * dt);
        const sigma2 = (2 * theta / (1 - a * a)) * (1 / n) * (sumYY - 2 * a * sumXY + a * a * sumXX - 2 * mu * (1 - a) * (sumY - a * sumX) + n * mu * mu * (1 - a) * (1 - a));

        return { theta, mu, sigma: Math.sqrt(sigma2) };
    }
}
