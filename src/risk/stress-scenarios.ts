/**
 * Named historical stress scenarios.
 * Returns multipliers / shock vectors to apply to a portfolio's exposures.
 *
 * Sources: aggregate move statistics from publicly known crisis windows.
 */

export interface StressScenario {
  name: string;
  description: string;
  /** Multiplicative shock to equity (e.g. -0.40 = -40%). */
  equityShock: number;
  /** Bp parallel shift on rates (e.g. -150 = rates fall 150bp). */
  rateShockBp: number;
  /** Multiplicative shock to credit spreads (e.g. 3.0 = spreads triple). */
  creditSpreadMultiplier: number;
  /** Vol regime multiplier (e.g. 3.0 = vol triples). */
  volMultiplier: number;
  /** USD index shock (multiplicative). */
  usdShock: number;
}

export const STRESS_SCENARIOS: Record<string, StressScenario> = {
  '2008-crisis': {
    name: '2008 Global Financial Crisis',
    description: 'Sep 2008 - Mar 2009. Lehman bankruptcy, banking system stress.',
    equityShock: -0.50,
    rateShockBp: -300,
    creditSpreadMultiplier: 4.0,
    volMultiplier: 3.5,
    usdShock: 0.10,
  },
  'covid-crash': {
    name: 'COVID-19 Crash',
    description: 'Feb-Mar 2020. Pandemic shutdown selloff.',
    equityShock: -0.34,
    rateShockBp: -150,
    creditSpreadMultiplier: 3.5,
    volMultiplier: 4.0,
    usdShock: 0.06,
  },
  'dot-com': {
    name: 'Dot-Com Bust',
    description: '2000-2002. Tech equity collapse.',
    equityShock: -0.49,
    rateShockBp: -475,
    creditSpreadMultiplier: 2.5,
    volMultiplier: 2.0,
    usdShock: 0.05,
  },
  'black-monday': {
    name: 'Black Monday 1987',
    description: 'Oct 19, 1987. Single-day equity crash.',
    equityShock: -0.22,
    rateShockBp: -50,
    creditSpreadMultiplier: 2.0,
    volMultiplier: 5.0,
    usdShock: -0.02,
  },
  'taper-tantrum': {
    name: 'Taper Tantrum 2013',
    description: 'May-Sep 2013. Fed tapering signal.',
    equityShock: -0.06,
    rateShockBp: 100,
    creditSpreadMultiplier: 1.4,
    volMultiplier: 1.8,
    usdShock: 0.04,
  },
  'asian-crisis': {
    name: '1997 Asian Financial Crisis',
    description: 'Jul 1997 - Jan 1998. EM currency / banking crisis.',
    equityShock: -0.30,
    rateShockBp: 200,
    creditSpreadMultiplier: 3.0,
    volMultiplier: 2.5,
    usdShock: 0.15,
  },
  'lehman-week': {
    name: 'Lehman Week (Sep 14-19, 2008)',
    description: 'Acute liquidity crisis week.',
    equityShock: -0.20,
    rateShockBp: -50,
    creditSpreadMultiplier: 5.0,
    volMultiplier: 4.5,
    usdShock: 0.05,
  },
};

export function listStressScenarios(): string[] {
  return Object.keys(STRESS_SCENARIOS);
}

export function getStressScenario(name: string): StressScenario {
  const s = STRESS_SCENARIOS[name];
  if (!s) throw new Error(`Unknown stress scenario: ${name}. Available: ${listStressScenarios().join(', ')}`);
  return s;
}

export interface PortfolioExposures {
  equity?: number;
  rateDuration?: number;        // dollar-duration (negative for short)
  creditSpreadDuration?: number;
  volExposure?: number;         // long-vol notional
  usdExposure?: number;
}

/** Apply a named stress scenario to portfolio exposures. Returns P&L. */
export function applyStressScenario(
  exposures: PortfolioExposures,
  scenarioName: string
): { pnl: number; breakdown: Record<string, number> } {
  const s = getStressScenario(scenarioName);
  const equityPnl = (exposures.equity ?? 0) * s.equityShock;
  const ratePnl = -(exposures.rateDuration ?? 0) * (s.rateShockBp / 10000);
  const creditPnl = -(exposures.creditSpreadDuration ?? 0) * (s.creditSpreadMultiplier - 1);
  const volPnl = (exposures.volExposure ?? 0) * (s.volMultiplier - 1);
  const fxPnl = (exposures.usdExposure ?? 0) * s.usdShock;
  const breakdown = {
    equity: equityPnl,
    rates: ratePnl,
    credit: creditPnl,
    vol: volPnl,
    fx: fxPnl,
  };
  return { pnl: equityPnl + ratePnl + creditPnl + volPnl + fxPnl, breakdown };
}
