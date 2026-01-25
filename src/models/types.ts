/**
 * Model types
 */

export interface Model {
  train(features: number[][], labels: number[]): Promise<void>;
  predict(features: number[][]): Promise<number[]>;
  featureImportance?(): number[];
  save?(path: string): Promise<void>;
  load?(path: string): Promise<void>;
}

export type ModelFactory = (config: any) => Model;

export interface ModelConfig {
  inputShape?: number[];
  outputShape?: number;
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
  validationSplit?: number;
}
