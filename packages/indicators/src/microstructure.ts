/**
 * Microstructure indicators
 */

import { Bar, Series } from '@meridianalgo/core';

export class MicrostructureIndicators {
  /**
   * VPIN (Volume-Synchronized Probability of Informed Trading)
   * Simplified implementation
   */
  static vpin(bars: Bar[], buckets: number = 50): Series {
    const vpin: number[] = [];
    const volumePerBucket = bars.reduce((sum, b) => sum + b.v, 0) / buckets;
    
    let currentBucket: Bar[] = [];
    let currentVolume = 0;
    
    for (const bar of bars) {
      currentBucket.push(bar);
      currentVolume += bar.v;
      
      if (currentVolume >= volumePerBucket) {
        // Calculate buy/sell volume imbalance
        const buyVolume = currentBucket
          .filter(b => b.c > b.o)
          .reduce((sum, b) => sum + b.v, 0);
        const sellVolume = currentBucket
          .filter(b => b.c < b.o)
          .reduce((sum, b) => sum + b.v, 0);
        
        const totalVolume = buyVolume + sellVolume;
        const imbalance = totalVolume > 0 ? Math.abs(buyVolume - sellVolume) / totalVolume : 0;
        
        vpin.push(imbalance);
        
        // Reset bucket
        currentBucket = [];
        currentVolume = 0;
      }
    }
    
    return vpin;
  }
  
  /**
   * Order book imbalance proxy
   * Uses close vs open to estimate buy/sell pressure
   */
  static orderImbalance(bars: Bar[]): Series {
    return bars.map(bar => {
      const range = bar.h - bar.l;
      if (range === 0) return 0;
      
      // Positive if close near high, negative if close near low
      return (bar.c - bar.l) / range - 0.5;
    });
  }
  
  /**
   * Kyle's lambda (price impact coefficient)
   * Simplified estimation using price change vs volume
   */
  static kylesLambda(bars: Bar[], window: number = 20): Series {
    const lambda: number[] = [];
    
    for (let i = window; i < bars.length; i++) {
      const slice = bars.slice(i - window, i);
      
      // Calculate price changes and volumes
      const priceChanges: number[] = [];
      const volumes: number[] = [];
      
      for (let j = 1; j < slice.length; j++) {
        priceChanges.push(Math.abs(slice[j].c - slice[j - 1].c));
        volumes.push(slice[j].v);
      }
      
      // Simple linear regression: price_change = lambda * volume
      const meanVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
      const meanPriceChange = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length;
      
      let numerator = 0;
      let denominator = 0;
      
      for (let j = 0; j < volumes.length; j++) {
        numerator += (volumes[j] - meanVolume) * (priceChanges[j] - meanPriceChange);
        denominator += Math.pow(volumes[j] - meanVolume, 2);
      }
      
      const lambdaValue = denominator > 0 ? numerator / denominator : 0;
      lambda.push(Math.abs(lambdaValue));
    }
    
    return lambda;
  }
  
  /**
   * Effective spread estimate
   * Uses high-low range as proxy for bid-ask spread
   */
  static effectiveSpread(bars: Bar[]): Series {
    return bars.map(bar => {
      const midpoint = (bar.h + bar.l) / 2;
      return midpoint > 0 ? (bar.h - bar.l) / midpoint : 0;
    });
  }
  
  /**
   * Roll's spread estimator
   * Estimates bid-ask spread from price covariance
   */
  static rollSpread(bars: Bar[], window: number = 20): Series {
    const spread: number[] = [];
    
    for (let i = window; i < bars.length; i++) {
      const prices = bars.slice(i - window, i).map(b => b.c);
      
      // Calculate first-order autocovariance
      const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
      let autocovariance = 0;
      
      for (let j = 1; j < prices.length; j++) {
        autocovariance += (prices[j] - mean) * (prices[j - 1] - mean);
      }
      autocovariance /= (prices.length - 1);
      
      // Roll's estimator: spread = 2 * sqrt(-autocovariance)
      const spreadValue = autocovariance < 0 ? 2 * Math.sqrt(-autocovariance) : 0;
      spread.push(spreadValue);
    }
    
    return spread;
  }
}
