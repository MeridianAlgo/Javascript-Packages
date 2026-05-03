/**
 * Portfolio expected credit loss.
 *   EL = PD * LGD * EAD
 *
 * For multiple exposures, sum independent ELs.
 */

export interface CreditExposure {
  pd: number;   // probability of default in [0,1]
  lgd: number;  // loss given default in [0,1]
  ead: number;  // exposure at default (currency)
}

export function expectedLoss(exposure: CreditExposure): number {
  return exposure.pd * exposure.lgd * exposure.ead;
}

export function portfolioExpectedLoss(exposures: readonly CreditExposure[]): number {
  return exposures.reduce((s, e) => s + expectedLoss(e), 0);
}

/**
 * Credit spread implied by PD/LGD over horizon T (continuous).
 * Approximation: spread ≈ PD * LGD / T (for small PD).
 * Exact:         spread = -ln(1 - PD * LGD) / T
 */
export function impliedCreditSpread(pd: number, lgd: number, T: number): number {
  if (T <= 0) throw new Error('impliedCreditSpread: T must be > 0');
  const lossFrac = pd * lgd;
  if (lossFrac >= 1) return Infinity;
  return -Math.log(1 - lossFrac) / T;
}

/**
 * PD implied from a credit spread.
 * pd = (1 - exp(-spread * T)) / lgd
 */
export function pdFromSpread(spread: number, lgd: number, T: number): number {
  if (lgd <= 0) throw new Error('pdFromSpread: lgd must be > 0');
  return (1 - Math.exp(-spread * T)) / lgd;
}
