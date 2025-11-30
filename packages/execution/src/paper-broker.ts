/**
 * Paper trading broker
 */

import { Order, Fill, Position } from '@meridianalgo/core';
import { BrokerAdapter, OrderResponse, OrderStatus, AccountInfo } from './types';

export interface PaperBrokerConfig {
  initialCash: number;
  commission?: number;
  slippageBps?: number;
  latency?: number;
}

export class PaperBroker implements BrokerAdapter {
  id = 'paper';
  
  private cash: number;
  private positions: Map<string, Position> = new Map();
  private orders: Map<string, OrderStatus> = new Map();
  private orderCounter = 0;
  private config: PaperBrokerConfig;
  
  constructor(config: PaperBrokerConfig) {
    this.config = config;
    this.cash = config.initialCash;
  }
  
  async placeOrder(order: Order): Promise<OrderResponse> {
    const orderId = `PAPER-${++this.orderCounter}`;
    
    // Simulate latency
    if (this.config.latency) {
      await new Promise(resolve => setTimeout(resolve, this.config.latency));
    }
    
    // Create order status
    const orderStatus: OrderStatus = {
      orderId,
      status: 'open',
      filledQty: 0,
      remainingQty: order.qty,
      fills: []
    };
    
    this.orders.set(orderId, orderStatus);
    
    // Simulate immediate fill for market orders
    if (order.type === 'market') {
      await this.fillOrder(orderId, order);
    }
    
    return {
      orderId,
      status: 'accepted'
    };
  }
  
  async cancelOrder(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (order && order.status === 'open') {
      order.status = 'cancelled';
    }
  }
  
  async getOrder(orderId: string): Promise<OrderStatus> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    return order;
  }
  
  async getPositions(): Promise<Position[]> {
    return Array.from(this.positions.values());
  }
  
  async getAccount(): Promise<AccountInfo> {
    const positions = Array.from(this.positions.values());
    const equity = this.cash + positions.reduce((sum, p) => sum + p.marketValue, 0);
    
    return {
      equity,
      cash: this.cash,
      buyingPower: this.cash,
      marginUsed: 0,
      positions
    };
  }
  
  private async fillOrder(orderId: string, order: Order): Promise<void> {
    const orderStatus = this.orders.get(orderId);
    if (!orderStatus) return;
    
    // Simulate price with slippage
    const slippage = (this.config.slippageBps || 0) / 10000;
    const fillPrice = order.price || 100; // Use order price or default
    const slippageAmount = fillPrice * slippage * (order.side === 'buy' ? 1 : -1);
    const executionPrice = fillPrice + slippageAmount;
    
    const commission = this.config.commission || 0;
    
    if (order.side === 'buy') {
      const cost = order.qty * executionPrice + commission;
      
      if (cost > this.cash) {
        orderStatus.status = 'rejected';
        return;
      }
      
      this.cash -= cost;
      
      // Update position
      const existing = this.positions.get(order.symbol);
      if (existing) {
        const totalQty = existing.qty + order.qty;
        existing.avgPrice = (existing.avgPrice * existing.qty + executionPrice * order.qty) / totalQty;
        existing.qty = totalQty;
        existing.marketValue = totalQty * executionPrice;
      } else {
        this.positions.set(order.symbol, {
          symbol: order.symbol,
          qty: order.qty,
          avgPrice: executionPrice,
          marketValue: order.qty * executionPrice,
          unrealizedPnl: 0,
          realizedPnl: 0
        });
      }
    } else {
      // Sell
      const existing = this.positions.get(order.symbol);
      if (!existing || existing.qty < order.qty) {
        orderStatus.status = 'rejected';
        return;
      }
      
      const proceeds = order.qty * executionPrice - commission;
      this.cash += proceeds;
      
      const pnl = (executionPrice - existing.avgPrice) * order.qty;
      existing.qty -= order.qty;
      existing.realizedPnl += pnl;
      existing.marketValue = existing.qty * executionPrice;
      
      if (existing.qty === 0) {
        this.positions.delete(order.symbol);
      }
    }
    
    // Record fill
    const fill: Fill = {
      orderId,
      symbol: order.symbol,
      qty: order.qty,
      price: executionPrice,
      ts: new Date(),
      commission
    };
    
    orderStatus.fills.push(fill);
    orderStatus.filledQty = order.qty;
    orderStatus.remainingQty = 0;
    orderStatus.avgFillPrice = executionPrice;
    orderStatus.status = 'filled';
  }
}
