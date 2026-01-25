/**
 * Execution types
 */

import { Order, Fill, Position, StreamSubscription } from '../core';

export { Order, Fill, Position, StreamSubscription };

export interface BrokerAdapter {
  id: string;
  placeOrder(order: Order): Promise<OrderResponse>;
  cancelOrder(orderId: string): Promise<void>;
  getOrder(orderId: string): Promise<OrderStatus>;
  getPositions(): Promise<Position[]>;
  getAccount(): Promise<AccountInfo>;
  subscribeOrders?(callback: (event: OrderEvent) => void): StreamSubscription;
}

export interface OrderResponse {
  orderId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
}

export interface OrderStatus {
  orderId: string;
  status: 'pending' | 'open' | 'filled' | 'partial' | 'cancelled' | 'rejected';
  filledQty: number;
  remainingQty: number;
  avgFillPrice?: number;
  fills: Fill[];
}

export interface AccountInfo {
  equity: number;
  cash: number;
  buyingPower: number;
  marginUsed: number;
  positions: Position[];
}

export interface OrderEvent {
  type: 'new' | 'fill' | 'partial' | 'cancel' | 'reject';
  order: Order;
  fill?: Fill;
  reason?: string;
  ts: Date;
}

export interface RiskLimits {
  maxPositions?: number;
  maxPositionSize?: number;
  maxLeverage?: number;
  maxDailyLoss?: number;
  allowedSymbols?: string[];
}
