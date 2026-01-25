/**
 * Strategy types
 */

import { Bar, Signal } from '../core';

export interface Strategy {
  id: string;
  
  // Initialize strategy with historical data
  init?(bars: Bar[]): void;
  
  // Generate signal for new bar
  next(bar: Bar): Signal | null;
  
  // Batch generate signals
  generate?(bars: Bar[]): Signal[];
  
  // Get current positions/state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getState?(): Record<string, any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StrategyFactory = (params: any) => Strategy;

