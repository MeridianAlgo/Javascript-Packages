/**
 * Error hierarchy for MeridianAlgo
 */

export class MeridianError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'MeridianError';
  }
}

export class DataError extends MeridianError {
  constructor(message: string) {
    super(message, 'DATA_ERROR');
    this.name = 'DataError';
  }
}

export class StrategyError extends MeridianError {
  constructor(message: string) {
    super(message, 'STRATEGY_ERROR');
    this.name = 'StrategyError';
  }
}

export class ExecutionError extends MeridianError {
  constructor(message: string) {
    super(message, 'EXECUTION_ERROR');
    this.name = 'ExecutionError';
  }
}

export class ValidationError extends MeridianError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
