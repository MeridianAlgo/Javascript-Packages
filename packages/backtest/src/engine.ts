/**
 * Time-based backtest engine
 */

import { Bar, Position, PortfolioSnapshot } from '@meridianalgo/core';
import { BacktestConfig, BacktestResult, Trade, PerformanceMetrics } from './types';
import { FixedCommission, FixedSlippage } from './costs';

export class TimeBasedEngine {
  private cash: number;
  private positions: Map<string, Position> = new Map();
  private equity: PortfolioSnapshot[] = [];
  private trades: Trade[] = [];
  
  constructor(private config: BacktestConfig) {
    this.cash = config.initialCash;
  }
  
  async run(): Promise<BacktestResult> {
    const { strategy, data } = this.config;
    const commission = this.config.commission || new FixedCommission(1);
    const slippage = this.config.slippage || new FixedSlippage(5);
    
    // Initialize strategy
    if (strategy.init) {
      strategy.init(data);
    }
    
    // Process each bar
    for (let i = 0; i < data.length; i++) {
      const bar = data[i];
      
      // Generate signal
      const signal = strategy.next(bar);
      
      if (signal && signal.value !== 0) {
        // Execute trade
        const side = signal.value > 0 ? 'buy' : 'sell';
        const qty = Math.floor(this.cash * 0.1 / bar.c); // Use 10% of cash
        
        if (qty > 0) {
          const slippageAmount = slippage.calculate(
            { symbol: bar.symbol || 'UNKNOWN', side, qty, type: 'market' },
            bar.c
          );
          const fillPrice = bar.c + slippageAmount;
          const commissionAmount = commission.calculate({ qty, price: fillPrice, side });
          
          if (side === 'buy') {
            const cost = qty * fillPrice + commissionAmount;
            if (cost <= this.cash) {
              this.cash -= cost;
              
              const existing = this.positions.get(bar.symbol || 'UNKNOWN');
              if (existing) {
                existing.qty += qty;
                existing.avgPrice = (existing.avgPrice * (existing.qty - qty) + fillPrice * qty) / existing.qty;
              } else {
                this.positions.set(bar.symbol || 'UNKNOWN', {
                  symbol: bar.symbol || 'UNKNOWN',
                  qty,
                  avgPrice: fillPrice,
                  marketValue: qty * bar.c,
                  unrealizedPnl: 0,
                  realizedPnl: 0
                });
              }
              
              this.trades.push({
                entryTime: bar.t,
                symbol: bar.symbol || 'UNKNOWN',
                side,
                entryPrice: fillPrice,
                qty,
                commission: commissionAmount,
                slippage: slippageAmount
              });
            }
          } else {
            // Sell
            const existing = this.positions.get(bar.symbol || 'UNKNOWN');
            if (existing && existing.qty >= qty) {
              const proceeds = qty * fillPrice - commissionAmount;
              this.cash += proceeds;
              
              const pnl = (fillPrice - existing.avgPrice) * qty - commissionAmount;
              existing.qty -= qty;
              existing.realizedPnl += pnl;
              
              if (existing.qty === 0) {
                this.positions.delete(bar.symbol || 'UNKNOWN');
              }
              
              // Find matching entry trade
              const entryTrade = this.trades.find(t => 
                t.symbol === (bar.symbol || 'UNKNOWN') && 
                t.side === 'buy' && 
                !t.exitTime
              );
              
              if (entryTrade) {
                entryTrade.exitTime = bar.t;
                entryTrade.exitPrice = fillPrice;
                entryTrade.pnl = pnl;
              }
            }
          }
        }
      }
      
      // Update portfolio snapshot
      let totalValue = this.cash;
      const positionsObj: Record<string, Position> = {};
      
      this.positions.forEach((pos, symbol) => {
        pos.marketValue = pos.qty * bar.c;
        pos.unrealizedPnl = (bar.c - pos.avgPrice) * pos.qty;
        totalValue += pos.marketValue;
        positionsObj[symbol] = { ...pos };
      });
      
      this.equity.push({
        ts: bar.t,
        equity: totalValue,
        cash: this.cash,
        positions: positionsObj
      });
    }
    
    // Calculate metrics
    const metrics = this.calculateMetrics();
    
    return {
      equity: this.equity,
      trades: this.trades,
      metrics
    };
  }
  
  private calculateMetrics(): PerformanceMetrics {
    const equityValues = this.equity.map(e => e.equity);
    const initialEquity = this.config.initialCash;
    const finalEquity = equityValues[equityValues.length - 1] || initialEquity;
    
    const totalReturn = (finalEquity - initialEquity) / initialEquity;
    const days = this.equity.length;
    const annualizedReturn = Math.pow(1 + totalReturn, 252 / days) - 1;
    
    // Calculate returns
    const returns: number[] = [];
    for (let i = 1; i < equityValues.length; i++) {
      returns.push((equityValues[i] - equityValues[i - 1]) / equityValues[i - 1]);
    }
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdReturn = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0;
    
    // Max drawdown
    let maxDrawdown = 0;
    let peak = equityValues[0];
    for (const value of equityValues) {
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    
    // Win rate and profit factor
    const completedTrades = this.trades.filter(t => t.pnl !== undefined);
    const winningTrades = completedTrades.filter(t => t.pnl! > 0);
    const losingTrades = completedTrades.filter(t => t.pnl! < 0);
    
    const winRate = completedTrades.length > 0 
      ? winningTrades.length / completedTrades.length 
      : 0;
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl!, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl!, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    
    return {
      totalReturn,
      annualizedReturn,
      sharpeRatio,
      maxDrawdown,
      winRate,
      profitFactor,
      totalTrades: completedTrades.length
    };
  }
}
