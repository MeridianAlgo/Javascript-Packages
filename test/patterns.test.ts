import { PatternRecognition, Candlestick } from '../src/patterns';

describe('PatternRecognition', () => {
  const testCandles: Candlestick[] = [
    { open: 100, high: 105, low: 98, close: 102 },
    { open: 102, high: 108, low: 101, close: 106 },
    { open: 106, high: 110, low: 104, close: 108 },
    { open: 108, high: 112, low: 106, close: 110 },
    { open: 110, high: 115, low: 109, close: 113 },
    { open: 113, high: 118, low: 112, close: 116 },
    { open: 116, high: 120, low: 115, close: 118 },
    { open: 118, high: 122, low: 117, close: 120 },
    { open: 120, high: 125, low: 119, close: 123 },
    { open: 123, high: 128, low: 122, close: 126 }
  ];

  const dojiCandle: Candlestick = { open: 100, high: 101, low: 99, close: 100.1 };
  const hammerCandle: Candlestick = { open: 100, high: 101, low: 95, close: 100.5 };
  const shootingStarCandle: Candlestick = { open: 100, high: 105, low: 99.5, close: 100.2 };

  describe('Doji Detection', () => {
    it('detects doji pattern', () => {
      const result = PatternRecognition.detectDoji(dojiCandle);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Doji');
      expect(result?.bullish).toBe(false);
      expect(result?.bearish).toBe(false);
      expect(result?.confidence).toBeGreaterThan(0);
    });

    it('does not detect doji for normal candle', () => {
      const result = PatternRecognition.detectDoji(testCandles[0]);
      expect(result).toBeNull();
    });
  });

  describe('Hammer Detection', () => {
    it('detects hammer pattern', () => {
      const result = PatternRecognition.detectHammer(hammerCandle);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Hammer');
      expect(result?.bullish).toBe(true);
      expect(result?.bearish).toBe(false);
      expect(result?.confidence).toBeGreaterThan(0);
    });

    it('does not detect hammer for normal candle', () => {
      const result = PatternRecognition.detectHammer(testCandles[0]);
      expect(result).toBeNull();
    });
  });

  describe('Shooting Star Detection', () => {
    it('detects shooting star pattern', () => {
      const result = PatternRecognition.detectShootingStar(shootingStarCandle);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Shooting Star');
      expect(result?.bullish).toBe(false);
      expect(result?.bearish).toBe(true);
      expect(result?.confidence).toBeGreaterThan(0);
    });

    it('does not detect shooting star for normal candle', () => {
      const result = PatternRecognition.detectShootingStar(testCandles[0]);
      expect(result).toBeNull();
    });
  });

  describe('Engulfing Patterns', () => {
    const bearishCandle: Candlestick = { open: 105, high: 106, low: 102, close: 103 };
    const bullishCandle: Candlestick = { open: 100, high: 110, low: 99, close: 109 };
    const smallBullishCandle: Candlestick = { open: 102, high: 103, low: 101, close: 102.5 };
    const largeBearishCandle: Candlestick = { open: 103, high: 110, low: 99, close: 101 };

    it('detects bullish engulfing', () => {
      const result = PatternRecognition.detectBullishEngulfing(bearishCandle, bullishCandle);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Bullish Engulfing');
      expect(result?.bullish).toBe(true);
      expect(result?.bearish).toBe(false);
    });

    it('detects bearish engulfing', () => {
      const result = PatternRecognition.detectBearishEngulfing(smallBullishCandle, largeBearishCandle);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Bearish Engulfing');
      expect(result?.bullish).toBe(false);
      expect(result?.bearish).toBe(true);
    });

    it('does not detect engulfing for non-engulfing candles', () => {
      const result = PatternRecognition.detectBullishEngulfing(testCandles[0], testCandles[1]);
      expect(result).toBeNull();
    });
  });

  describe('Three Candle Patterns', () => {
    const morningStarCandles: Candlestick[] = [
      { open: 100, high: 100.5, low: 99, close: 99.1 }, // Bearish - large body
      { open: 99.1, high: 99.2, low: 99, close: 99.15 }, // Small body (doji-like)
      { open: 99.15, high: 105, low: 99, close: 104 } // Bullish
    ];

    const eveningStarCandles: Candlestick[] = [
      { open: 100, high: 105, low: 99, close: 104 }, // Bullish
      { open: 104, high: 105, low: 103.5, close: 104.2 }, // Small body (doji-like)
      { open: 104.2, high: 105, low: 100, close: 101 } // Bearish
    ];

    it('detects morning star pattern', () => {
      const result = PatternRecognition.detectMorningStar(morningStarCandles);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Morning Star');
      expect(result?.bullish).toBe(true);
      expect(result?.bearish).toBe(false);
    });

    it('detects evening star pattern', () => {
      const result = PatternRecognition.detectEveningStar(eveningStarCandles);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Evening Star');
      expect(result?.bullish).toBe(false);
      expect(result?.bearish).toBe(true);
    });

    it('does not detect patterns with insufficient candles', () => {
      const result = PatternRecognition.detectMorningStar([testCandles[0], testCandles[1]]);
      expect(result).toBeNull();
    });
  });

  describe('Harami Patterns', () => {
    const largeBearishCandle: Candlestick = { open: 105, high: 106, low: 100, close: 101 };
    const smallBullishCandle: Candlestick = { open: 101.5, high: 102.5, low: 101, close: 102 };

    const largeBullishCandle: Candlestick = { open: 100, high: 105, low: 99, close: 104 };
    const smallBearishCandle: Candlestick = { open: 103.5, high: 104, low: 102.5, close: 103 };

    it('detects bullish harami', () => {
      const result = PatternRecognition.detectBullishHarami(largeBearishCandle, smallBullishCandle);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Bullish Harami');
      expect(result?.bullish).toBe(true);
      expect(result?.bearish).toBe(false);
    });

    it('detects bearish harami', () => {
      const result = PatternRecognition.detectBearishHarami(largeBullishCandle, smallBearishCandle);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Bearish Harami');
      expect(result?.bullish).toBe(false);
      expect(result?.bearish).toBe(true);
    });
  });

  describe('Three White Soldiers / Black Crows', () => {
    const threeWhiteSoldiers: Candlestick[] = [
      { open: 100, high: 105, low: 99, close: 104 },
      { open: 104, high: 108, low: 103, close: 107 },
      { open: 107, high: 111, low: 106, close: 110 }
    ];

    const threeBlackCrows: Candlestick[] = [
      { open: 110, high: 111, low: 105, close: 106 },
      { open: 106, high: 107, low: 101, close: 102 },
      { open: 102, high: 103, low: 97, close: 98 }
    ];

    it('detects three white soldiers', () => {
      const result = PatternRecognition.detectThreeWhiteSoldiers(threeWhiteSoldiers);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Three White Soldiers');
      expect(result?.bullish).toBe(true);
      expect(result?.bearish).toBe(false);
    });

    it('detects three black crows', () => {
      const result = PatternRecognition.detectThreeBlackCrows(threeBlackCrows);
      
      expect(result).not.toBeNull();
      expect(result?.pattern).toBe('Three Black Crows');
      expect(result?.bullish).toBe(false);
      expect(result?.bearish).toBe(true);
    });
  });

  describe('Detect All Patterns', () => {
    it('detects multiple patterns in a series', () => {
      const mixedCandles: Candlestick[] = [
        { open: 100, high: 105, low: 98, close: 102 },
        { open: 102, high: 108, low: 101, close: 106 },
        { open: 106, high: 110, low: 104, close: 108 },
        { open: 108, high: 112, low: 106, close: 110 },
        { open: 110, high: 115, low: 109, close: 113 },
        { open: 113, high: 118, low: 112, close: 116 },
        { open: 116, high: 120, low: 115, close: 118 },
        { open: 118, high: 122, low: 117, close: 120 },
        { open: 120, high: 125, low: 119, close: 123 },
        { open: 123, high: 128, low: 122, close: 126 }
      ];

      const patterns = PatternRecognition.detectAllPatterns(mixedCandles);
      
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThanOrEqual(0);
      
      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('pattern');
        expect(pattern).toHaveProperty('bullish');
        expect(pattern).toHaveProperty('bearish');
        expect(pattern).toHaveProperty('confidence');
        expect(pattern).toHaveProperty('description');
        expect(typeof pattern.pattern).toBe('string');
        expect(typeof pattern.bullish).toBe('boolean');
        expect(typeof pattern.bearish).toBe('boolean');
        expect(typeof pattern.confidence).toBe('number');
        expect(typeof pattern.description).toBe('string');
      });
    });

    it('handles empty candle array', () => {
      const patterns = PatternRecognition.detectAllPatterns([]);
      expect(patterns).toEqual([]);
    });

    it('handles single candle', () => {
      const patterns = PatternRecognition.detectAllPatterns([testCandles[0]]);
      expect(Array.isArray(patterns)).toBe(true);
    });
  });
});
