# Machine Learning (Pure-JS)

Zero-dependency ML primitives for time-series forecasting and regime detection.
No native bindings, no tfjs — runs in Node, Deno, Bun, browsers.

## Modules

| Module | Purpose |
|--------|---------|
| `LSTMCell` / `GRUCell` | Forward-pass RNN cells |
| `walkForward` | Time-series cross-validation |
| Feature engineering | Lags, rolling stats, returns, scaling |
| `trainHMM` / `viterbi` | Gaussian HMM regime detection |

## LSTM / GRU Forward Pass

Pre-trained weights only (no backprop). Useful for deploying models trained
elsewhere (Python, JAX) into pure-JS runtimes.

```typescript
import { LSTMCell, randomLSTMWeights } from 'meridianalgo';

const inputSize = 5;
const hiddenSize = 16;
const cell = new LSTMCell(randomLSTMWeights(inputSize, hiddenSize));

const sequence = [/* ... [number[]] ... */];
const { h, c } = cell.forward(sequence);
// h: final hidden state (length hiddenSize)
```

GRU API mirrors LSTM, returns only `h`.

Gate ordering:
- LSTM: `[i, f, g, o]` (input, forget, candidate, output)
- GRU: `[r, z, n]` (reset, update, candidate)

Weight shapes:
- LSTM: `Wi[4H × N]`, `Wh[4H × H]`, `b[4H]`
- GRU: `Wi[3H × N]`, `Wh[3H × H]`, `bi[3H]`, `bh[3H]`

## Walk-Forward Validation

Time-series CV that respects causality. Two modes:

```typescript
import { walkForward } from 'meridianalgo';

const result = walkForward(X, y, {
  mode: 'expanding',  // or 'rolling'
  initialTrainSize: 100,
  testSize: 20,
  step: 20,
  fit: (Xtrain, ytrain) => trainModel(Xtrain, ytrain),
  predict: (model, Xtest) => model.predict(Xtest),
});

result.folds;              // per-fold {predictions, actual, mse, mae, rSquared}
result.combinedPredictions; // concatenated out-of-sample predictions
result.meanMse;
result.meanMae;
```

- **Expanding**: train window grows each fold (`[0, end)`).
- **Rolling**: train window slides at fixed size.

## Feature Engineering

```typescript
import {
  lagFeatures, rollingMean, rollingStd,
  logReturns, simpleReturns,
  zScore, minMaxScale, diff,
} from 'meridianalgo';

const lags = lagFeatures(prices, [1, 5, 10]);   // matrix [n × 3]
const ma = rollingMean(prices, 20);
const sd = rollingStd(prices, 20);
const r = logReturns(prices);
const z = zScore(values);                        // (x - μ)/σ
const scaled = minMaxScale(values);              // [0, 1]
```

NaN-padded arrays preserve index alignment with original series.

## HMM Regime Detection

Gaussian-emission HMM with Baum-Welch training (forward-backward + scaling)
and Viterbi decoding in log-domain.

```typescript
import { trainHMM, viterbi } from 'meridianalgo';

const observations = returns;  // 1-D series
const k = 2;                   // num regimes (e.g. bull/bear)

const { params, logLik, iterations } = trainHMM(observations, k, {
  maxIter: 100,
  tol: 1e-4,
});

const states = viterbi(observations, params);
// states[t] ∈ {0, 1, ..., k-1}
```

`HMMParams`:
- `pi[k]` — initial state distribution
- `A[k][k]` — transition matrix
- `mu[k]`, `sigma[k]` — emission Gaussian params

## Limitations

- No autograd / training for RNN cells (forward-only).
- HMM Gaussian emissions are univariate scalar.
- For heavy training workloads use Python — load weights here for inference.

See also: `INDICATORS-PATTERNS.md` for streaming indicators that pair well
with online ML inference.
