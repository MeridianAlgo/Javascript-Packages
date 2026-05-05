# Financial Models Package

The `@meridianalgo/models` package provides standard statistical and econometrics models for financial time series analysis.

## Models

### ARIMA (Autoregressive Integrated Moving Average)
Standard model for stationary and non-stationary time series forecasting.

```typescript
import { ARIMAModel } from '@meridianalgo/models';

const model = new ARIMAModel({
  p: 1, // AR order
  d: 1, // Differencing
  q: 1  // MA order
});

// Train on historical data
await model.train(priceSeries);

// Predict next 5 steps
const predictions = await model.predict(5);
```

### Linear Regression
Ordinary Least Squares (OLS) regression for factor modeling and relationship analysis.

```typescript
import { LinearRegression } from '@meridianalgo/models';

const reg = new LinearRegression();

// X: Independent variables (matrix), y: Dependent variable (array)
await reg.train(X, y);

const { coefficients, intercept, rSquared } = reg.summary();
const prediction = await reg.predict([x1, x2, x3]);
```

## Features

- **Simplified Training**: Asynchronous `train` methods for consistent API.
- **Factor Analysis**: Use Linear Regression to determine beta exposures to different risk factors.
- **Forecasting**: ARIMA support for short-term price or return predictions.
