/**
 * Backtest types
 */

import { Bar, Order, Fill, Position, PortfolioSnapshot, OrderSide, PerformanceMetrics } from '../core';
import { Strategy } from '../strategies';

export { Bar, Order, Fill, Position, PortfolioSnapshot, OrderSide, PerformanceMetrics };

export interface BacktestConfig {
  strategy: Strategy;
  data: Bar[];
  initialCash: number;
  commission?: CommissionModel;
  slippage?: SlippageModel;
  startDate?: Date;
  endDate?: Date;
}

export interface BacktestResult {
  equity: PortfolioSnapshot[];
  trades: Trade[];
  metrics: PerformanceMetrics;
}

export interface Trade {
  entryTime: Date;
  exitTime?: Date;
  symbol: string;
  side: OrderSide;
  entryPrice: number;
  exitPrice?: number;
  qty: number;
  pnl?: number;
  commission: number;
  slippage: number;
}

export interface CommissionModel {
  calculate(trade: { qty: number; price: number; side: OrderSide }): number;
}

export interface SlippageModel {
  calculate(order: Order, marketPrice: number): number;
}
