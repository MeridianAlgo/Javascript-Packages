import {
  detectDoji,
  detectHammer,
  detectBullishEngulfing,
  detectBearishEngulfing,
  detectThreeWhiteSoldiers,
  detectMarubozu,
  detectAllPatterns,
} from '../src/indicators/candlestick';

describe('Candlestick patterns', () => {
  test('Doji: tiny body relative to range', () => {
    const out = detectDoji([
      { open: 100, high: 102, low: 98, close: 100.05 }, // doji
      { open: 100, high: 102, low: 98, close: 101.5 },  // not doji
    ]);
    expect(out[0]).toBe(1);
    expect(out[1]).toBe(0);
  });

  test('Hammer: long lower shadow', () => {
    const out = detectHammer([
      { open: 100, high: 100.5, low: 95, close: 100.2 }, // body=0.2, low shadow=4.8 -> hammer
      { open: 100, high: 105, low: 99, close: 104 },     // not hammer
    ]);
    expect(out[0]).toBe(1);
    expect(out[1]).toBe(0);
  });

  test('Bullish engulfing', () => {
    const out = detectBullishEngulfing([
      { open: 102, high: 103, low: 99, close: 100 },   // bear
      { open: 99, high: 105, low: 98, close: 103 },    // bull engulfs
    ]);
    expect(out[1]).toBe(1);
  });

  test('Bearish engulfing', () => {
    const out = detectBearishEngulfing([
      { open: 100, high: 103, low: 99, close: 102 },   // bull
      { open: 103, high: 104, low: 98, close: 99 },    // bear engulfs
    ]);
    expect(out[1]).toBe(-1);
  });

  test('Three white soldiers', () => {
    const out = detectThreeWhiteSoldiers([
      { open: 100, high: 102, low: 99, close: 101 },
      { open: 101, high: 104, low: 100, close: 103 },
      { open: 103, high: 106, low: 102, close: 105 },
    ]);
    expect(out[2]).toBe(1);
  });

  test('Marubozu: full body', () => {
    const out = detectMarubozu([
      { open: 100, high: 105, low: 100, close: 105 },   // bullish marubozu
      { open: 100, high: 100, low: 95, close: 95 },     // bearish marubozu
    ]);
    expect(out[0]).toBe(1);
    expect(out[1]).toBe(-1);
  });

  test('detectAllPatterns returns map', () => {
    const candles = [
      { open: 100, high: 102, low: 98, close: 100.05 },
      { open: 100, high: 105, low: 100, close: 105 },
    ];
    const all = detectAllPatterns(candles);
    expect(all).toHaveProperty('doji');
    expect(all).toHaveProperty('marubozu');
    expect(all.doji[0]).toBe(1);
    expect(all.marubozu[1]).toBe(1);
  });
});
