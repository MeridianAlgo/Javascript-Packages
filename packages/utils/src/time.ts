/**
 * Time and calendar utilities
 */

import { Bar } from '@meridianalgo/core';

export class TimeUtils {
  /**
   * Check if market is open
   * Simplified - assumes US market hours (9:30 AM - 4:00 PM ET)
   */
  static isMarketOpen(date: Date, exchange: string = 'NYSE'): boolean {
    // Check if weekend
    const day = date.getDay();
    if (day === 0 || day === 6) return false;
    
    // Check if holiday (simplified - major US holidays)
    if (this.isHoliday(date, exchange)) return false;
    
    // Check market hours (simplified - assumes ET timezone)
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const time = hours * 60 + minutes;
    
    // 9:30 AM = 570 minutes, 4:00 PM = 960 minutes
    return time >= 570 && time < 960;
  }
  
  /**
   * Get next market open time
   */
  static nextMarketOpen(date: Date, exchange: string = 'NYSE'): Date {
    const next = new Date(date);
    
    // If it's a weekend, move to Monday
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1);
    }
    
    // Set to 9:30 AM
    next.setHours(9, 30, 0, 0);
    
    // If we're past market close, move to next day
    if (date.getHours() >= 16) {
      next.setDate(next.getDate() + 1);
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1);
      }
    }
    
    // Skip holidays
    while (this.isHoliday(next, exchange)) {
      next.setDate(next.getDate() + 1);
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1);
      }
    }
    
    return next;
  }
  
  /**
   * Count trading days between two dates
   */
  static tradingDays(start: Date, end: Date, exchange: string = 'NYSE'): number {
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      if (this.isMarketOpen(current, exchange)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
  
  /**
   * Check if date is a holiday
   * Simplified - major US holidays only
   */
  static isHoliday(date: Date, exchange: string = 'NYSE'): boolean {
    const month = date.getMonth();
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    
    // New Year's Day
    if (month === 0 && day === 1) return true;
    
    // Martin Luther King Jr. Day (3rd Monday in January)
    if (month === 0 && dayOfWeek === 1 && day >= 15 && day <= 21) return true;
    
    // Presidents' Day (3rd Monday in February)
    if (month === 1 && dayOfWeek === 1 && day >= 15 && day <= 21) return true;
    
    // Good Friday (approximate - Friday before Easter)
    // Simplified: skip complex Easter calculation
    
    // Memorial Day (last Monday in May)
    if (month === 4 && dayOfWeek === 1 && day >= 25) return true;
    
    // Independence Day
    if (month === 6 && day === 4) return true;
    
    // Labor Day (1st Monday in September)
    if (month === 8 && dayOfWeek === 1 && day <= 7) return true;
    
    // Thanksgiving (4th Thursday in November)
    if (month === 10 && dayOfWeek === 4 && day >= 22 && day <= 28) return true;
    
    // Christmas
    if (month === 11 && day === 25) return true;
    
    return false;
  }
  
  /**
   * Resample bars to different timeframe
   */
  static resample(bars: Bar[], interval: string): Bar[] {
    if (bars.length === 0) return [];
    
    const intervalMinutes = this.parseInterval(interval);
    const resampled: Bar[] = [];
    
    let currentBar: Bar | null = null;
    let currentBucket = 0;
    
    for (const bar of bars) {
      const barBucket = Math.floor(bar.t.getTime() / (intervalMinutes * 60 * 1000));
      
      if (currentBar === null || barBucket !== currentBucket) {
        if (currentBar) {
          resampled.push(currentBar);
        }
        
        currentBar = {
          t: new Date(barBucket * intervalMinutes * 60 * 1000),
          o: bar.o,
          h: bar.h,
          l: bar.l,
          c: bar.c,
          v: bar.v,
          symbol: bar.symbol
        };
        currentBucket = barBucket;
      } else {
        // Update current bar
        currentBar.h = Math.max(currentBar.h, bar.h);
        currentBar.l = Math.min(currentBar.l, bar.l);
        currentBar.c = bar.c;
        currentBar.v += bar.v;
      }
    }
    
    if (currentBar) {
      resampled.push(currentBar);
    }
    
    return resampled;
  }
  
  /**
   * Parse interval string to minutes
   */
  private static parseInterval(interval: string): number {
    const match = interval.match(/^(\d+)([mhd])$/);
    if (!match) throw new Error(`Invalid interval: ${interval}`);
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'm': return value;
      case 'h': return value * 60;
      case 'd': return value * 60 * 24;
      default: throw new Error(`Invalid interval unit: ${unit}`);
    }
  }
  
  /**
   * Format date as ISO string (YYYY-MM-DD)
   */
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Parse date string
   */
  static parseDate(dateStr: string): Date {
    return new Date(dateStr);
  }
  
  /**
   * Get start of day
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }
  
  /**
   * Get end of day
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }
  
  /**
   * Add days to date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  /**
   * Add trading days to date
   */
  static addTradingDays(date: Date, days: number, exchange: string = 'NYSE'): Date {
    let result = new Date(date);
    let count = 0;
    
    while (count < days) {
      result = this.addDays(result, 1);
      if (this.isMarketOpen(result, exchange)) {
        count++;
      }
    }
    
    return result;
  }
}
