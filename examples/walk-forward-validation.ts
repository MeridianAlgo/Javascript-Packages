/**
 * Walk-forward CV with simple linear regression model.
 */
import { walkForward, lagFeatures } from '../src';

const n = 200;
const prices = Array.from({ length: n }, (_, i) =>
  100 + i * 0.5 + Math.sin(i / 10) * 2,
);

const lags = lagFeatures(prices, 3);
const X: number[][] = lags;
const y: number[] = prices.slice(3);

function fit(Xtr: number[][], ytr: number[]) {
  const k = Xtr[0].length;
  const sums = new Array(k).fill(0);
  for (let i = 0; i < ytr.length; i++) {
    for (let j = 0; j < k; j++) sums[j] += Xtr[i][j];
  }
  const mean = sums.map(s => s / ytr.length);
  return { coefs: mean.map(() => 1 / k), bias: 0 };
}

function predict(model: { coefs: number[]; bias: number }, Xte: number[][]) {
  return Xte.map(row =>
    row.reduce((acc, v, j) => acc + v * model.coefs[j], model.bias),
  );
}

const result = walkForward(X, y, {
  mode: 'expanding',
  initialTrainSize: 50,
  testSize: 20,
  step: 20,
  fit,
  predict,
});

console.log('Folds:', result.folds.length);
result.folds.forEach((f, i) => {
  console.log(
    `Fold ${i}: train [${f.trainStart}, ${f.trainEnd}) test [${f.testStart}, ${f.testEnd}) MSE=${f.mse.toFixed(3)} R²=${f.rSquared.toFixed(3)}`,
  );
});
console.log('Mean MSE:', result.meanMse.toFixed(3));
console.log('Mean MAE:', result.meanMae.toFixed(3));
