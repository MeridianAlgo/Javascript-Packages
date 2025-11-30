/**
 * Seasonality detection
 */

import { Bar, Series } from '@meridianalgo/core';

export class SeasonalityIndicators {
  /**
   * Day of week effect
   * Returns average return for each day of week (0=Sunday, 6=Saturday)
   */
  static dayOfWeekEffect(bars: Bar[]): Record<number, number> {
    const dayReturns: Record<number, number[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };
    
    for (let i = 1; i < bars.length; i++) {
      const dayOfWeek = bars[i].t.getDay();
      const ret = (bars[i].c - bars[i - 1].c) / bars[i - 1].c;
      dayReturns[dayOfWeek].push(ret);
    }
    
    const avgReturns: Record<number, number> = {};
    for (let day = 0; day < 7; day++) {
      const returns = dayReturns[day];
      avgReturns[day] = returns.length > 0
        ? returns.reduce((a, b) => a + b, 0) / returns.length
        : 0;
    }
    
    return avgReturns;
  }
  
  /**
   * Month-end effect
   * Detects if returns are higher near month end
   */
  static monthEndEffect(bars: Bar[], daysBeforeEnd: number = 3): {
    monthEndReturn: number;
    otherDaysReturn: number;
    effect: number;
  } {
    const monthEndReturns: number[] = [];
    const otherReturns: number[] = [];
    
    for (let i = 1; i < bars.length; i++) {
      const date = bars[i].t;
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const dayOfMonth = date.getDate();
      
      const ret = (bars[i].c - bars[i - 1].c) / bars[i - 1].c;
      
      if (dayOfMonth > daysInMonth - daysBeforeEnd) {
        monthEndReturns.push(ret);
      } else {
        otherReturns.push(ret);
      }
    }
    
    const monthEndReturn = monthEndReturns.length > 0
      ? monthEndReturns.reduce((a, b) => a + b, 0) / monthEndReturns.length
      : 0;
    
    const otherDaysReturn = otherReturns.length > 0
      ? otherReturns.reduce((a, b) => a + b, 0) / otherReturns.length
      : 0;
    
    return {
      monthEndReturn,
      otherDaysReturn,
      effect: monthEndReturn - otherDaysReturn
    };
  }
  
  /**
   * Holiday effect
   * Detects returns around major US holidays
   */
  static holidayEffect(bars: Bar[]): {
    preHolidayReturn: number;
    postHolidayReturn: number;
    normalReturn: number;
  } {
    const preHolidayReturns: number[] = [];
    const postHolidayReturns: number[] = [];
    const normalReturns: number[] = [];
    
    // Major US holidays (approximate dates)
    const holidays = [
      { month: 0, day: 1 },   // New Year
      { month: 6, day: 4 },   // Independence Day
      { month: 10, day: 24 }, // Thanksgiving (approximate)
      { month: 11, day: 25 }  // Christmas
    ];
    
    for (let i = 1; i < bars.length; i++) {
      const date = bars[i].t;
      const ret = (bars[i].c - bars[i - 1].c) / bars[i - 1].c;
      
      let isNearHoliday = false;
      let isPreHoliday = false;
      let isPostHoliday = false;
      
      for (const holiday of holidays) {
        const daysDiff = this.daysDifference(
          date,
          new Date(date.getFullYear(), holiday.month, holiday.day)
        );
        
        if (Math.abs(daysDiff) <= 2) {
          isNearHoliday = true;
          if (daysDiff === -1) isPreHoliday = true;
          if (daysDiff === 1) isPostHoliday = true;
        }
      }
      
      if (isPreHoliday) {
        preHolidayReturns.push(ret);
      } else if (isPostHoliday) {
        postHolidayReturns.push(ret);
      } else if (!isNearHoliday) {
        normalReturns.push(ret);
      }
    }
    
    return {
      preHolidayReturn: preHolidayReturns.length > 0
        ? preHolidayReturns.reduce((a, b) => a + b, 0) / preHolidayReturns.length
        : 0,
      postHolidayReturn: postHolidayReturns.length > 0
        ? postHolidayReturns.reduce((a, b) => a + b, 0) / postHolidayReturns.length
        : 0,
      normalReturn: normalReturns.length > 0
        ? normalReturns.reduce((a, b) => a + b, 0) / normalReturns.length
        : 0
    };
  }
  
  /**
   * Earnings window effect
   * Detects if there's a pattern around typical earnings dates
   */
  static earningsWindowEffect(bars: Bar[], earningsDates: Date[]): {
    preEarningsReturn: number;
    postEarningsReturn: number;
    normalReturn: number;
  } {
    const preEarningsReturns: number[] = [];
    const postEarningsReturns: number[] = [];
    const normalReturns: number[] = [];
    
    for (let i = 1; i < bars.length; i++) {
      const date = bars[i].t;
      const ret = (bars[i].c - bars[i - 1].c) / bars[i - 1].c;
      
      let isNearEarnings = false;
      let isPreEarnings = false;
      let isPostEarnings = false;
      
      for (const earningsDate of earningsDates) {
        const daysDiff = this.daysDifference(date, earningsDate);
        
        if (Math.abs(daysDiff) <= 5) {
          isNearEarnings = true;
          if (daysDiff >= -5 && daysDiff < 0) isPreEarnings = true;
          if (daysDiff > 0 && daysDiff <= 5) isPostEarnings = true;
        }
      }
      
      if (isPreEarnings) {
        preEarningsReturns.push(ret);
      } else if (isPostEarnings) {
        postEarningsReturns.push(ret);
      } else if (!isNearEarnings) {
        normalReturns.push(ret);
      }
    }
    
    return {
      preEarningsReturn: preEarningsReturns.length > 0
        ? preEarningsReturns.reduce((a, b) => a + b, 0) / preEarningsReturns.length
        : 0,
      postEarningsReturn: postEarningsReturns.length > 0
        ? postEarningsReturns.reduce((a, b) => a + b, 0) / postEarningsReturns.length
        : 0,
      normalReturn: normalReturns.length > 0
        ? normalReturns.reduce((a, b) => a + b, 0) / normalReturns.length
        : 0
    };
  }
  
  /**
   * Intraday seasonality (for intraday data)
   * Returns average return for each hour of the day
   */
  static intradaySeasonality(bars: Bar[]): Record<number, number> {
    const hourReturns: Record<number, number[]> = {};
    for (let h = 0; h < 24; h++) {
      hourReturns[h] = [];
    }
    
    for (let i = 1; i < bars.length; i++) {
      const hour = bars[i].t.getHours();
      const ret = (bars[i].c - bars[i - 1].c) / bars[i - 1].c;
      hourReturns[hour].push(ret);
    }
    
    const avgReturns: Record<number, number> = {};
    for (let hour = 0; hour < 24; hour++) {
      const returns = hourReturns[hour];
      avgReturns[hour] = returns.length > 0
        ? returns.reduce((a, b) => a + b, 0) / returns.length
        : 0;
    }
    
    return avgReturns;
  }
  
  /**
   * Helper: Calculate days difference between two dates
   */
  private static daysDifference(date1: Date, date2: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((date1.getTime() - date2.getTime()) / msPerDay);
  }
}
