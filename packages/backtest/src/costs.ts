/**
 * Cost models for backtesting
 */

import { Order, OrderSide } from '@meridianalgo/core';
import { CommissionModel, SlippageModel } from './types';

export class FixedCommission implements CommissionModel {
  constructor(private fee: number) {}
  
  calculate(): number {
    return this.fee;
  }
}

export class PercentageCommission implements CommissionModel {
  constructor(private rate: number) {}
  
  calculate(trade: { qty: number; price: number; side: OrderSide }): number {
    return trade.qty * trade.price * this.rate;
  }
}

export class FixedSlippage implements SlippageModel {
  constructor(private bps: number) {}
  
  calculate(order: Order, marketPrice: number): number {
    const slippageAmount = marketPrice * (this.bps / 10000);
    return order.side === 'buy' ? slippageAmount : -slippageAmount;
  }
}

export class VolumeSlippage implements SlippageModel {
  constructor(private impactCoeff: number) {}
  
  calculate(order: Order, marketPrice: number): number {
    // Simple market impact model
    const impact = this.impactCoeff * Math.sqrt(order.qty);
    const slippageAmount = marketPrice * (impact / 10000);
    return order.side === 'buy' ? slippageAmount : -slippageAmount;
  }
}

/**
 * Borrow fee model for short positions
 */
export interface BorrowFeeModel {
  calculate(qty: number, price: number, daysHeld: number): number;
}

export class FixedBorrowFee implements BorrowFeeModel {
  constructor(private annualRate: number) {}
  
  calculate(qty: number, price: number, daysHeld: number): number {
    const notional = qty * price;
    return notional * this.annualRate * (daysHeld / 365);
  }
}

export class TieredBorrowFee implements BorrowFeeModel {
  constructor(
    private tiers: Array<{ threshold: number; rate: number }>
  ) {
    // Sort tiers by threshold
    this.tiers.sort((a, b) => a.threshold - b.threshold);
  }
  
  calculate(qty: number, price: number, daysHeld: number): number {
    const notional = qty * price;
    
    // Find applicable rate
    let rate = this.tiers[0].rate;
    for (const tier of this.tiers) {
      if (notional >= tier.threshold) {
        rate = tier.rate;
      }
    }
    
    return notional * rate * (daysHeld / 365);
  }
}
