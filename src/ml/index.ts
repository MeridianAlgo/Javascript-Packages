/**
 * Machine learning utilities — pure-JS RNN cells, walk-forward validation,
 * feature engineering, and HMM regime detection.
 */

export { LSTMCell, randomLSTMWeights } from './lstm';
export type { LSTMWeights } from './lstm';

export { GRUCell, randomGRUWeights } from './gru';
export type { GRUWeights } from './gru';

export { walkForward } from './walk-forward';
export type {
  WalkForwardConfig,
  WalkForwardResult,
  FoldResult,
  FitFn,
  PredictFn,
} from './walk-forward';

export {
  lagFeatures,
  rollingMean,
  rollingStd,
  logReturns,
  simpleReturns,
  zScore,
  minMaxScale,
  diff,
} from './feature-engineer';

export { trainHMM, viterbi } from './hmm-regime';
export type { HMMParams } from './hmm-regime';
