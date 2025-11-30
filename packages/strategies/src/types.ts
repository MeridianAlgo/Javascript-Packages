/**
 * Strategy types
 */

import { Bar, Signal } from '@meridianalgo/core';

export interface Strategy {
  id: string;
  
  // Initialize strategy with historical data
  init?(bars: Bar[]): void;
  
  // Generate signal for new bar
  next(bar: Bar): Signal | null;
  
  // Batch generate signals
  generate?(bars: Bar[]): Signal[];
  
  // Get current positions/state
  getState?(): Record<string, any>;
}

export type StrategyFactory = (params: any) => Strategy;
