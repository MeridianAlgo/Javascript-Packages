/**
 * Regime detection indicators
 */

import { Series } from '@meridianalgo/core';

export interface RegimeResult {
  regimes: number[];
  probabilities: number[][];
  transitions: number[][];
}

export class RegimeIndicators {
  /**
   * Simple HMM-based regime detection using k-means clustering
   * Simplified implementation without full EM algorithm
   */
  static hmm(returns: Series, states: number = 2): RegimeResult {
    // Use k-means to identify regimes based on volatility
    const volatilities: number[] = [];
    const windowSize = 20;
    
    for (let i = windowSize - 1; i < returns.length; i++) {
      const slice = returns.slice(i - windowSize + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / slice.length;
      volatilities.push(Math.sqrt(variance));
    }
    
    // Simple k-means clustering
    const clusters = this.kMeans(volatilities, states);
    
    // Pad beginning with first regime
    const regimes = new Array(windowSize - 1).fill(clusters[0]).concat(clusters);
    
    // Create dummy probabilities (simplified)
    const probabilities: number[][] = regimes.map(regime => {
      const probs = new Array(states).fill(0);
      probs[regime] = 1;
      return probs;
    });
    
    // Calculate transition matrix
    const transitions: number[][] = Array(states).fill(0).map(() => Array(states).fill(0));
    for (let i = 1; i < regimes.length; i++) {
      transitions[regimes[i - 1]][regimes[i]]++;
    }
    
    // Normalize transitions
    for (let i = 0; i < states; i++) {
      const sum = transitions[i].reduce((a, b) => a + b, 0);
      if (sum > 0) {
        for (let j = 0; j < states; j++) {
          transitions[i][j] /= sum;
        }
      }
    }
    
    return { regimes, probabilities, transitions };
  }
  
  /**
   * Change point detection using CUSUM
   */
  static changePoints(data: Series, threshold: number = 3): number[] {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const std = Math.sqrt(
      data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length
    );
    
    const changePoints: number[] = [];
    let cumSum = 0;
    
    for (let i = 0; i < data.length; i++) {
      cumSum += (data[i] - mean) / std;
      
      if (Math.abs(cumSum) > threshold) {
        changePoints.push(i);
        cumSum = 0; // Reset after detection
      }
    }
    
    return changePoints;
  }
  
  /**
   * Trend vs mean-reversion classifier
   * Returns 1 for trending, -1 for mean-reverting, 0 for neutral
   */
  static trendClassifier(data: Series, window: number = 50): Series {
    const result: number[] = [];
    
    for (let i = window - 1; i < data.length; i++) {
      const slice = data.slice(i - window + 1, i + 1);
      
      // Calculate Hurst exponent (simplified)
      const hurst = this.calculateHurst(slice);
      
      // H > 0.5: trending, H < 0.5: mean-reverting, H ≈ 0.5: random walk
      if (hurst > 0.55) {
        result.push(1); // Trending
      } else if (hurst < 0.45) {
        result.push(-1); // Mean-reverting
      } else {
        result.push(0); // Neutral/random walk
      }
    }
    
    return result;
  }
  
  /**
   * Simple k-means clustering
   */
  private static kMeans(data: number[], k: number, maxIter: number = 100): number[] {
    // Initialize centroids
    const min = Math.min(...data);
    const max = Math.max(...data);
    const centroids = Array(k).fill(0).map((_, i) => min + (max - min) * i / (k - 1));
    
    let assignments = new Array(data.length).fill(0);
    
    for (let iter = 0; iter < maxIter; iter++) {
      // Assign points to nearest centroid
      const newAssignments = data.map(point => {
        let minDist = Infinity;
        let cluster = 0;
        
        for (let i = 0; i < k; i++) {
          const dist = Math.abs(point - centroids[i]);
          if (dist < minDist) {
            minDist = dist;
            cluster = i;
          }
        }
        
        return cluster;
      });
      
      // Check convergence
      if (JSON.stringify(newAssignments) === JSON.stringify(assignments)) {
        break;
      }
      
      assignments = newAssignments;
      
      // Update centroids
      for (let i = 0; i < k; i++) {
        const clusterPoints = data.filter((_, idx) => assignments[idx] === i);
        if (clusterPoints.length > 0) {
          centroids[i] = clusterPoints.reduce((a, b) => a + b, 0) / clusterPoints.length;
        }
      }
    }
    
    return assignments;
  }
  
  /**
   * Calculate Hurst exponent (simplified R/S method)
   */
  private static calculateHurst(data: Series): number {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    
    // Calculate cumulative deviations
    const deviations = data.map(x => x - mean);
    const cumDeviations: number[] = [];
    let sum = 0;
    for (const dev of deviations) {
      sum += dev;
      cumDeviations.push(sum);
    }
    
    // Calculate range
    const range = Math.max(...cumDeviations) - Math.min(...cumDeviations);
    
    // Calculate standard deviation
    const std = Math.sqrt(
      deviations.reduce((sum, x) => sum + x * x, 0) / n
    );
    
    // R/S statistic
    const rs = std > 0 ? range / std : 1;
    
    // Hurst exponent: H = log(R/S) / log(n)
    const hurst = Math.log(rs) / Math.log(n);
    
    // Clamp to reasonable range
    return Math.max(0, Math.min(1, hurst));
  }
}
