/**
 * Statistical utilities
 */

export class StatUtils {
  /**
   * Standard normal cumulative distribution function
   */
  static normalCDF(x: number): number {
    // Approximation using error function
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    return x > 0 ? 1 - prob : prob;
  }
  
  /**
   * Standard normal probability density function
   */
  static normalPDF(x: number): number {
    return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  }
  
  /**
   * Inverse normal CDF (quantile function)
   * Approximation using Beasley-Springer-Moro algorithm
   */
  static normalInv(p: number): number {
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1');
    }
    
    const a = [
      -3.969683028665376e+01,
      2.209460984245205e+02,
      -2.759285104469687e+02,
      1.383577518672690e+02,
      -3.066479806614716e+01,
      2.506628277459239e+00
    ];
    
    const b = [
      -5.447609879822406e+01,
      1.615858368580409e+02,
      -1.556989798598866e+02,
      6.680131188771972e+01,
      -1.328068155288572e+01
    ];
    
    const c = [
      -7.784894002430293e-03,
      -3.223964580411365e-01,
      -2.400758277161838e+00,
      -2.549732539343734e+00,
      4.374664141464968e+00,
      2.938163982698783e+00
    ];
    
    const d = [
      7.784695709041462e-03,
      3.224671290700398e-01,
      2.445134137142996e+00,
      3.754408661907416e+00
    ];
    
    const pLow = 0.02425;
    const pHigh = 1 - pLow;
    
    let q: number;
    let r: number;
    
    if (p < pLow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
             ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= pHigh) {
      q = p - 0.5;
      r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
             (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
              ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
  }
  
  /**
   * Two-sample t-test
   * Returns t-statistic
   */
  static tTest(sample1: number[], sample2: number[]): number {
    const n1 = sample1.length;
    const n2 = sample2.length;
    
    if (n1 < 2 || n2 < 2) {
      throw new Error('Each sample must have at least 2 observations');
    }
    
    const mean1 = sample1.reduce((a, b) => a + b, 0) / n1;
    const mean2 = sample2.reduce((a, b) => a + b, 0) / n2;
    
    const var1 = sample1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / (n1 - 1);
    const var2 = sample2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / (n2 - 1);
    
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
    
    return se > 0 ? (mean1 - mean2) / se : 0;
  }
  
  /**
   * Chi-square test
   * Returns chi-square statistic
   */
  static chiSquare(observed: number[], expected: number[]): number {
    if (observed.length !== expected.length) {
      throw new Error('Observed and expected arrays must have the same length');
    }
    
    let chiSq = 0;
    for (let i = 0; i < observed.length; i++) {
      if (expected[i] > 0) {
        chiSq += Math.pow(observed[i] - expected[i], 2) / expected[i];
      }
    }
    
    return chiSq;
  }
  
  /**
   * Jarque-Bera test for normality
   * Returns JB statistic
   */
  static jarqueBera(data: number[]): number {
    const n = data.length;
    if (n < 4) return 0;
    
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    
    if (std === 0) return 0;
    
    const skewness = data.reduce((sum, x) => sum + Math.pow((x - mean) / std, 3), 0) / n;
    const kurtosis = data.reduce((sum, x) => sum + Math.pow((x - mean) / std, 4), 0) / n;
    
    return (n / 6) * (Math.pow(skewness, 2) + Math.pow(kurtosis - 3, 2) / 4);
  }
  
  /**
   * Augmented Dickey-Fuller test statistic (simplified)
   * Tests for unit root (stationarity)
   */
  static adfTest(data: number[], lags: number = 1): number {
    const n = data.length;
    if (n < lags + 2) return 0;
    
    // First difference
    const diff: number[] = [];
    for (let i = 1; i < n; i++) {
      diff.push(data[i] - data[i - 1]);
    }
    
    // Regression: diff[t] = alpha + beta * data[t-1] + error
    const y = diff.slice(lags);
    const x = data.slice(lags, -1);
    
    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < x.length; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += Math.pow(x[i] - meanX, 2);
    }
    
    const beta = denominator > 0 ? numerator / denominator : 0;
    
    // Calculate standard error
    const residuals = y.map((yi, i) => yi - (meanY + beta * (x[i] - meanX)));
    const sse = residuals.reduce((sum, r) => sum + r * r, 0);
    const se = Math.sqrt(sse / (x.length - 2) / denominator);
    
    // t-statistic
    return se > 0 ? beta / se : 0;
  }
  
  /**
   * Bootstrap confidence interval
   */
  static bootstrap(
    data: number[],
    statistic: (sample: number[]) => number,
    nBootstrap: number = 1000,
    confidence: number = 0.95
  ): { lower: number; upper: number; mean: number } {
    const bootstrapStats: number[] = [];
    
    for (let i = 0; i < nBootstrap; i++) {
      // Resample with replacement
      const sample: number[] = [];
      for (let j = 0; j < data.length; j++) {
        const index = Math.floor(Math.random() * data.length);
        sample.push(data[index]);
      }
      
      bootstrapStats.push(statistic(sample));
    }
    
    bootstrapStats.sort((a, b) => a - b);
    
    const alpha = 1 - confidence;
    const lowerIndex = Math.floor(nBootstrap * alpha / 2);
    const upperIndex = Math.floor(nBootstrap * (1 - alpha / 2));
    
    return {
      lower: bootstrapStats[lowerIndex],
      upper: bootstrapStats[upperIndex],
      mean: bootstrapStats.reduce((a, b) => a + b, 0) / nBootstrap
    };
  }
}
