/**
 * ARIMA time series model (simplified implementation)
 */

import { Series } from '@meridianalgo/core';
import { MathUtils } from '@meridianalgo/utils';

export interface ARIMAConfig {
  p: number;  // AR order
  d: number;  // Differencing
  q: number;  // MA order
}

export class ARIMAModel {
  private config: ARIMAConfig;
  private arCoeffs: number[] = [];
  private maCoeffs: number[] = [];
  private mean: number = 0;
  private residuals: number[] = [];
  
  constructor(config: ARIMAConfig) {
    this.config = config;
  }
  
  async train(data: Series): Promise<void> {
    // Apply differencing
    let series = [...data];
    for (let i = 0; i < this.config.d; i++) {
      series = this.difference(series);
    }
    
    this.mean = MathUtils.mean(series);
    const centered = series.map(x => x - this.mean);
    
    // Estimate AR coefficients using Yule-Walker equations (simplified)
    this.arCoeffs = this.estimateAR(centered, this.config.p);
    
    // Calculate residuals
    this.residuals = this.calculateResiduals(centered, this.arCoeffs);
    
    // Estimate MA coefficients (simplified)
    this.maCoeffs = this.estimateMA(this.residuals, this.config.q);
  }
  
  async predict(steps: number): Promise<number[]> {
    const predictions: number[] = [];
    
    // Simple forecasting (can be improved)
    for (let i = 0; i < steps; i++) {
      let forecast = this.mean;
      
      // AR component
      for (let j = 0; j < this.arCoeffs.length; j++) {
        const idx = predictions.length - 1 - j;
        if (idx >= 0) {
          forecast += this.arCoeffs[j] * (predictions[idx] - this.mean);
        }
      }
      
      predictions.push(forecast);
    }
    
    return predictions;
  }
  
  private difference(series: Series): Series {
    const result: number[] = [];
    for (let i = 1; i < series.length; i++) {
      result.push(series[i] - series[i - 1]);
    }
    return result;
  }
  
  private estimateAR(series: Series, order: number): number[] {
    if (order === 0 || series.length < order + 1) return [];
    
    // Yule-Walker equations (simplified)
    const coeffs: number[] = [];
    
    for (let i = 0; i < order; i++) {
      let numerator = 0;
      let denominator = 0;
      
      for (let t = order; t < series.length; t++) {
        numerator += series[t] * series[t - i - 1];
        denominator += series[t - i - 1] * series[t - i - 1];
      }
      
      coeffs.push(denominator > 0 ? numerator / denominator : 0);
    }
    
    return coeffs;
  }
  
  private calculateResiduals(series: Series, arCoeffs: number[]): Series {
    const residuals: number[] = [];
    
    for (let t = arCoeffs.length; t < series.length; t++) {
      let predicted = 0;
      for (let i = 0; i < arCoeffs.length; i++) {
        predicted += arCoeffs[i] * series[t - i - 1];
      }
      residuals.push(series[t] - predicted);
    }
    
    return residuals;
  }
  
  private estimateMA(residuals: Series, order: number): number[] {
    if (order === 0 || residuals.length < order + 1) return [];
    
    // Simplified MA estimation
    const coeffs: number[] = [];
    
    for (let i = 0; i < order; i++) {
      let sum = 0;
      let count = 0;
      
      for (let t = i + 1; t < residuals.length; t++) {
        sum += residuals[t] * residuals[t - i - 1];
        count++;
      }
      
      coeffs.push(count > 0 ? sum / count : 0);
    }
    
    return coeffs;
  }
}
