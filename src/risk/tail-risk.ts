/**
 * Tail-risk and higher-moment-aware risk analytics.
 *
 * These estimators complement {@link RiskMetrics} (Gaussian / historical VaR)
 * and {@link cornishFisherVaR} by adding a Cornish-Fisher Expected Shortfall, a
 * skew/kurtosis-penalised Sharpe ratio, and a tail-asymmetry ratio. They are
 * sensitive to the third and fourth moments that drive real-world tail losses.
 *
 * Return convention: `returns` are per-period simple returns (e.g. daily).
 */

import { Series } from '../core';
import { MathUtils } from '../utils';
import { cornishFisherVaR } from './advanced';

/**
 * Modified (Cornish-Fisher) Expected Shortfall — the average loss in the tail
 * beyond the Cornish-Fisher VaR threshold.
 *
 * Returns a positive loss magnitude, consistent with {@link cornishFisherVaR}.
 *
 * @param returns Per-period returns.
 * @param confidence Confidence level in (0, 1), e.g. 0.95.
 */
export function modifiedExpectedShortfall(
  returns: Series,
  confidence: number = 0.95
): number {
  if (returns.length === 0) return 0;
  // cornishFisherVaR returns a positive loss; the matching return level is its
  // negation. Average the realised returns at or below that threshold.
  const threshold = -cornishFisherVaR(returns, confidence);
  const tail = returns.filter(r => r <= threshold);
  const meanTail = tail.length > 0 ? MathUtils.mean(tail) : threshold;
  return -meanTail;
}

/**
 * Pézier-White Adjusted Sharpe Ratio.
 *
 * Penalises the Sharpe ratio for negative skewness and excess kurtosis, giving
 * a more honest risk-adjusted figure for non-normal return streams.
 *
 * @param returns Per-period returns.
 * @param riskFreeRate Annual risk-free rate (decimal); converted to per-period
 *   using `periodsPerYear`.
 * @param periodsPerYear Number of return periods per year (default 252).
 */
export function adjustedSharpeRatio(
  returns: Series,
  riskFreeRate: number = 0,
  periodsPerYear: number = 252
): number {
  if (returns.length === 0) return 0;
  const std = MathUtils.std(returns);
  if (std === 0) return 0;

  const rfPerPeriod = riskFreeRate / periodsPerYear;
  const excess = returns.map(r => r - rfPerPeriod);
  const sr = MathUtils.mean(excess) / std; // per-period Sharpe
  const s = MathUtils.skewness(returns);
  const k = MathUtils.kurtosis(returns); // excess kurtosis

  const asr = sr * (1 + (s / 6) * sr - (k / 24) * sr * sr);
  return asr * Math.sqrt(periodsPerYear);
}

/**
 * Tail ratio: magnitude of the right tail relative to the left tail.
 *
 * A value > 1 means upside tail returns dominate downside tail returns. Uses the
 * (1 - p) and p percentiles (default 95th / 5th).
 *
 * @param tail Tail probability in (0, 0.5), default 0.05.
 */
export function tailRatio(returns: Series, tail: number = 0.05): number {
  if (returns.length === 0) return 0;
  if (tail <= 0 || tail >= 0.5) {
    throw new Error('tail must be between 0 and 0.5');
  }
  const right = Math.abs(MathUtils.percentile(returns, 1 - tail));
  const left = Math.abs(MathUtils.percentile(returns, tail));
  return left > 0 ? right / left : Infinity;
}
