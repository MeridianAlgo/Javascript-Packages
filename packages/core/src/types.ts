/**
 * Core types for MeridianAlgo framework
 */

// Bar data structure (OHLCV)
export interface Bar {
  t: Date;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  symbol?: string;
}

// Time series data
export type Series = number[];

// Signal structure
export interface Signal {
  t: Date;
  value: number;  // -1 (sell), 0 (neutral), +1 (buy), or continuous
  strength?: number;
  meta?: Record<string, unknown>;
}

// Order types
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type TimeInForce = 'day' | 'gtc' | 'ioc' | 'fok';

export interface Order {
  id?: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  type: OrderType;
  price?: number;
  stopPrice?: number;
  tif?: TimeInForce;
  meta?: Record<string, unknown>;
}

// Fill structure
export interface Fill {
  orderId: string;
  symbol: string;
  qty: number;
  price: number;
  ts: Date;
  commission?: number;
}

// Position tracking
export interface Position {
  symbol: string;
  qty: number;
  avgPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

// Portfolio snapshot
export interface PortfolioSnapshot {
  ts: Date;
  equity: number;
  cash: number;
  positions: Record<string, Position>;
  leverage?: number;
}
