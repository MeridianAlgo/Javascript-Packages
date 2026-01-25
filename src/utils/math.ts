/**
 * Mathematical utilities
 */

export class MathUtils {
  /**
   * Calculate mean (average)
   */
  static mean(data: number[]): number {
    if (data.length === 0) return 0;
    return data.reduce((a, b) => a + b, 0) / data.length;
  }
  
  /**
   * Calculate standard deviation
   */
  static std(data: number[], sample: boolean = true): number {
    if (data.length === 0) return 0;
    const mean = this.mean(data);
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (sample ? data.length - 1 : data.length);
    return Math.sqrt(variance);
  }
  
  /**
   * Calculate variance
   */
  static variance(data: number[], sample: boolean = true): number {
    if (data.length === 0) return 0;
    const mean = this.mean(data);
    return data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (sample ? data.length - 1 : data.length);
  }
  
  /**
   * Calculate correlation between two series
   */
  static correlation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < x.length; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }
    
    const denom = Math.sqrt(denomX * denomY);
    return denom > 0 ? numerator / denom : 0;
  }
  
  /**
   * Calculate covariance between two series
   */
  static covariance(x: number[], y: number[], sample: boolean = true): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    
    const cov = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    return cov / (sample ? x.length - 1 : x.length);
  }
  
  /**
   * Calculate percentile
   */
  static percentile(data: number[], p: number): number {
    if (data.length === 0) return 0;
    if (p < 0 || p > 1) throw new Error('Percentile must be between 0 and 1');
    
    const sorted = [...data].sort((a, b) => a - b);
    const index = p * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
  
  /**
   * Calculate median
   */
  static median(data: number[]): number {
    return this.percentile(data, 0.5);
  }
  
  /**
   * Calculate mode (most frequent value)
   */
  static mode(data: number[]): number {
    if (data.length === 0) return 0;
    
    const frequency: Map<number, number> = new Map();
    let maxFreq = 0;
    let mode = data[0];
    
    for (const value of data) {
      const freq = (frequency.get(value) || 0) + 1;
      frequency.set(value, freq);
      
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = value;
      }
    }
    
    return mode;
  }
  
  /**
   * Calculate skewness
   */
  static skewness(data: number[]): number {
    if (data.length < 3) return 0;
    
    const mean = this.mean(data);
    const std = this.std(data);
    
    if (std === 0) return 0;
    
    const n = data.length;
    const skew = data.reduce((sum, x) => sum + Math.pow((x - mean) / std, 3), 0) / n;
    
    return skew * Math.sqrt(n * (n - 1)) / (n - 2);
  }
  
  /**
   * Calculate kurtosis (excess kurtosis)
   */
  static kurtosis(data: number[]): number {
    if (data.length < 4) return 0;
    
    const mean = this.mean(data);
    const std = this.std(data);
    
    if (std === 0) return 0;
    
    const n = data.length;
    const kurt = data.reduce((sum, x) => sum + Math.pow((x - mean) / std, 4), 0) / n;
    
    return ((n + 1) * kurt - 3 * (n - 1)) * (n - 1) / ((n - 2) * (n - 3));
  }
  
  /**
   * Linear interpolation
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
  
  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
  
  /**
   * Sum of array
   */
  static sum(data: number[]): number {
    return data.reduce((a, b) => a + b, 0);
  }
  
  /**
   * Product of array
   */
  static product(data: number[]): number {
    return data.reduce((a, b) => a * b, 1);
  }
  
  /**
   * Cumulative sum
   */
  static cumsum(data: number[]): number[] {
    const result: number[] = [];
    let sum = 0;
    for (const value of data) {
      sum += value;
      result.push(sum);
    }
    return result;
  }
  
  /**
   * Cumulative product
   */
  static cumprod(data: number[]): number[] {
    const result: number[] = [];
    let prod = 1;
    for (const value of data) {
      prod *= value;
      result.push(prod);
    }
    return result;
  }
}
