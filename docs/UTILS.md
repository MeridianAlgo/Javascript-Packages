# Utilities Package

The `@meridianalgo/utils` package provides a collection of mathematical, statistical, and time-related utilities essential for quantitative finance and algorithmic trading.

## Math Utilities (`MathUtils`)

Core mathematical functions optimized for financial time series.

### Basic Statistics
- `mean(data: number[]): number`
- `std(data: number[], useSample?: boolean): number`
- `variance(data: number[], useSample?: boolean): number`
- `median(data: number[]): number`

### Advanced Statistics
- `skewness(data: number[]): number`
- `kurtosis(data: number[]): number`
- `percentile(data: number[], p: number): number`
- `correlation(x: number[], y: number[]): number`
- `covariance(x: number[], y: number[]): number`

### Operations
- `cumsum(data: number[]): number[]`
- `diff(data: number[]): number[]`
- `movingAverage(data: number[], period: number): number[]`

## Statistical Tests (`StatUtils`)

Hypothesis testing and distribution analysis.

### Normality & Stationarity
- `jarqueBera(data: number[]): number` - Tests for normality.
- `adfTest(data: number[], maxLag?: number): number` - Augmented Dickey-Fuller test for stationarity.

### Comparisons
- `tTest(sample1: number[], sample2: number[]): number` - Independent two-sample t-test.

### Distributions
- `normalCDF(x: number, mean?: number, std?: number): number`
- `normalPDF(x: number, mean?: number, std?: number): number`

### Resampling
- `bootstrap(data: number[], statistic: (d: number[]) => number, iterations?: number, ci?: number): { lower: number, mean: number, upper: number }`

## Time Utilities (`TimeUtils`)

Handling trading calendars and time-based operations.

### Market Status
- `isMarketOpen(date: Date, exchange?: string): boolean`
- `nextMarketOpen(date: Date, exchange?: string): Date`
- `nextMarketClose(date: Date, exchange?: string): Date`

### Date Arithmetic
- `addDays(date: Date, days: number): Date`
- `addTradingDays(date: Date, days: number): Date`
- `tradingDays(start: Date, end: Date): number`

### Formatting & Manipulation
- `formatDate(date: Date): string`
- `isHoliday(date: Date): boolean`
- `resample(bars: Bar[], timeframe: string): Bar[]`

## Example Usage

```typescript
import { MathUtils, StatUtils, TimeUtils } from '@meridianalgo/utils';

// Calculate Sharpe Ratio components
const returns = [0.01, -0.02, 0.015, 0.005, -0.01];
const avgReturn = MathUtils.mean(returns);
const vol = MathUtils.std(returns);

// Check if market is open
if (TimeUtils.isMarketOpen(new Date())) {
  console.log("Trading active");
}

// Perform normality test
const jbStat = StatUtils.jarqueBera(returns);
if (jbStat > 5.99) {
  console.log("Data is likely not normally distributed");
}
```
