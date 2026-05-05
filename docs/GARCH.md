# Volatility Models (GARCH) Package

The `@meridianalgo/garch` package provides advanced volatility modeling tools, including GARCH, EGARCH, and GJR-GARCH models.

## Models

### GARCH(1,1)
Standard Generalized Autoregressive Conditional Heteroskedasticity model.
$\sigma_t^2 = \omega + \alpha \epsilon_{t-1}^2 + \beta \sigma_{t-1}^2$

```typescript
import { fitGARCH11, garch11Forecast } from '@meridianalgo/garch';

const result = fitGARCH11(returns);
const { params, variances } = result;

// Forecast next 10 days
const forecast = garch11Forecast(
  variances[variances.length-1], 
  returns[returns.length-1] - params.mu, 
  params, 
  10
);
```

### EGARCH
Exponential GARCH model, which captures asymmetric effects (leverage effect).

### GJR-GARCH
Another model for capturing asymmetric volatility responses to shocks.

## Features

- **MLE Estimation**: Parameters are estimated using Maximum Likelihood Estimation.
- **Nelder-Mead Simplex**: Robust optimization without the need for gradients.
- **Transformed Parameters**: Uses parameter transformations to enforce constraints (e.g., $\omega > 0$, $\alpha + \beta < 1$) during optimization.
- **Forecasting**: Built-in support for $h$-step ahead variance forecasting.
