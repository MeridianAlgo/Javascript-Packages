/**
 * Indicators plugin for MeridianAlgo
 */

import { MeridianPlugin } from '@meridianalgo/core';
import { Indicators } from './indicators';
import { VolumeIndicators } from './volume';
import { MomentumIndicators } from './momentum';
import { VolatilityIndicators } from './volatility';
import { PatternRecognition } from './patterns';

export const indicatorsPlugin: MeridianPlugin = {
  id: 'indicators',
  version: '2.0.0',
  provides: {
    indicators: {
      // Moving averages
      sma: Indicators.sma,
      ema: Indicators.ema,
      wma: Indicators.wma,
      dema: Indicators.dema,
      tema: Indicators.tema,
      kama: Indicators.kama,
      t3: Indicators.t3,
      
      // Oscillators
      rsi: Indicators.rsi,
      macd: Indicators.macd,
      stochastic: Indicators.stochastic,
      williamsR: Indicators.williamsR,
      cci: Indicators.cci,
      adx: Indicators.adx,
      
      // Volatility
      bollingerBands: Indicators.bollingerBands,
      atr: Indicators.atr,
      donchianChannels: Indicators.donchianChannels,
      
      // Volume
      vwap: VolumeIndicators.vwap,
      vwma: VolumeIndicators.vwma,
      mfi: VolumeIndicators.mfi,
      cmf: VolumeIndicators.cmf,
      obv: Indicators.obv,
      vpt: VolumeIndicators.vpt,
      nvi: VolumeIndicators.nvi,
      pvi: VolumeIndicators.pvi,
      emv: VolumeIndicators.emv,
      volumeOscillator: VolumeIndicators.volumeOscillator,
      
      // Momentum
      roc: MomentumIndicators.roc,
      momentum: MomentumIndicators.momentum,
      cmo: MomentumIndicators.cmo,
      rvi: MomentumIndicators.rvi,
      ppo: MomentumIndicators.ppo,
      pvo: MomentumIndicators.pvo,
      dpo: MomentumIndicators.dpo,
      
      // Volatility indicators
      keltnerChannels: VolatilityIndicators.keltnerChannels,
      standardDeviation: VolatilityIndicators.standardDeviation,
      historicalVolatility: VolatilityIndicators.historicalVolatility,
      
      // Patterns
      detectDoji: PatternRecognition.detectDoji,
      detectHammer: PatternRecognition.detectHammer,
      detectShootingStar: PatternRecognition.detectShootingStar,
      detectBullishEngulfing: PatternRecognition.detectBullishEngulfing,
      detectBearishEngulfing: PatternRecognition.detectBearishEngulfing,
      detectAllPatterns: PatternRecognition.detectAllPatterns
    }
  }
};
