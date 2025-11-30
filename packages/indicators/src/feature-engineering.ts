/**
 * Feature engineering utilities
 */

import { Series } from '@meridianalgo/core';

export class FeatureEngineering {
  /**
   * Generate lagged features
   */
  static lags(data: Series, lags: number[]): number[][] {
    const features: number[][] = [];
    
    for (let i = Math.max(...lags); i < data.length; i++) {
      const row: number[] = [];
      for (const lag of lags) {
        row.push(data[i - lag]);
      }
      features.push(row);
    }
    
    return features;
  }
  
  /**
   * Rolling window statistics
   */
  static rollingStats(data: Series, window: number): {
    mean: Series;
    std: Series;
    min: Series;
    max: Series;
    skew: Series;
    kurt: Series;
  } {
    const mean: number[] = [];
    const std: number[] = [];
    const min: number[] = [];
    const max: number[] = [];
    const skew: number[] = [];
    const kurt: number[] = [];
    
    for (let i = window - 1; i < data.length; i++) {
      const slice = data.slice(i - window + 1, i + 1);
      
      const m = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / slice.length;
      const s = Math.sqrt(variance);
      
      mean.push(m);
      std.push(s);
      min.push(Math.min(...slice));
      max.push(Math.max(...slice));
      
      // Skewness
      const skewness = s > 0
        ? slice.reduce((sum, x) => sum + Math.pow((x - m) / s, 3), 0) / slice.length
        : 0;
      skew.push(skewness);
      
      // Kurtosis
      const kurtosis = s > 0
        ? slice.reduce((sum, x) => sum + Math.pow((x - m) / s, 4), 0) / slice.length - 3
        : 0;
      kurt.push(kurtosis);
    }
    
    return { mean, std, min, max, skew, kurt };
  }
  
  /**
   * Expanding window statistics
   */
  static expandingStats(data: Series): {
    mean: Series;
    std: Series;
    min: Series;
    max: Series;
  } {
    const mean: number[] = [];
    const std: number[] = [];
    const min: number[] = [];
    const max: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const slice = data.slice(0, i + 1);
      
      const m = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / slice.length;
      
      mean.push(m);
      std.push(Math.sqrt(variance));
      min.push(Math.min(...slice));
      max.push(Math.max(...slice));
    }
    
    return { mean, std, min, max };
  }
  
  /**
   * Z-score normalization
   */
  static zscore(data: Series, window?: number): Series {
    if (window) {
      const result: number[] = [];
      
      for (let i = window - 1; i < data.length; i++) {
        const slice = data.slice(i - window + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
        const std = Math.sqrt(
          slice.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / slice.length
        );
        
        result.push(std > 0 ? (data[i] - mean) / std : 0);
      }
      
      return result;
    } else {
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const std = Math.sqrt(
        data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length
      );
      
      return data.map(x => std > 0 ? (x - mean) / std : 0);
    }
  }
  
  /**
   * Percentage change
   */
  static pctChange(data: Series, periods: number = 1): Series {
    const result: number[] = [];
    
    for (let i = periods; i < data.length; i++) {
      const change = data[i - periods] !== 0
        ? (data[i] - data[i - periods]) / data[i - periods]
        : 0;
      result.push(change);
    }
    
    return result;
  }
  
  /**
   * Log returns
   */
  static logReturns(data: Series): Series {
    const result: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      result.push(Math.log(data[i] / data[i - 1]));
    }
    
    return result;
  }
  
  /**
   * Rank transformation (cross-sectional)
   */
  static rank(data: Series): Series {
    const indexed = data.map((value, index) => ({ value, index }));
    indexed.sort((a, b) => a.value - b.value);
    
    const ranks = new Array(data.length);
    indexed.forEach((item, rank) => {
      ranks[item.index] = rank / (data.length - 1); // Normalize to [0, 1]
    });
    
    return ranks;
  }
  
  /**
   * Simple PCA (first principal component)
   */
  static pca(data: number[][]): { component: number[]; variance: number } {
    const n = data.length;
    const m = data[0].length;
    
    // Center the data
    const means = new Array(m).fill(0);
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < n; i++) {
        means[j] += data[i][j];
      }
      means[j] /= n;
    }
    
    const centered = data.map(row => row.map((val, j) => val - means[j]));
    
    // Compute covariance matrix
    const cov: number[][] = Array(m).fill(0).map(() => Array(m).fill(0));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        for (let k = 0; k < n; k++) {
          cov[i][j] += centered[k][i] * centered[k][j];
        }
        cov[i][j] /= (n - 1);
      }
    }
    
    // Power iteration to find first eigenvector (simplified)
    let component = new Array(m).fill(1 / Math.sqrt(m));
    
    for (let iter = 0; iter < 100; iter++) {
      const newComponent = new Array(m).fill(0);
      
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
          newComponent[i] += cov[i][j] * component[j];
        }
      }
      
      // Normalize
      const norm = Math.sqrt(newComponent.reduce((sum, x) => sum + x * x, 0));
      component = newComponent.map(x => x / norm);
    }
    
    // Calculate explained variance
    let variance = 0;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        variance += component[i] * cov[i][j] * component[j];
      }
    }
    
    return { component, variance };
  }
  
  /**
   * Correlation matrix
   */
  static correlation(data: number[][]): number[][] {
    const n = data.length;
    const m = data[0].length;
    
    const corr: number[][] = Array(m).fill(0).map(() => Array(m).fill(0));
    
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        const xi = data.map(row => row[i]);
        const xj = data.map(row => row[j]);
        
        const meanI = xi.reduce((a, b) => a + b, 0) / n;
        const meanJ = xj.reduce((a, b) => a + b, 0) / n;
        
        let cov = 0;
        let varI = 0;
        let varJ = 0;
        
        for (let k = 0; k < n; k++) {
          const di = xi[k] - meanI;
          const dj = xj[k] - meanJ;
          cov += di * dj;
          varI += di * di;
          varJ += dj * dj;
        }
        
        const denom = Math.sqrt(varI * varJ);
        corr[i][j] = denom > 0 ? cov / denom : 0;
      }
    }
    
    return corr;
  }
}
