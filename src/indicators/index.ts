/**
 * ../indicators - Technical indicators
 */

export { Indicators, IndicatorError } from './indicators';
export { VolumeIndicators } from './volume';
export { MomentumIndicators } from './momentum';
export { VolatilityIndicators } from './volatility';
export { PerformanceCalculators } from './performance';
export { PatternRecognition } from './patterns';
export type { Candlestick, PatternResult } from './patterns';
export { indicatorsPlugin } from './plugin';

// Advanced indicators
export { AdvancedVolatilityIndicators } from './advanced-volatility';
export type { GarchResult, GarchOptions } from './advanced-volatility';
export { RegimeIndicators } from './regime-detection';
export type { RegimeResult } from './regime-detection';
export { MicrostructureIndicators } from './microstructure';
export { FeatureEngineering } from './feature-engineering';
export { SeasonalityIndicators } from './seasonality';

// Candlestick patterns
export {
  detectDoji,
  detectHammer,
  detectShootingStar,
  detectBullishEngulfing,
  detectBearishEngulfing,
  detectMorningStar,
  detectEveningStar,
  detectThreeWhiteSoldiers,
  detectThreeBlackCrows,
  detectHangingMan,
  detectMarubozu,
  detectSpinningTop,
  detectPiercingLine,
  detectDarkCloudCover,
  detectTweezerTop,
  detectTweezerBottom,
  detectAllPatterns,
} from './candlestick';

// Streaming indicators (incremental nextValue/replace API)
export {
  StreamingSMA,
  StreamingEMA,
  StreamingRSI,
  StreamingMACD,
  StreamingBollinger,
} from './streaming';
export type { StreamingIndicator } from './streaming';

// Advanced indicators (Ichimoku, Supertrend, Donchian, Keltner, etc.)
export {
  ichimoku,
  supertrend,
  donchianChannels,
  keltnerChannels,
  aroon,
  choppinessIndex,
  connorsRSI,
  massIndex,
  fisherTransform,
  coppockCurve,
  dpo,
  elderRay,
  pivotPoints,
} from './advanced';
export type {
  IchimokuResult,
  SupertrendResult,
  DonchianResult,
  PivotLevels,
} from './advanced';

