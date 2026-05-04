/**
 * Walk-forward validation for time-series models.
 *
 * Generates train/test splits in expanding or rolling-window mode and runs a
 * user-supplied (fit, predict) callback on each fold. Returns per-fold metrics
 * so calibration drift over time can be measured.
 */

export type FitFn<TModel> = (trainX: readonly (readonly number[])[], trainY: readonly number[]) => TModel;
export type PredictFn<TModel> = (model: TModel, testX: readonly (readonly number[])[]) => number[];

export interface WalkForwardConfig<TModel> {
  /** Initial training window size. */
  initialTrainSize: number;
  /** Test window size (advance each fold by this amount). */
  testSize: number;
  /** Step size between folds (default = testSize). */
  step?: number;
  /** "expanding" (anchored) or "rolling" (sliding). */
  mode?: 'expanding' | 'rolling';
  fit: FitFn<TModel>;
  predict: PredictFn<TModel>;
}

export interface FoldResult {
  trainStart: number;
  trainEnd: number;
  testStart: number;
  testEnd: number;
  predictions: number[];
  actual: number[];
  mse: number;
  mae: number;
  /** Coefficient of determination (R²) on this fold. */
  rSquared: number;
}

export interface WalkForwardResult {
  folds: FoldResult[];
  /** Aggregate (concatenated) predictions across all folds. */
  combinedPredictions: number[];
  combinedActual: number[];
  /** Mean of per-fold MSE / MAE. */
  meanMse: number;
  meanMae: number;
}

export function walkForward<TModel>(
  X: readonly (readonly number[])[],
  y: readonly number[],
  cfg: WalkForwardConfig<TModel>,
): WalkForwardResult {
  if (X.length !== y.length) throw new Error('walkForward: X and y length mismatch');
  const n = y.length;
  const step = cfg.step ?? cfg.testSize;
  const mode = cfg.mode ?? 'expanding';
  const folds: FoldResult[] = [];
  let trainStart = 0;
  let trainEnd = cfg.initialTrainSize;
  while (trainEnd + cfg.testSize <= n) {
    const testStart = trainEnd;
    const testEnd = trainEnd + cfg.testSize;
    const trainX = X.slice(trainStart, trainEnd);
    const trainY = y.slice(trainStart, trainEnd);
    const testX = X.slice(testStart, testEnd);
    const testY = y.slice(testStart, testEnd);
    const model = cfg.fit(trainX, trainY);
    const preds = cfg.predict(model, testX);
    if (preds.length !== testY.length) {
      throw new Error('walkForward: prediction length mismatch with test window');
    }
    let sse = 0;
    let sae = 0;
    let ssTot = 0;
    const meanY = testY.reduce((s, v) => s + v, 0) / testY.length;
    for (let i = 0; i < testY.length; i++) {
      const e = preds[i] - testY[i];
      sse += e * e;
      sae += Math.abs(e);
      ssTot += (testY[i] - meanY) ** 2;
    }
    folds.push({
      trainStart,
      trainEnd,
      testStart,
      testEnd,
      predictions: preds,
      actual: [...testY],
      mse: sse / testY.length,
      mae: sae / testY.length,
      rSquared: ssTot === 0 ? 0 : 1 - sse / ssTot,
    });
    if (mode === 'rolling') trainStart += step;
    trainEnd += step;
  }
  const combinedPredictions: number[] = [];
  const combinedActual: number[] = [];
  for (const f of folds) {
    combinedPredictions.push(...f.predictions);
    combinedActual.push(...f.actual);
  }
  const meanMse = folds.reduce((s, f) => s + f.mse, 0) / Math.max(folds.length, 1);
  const meanMae = folds.reduce((s, f) => s + f.mae, 0) / Math.max(folds.length, 1);
  return { folds, combinedPredictions, combinedActual, meanMse, meanMae };
}
