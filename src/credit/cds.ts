/**
 * Credit Default Swap (CDS) pricing under a piecewise-constant hazard-rate model.
 *
 * Survival probability:  S(t) = exp(-integral_0^t lambda(s) ds)
 *
 * Premium leg PV = sum over coupon dates of:
 *    spread * dcf_i * S(t_i) * D(t_i)
 *
 * Protection leg PV = (1 - R) * integral_0^T D(t) * (-dS/dt) dt
 *   approximated as (1 - R) * sum_i D(t_mid) * (S(t_{i-1}) - S(t_i))
 */

export interface HazardSegment {
  endTime: number;   // segment ends at this time (years)
  lambda: number;    // constant hazard within segment
}

export interface CDSCashflowSchedule {
  paymentTimes: number[];    // accrual end dates (years)
  dayCountFractions: number[]; // dcf for each period
}

export interface CDSInputs {
  schedule: CDSCashflowSchedule;
  recoveryRate: number;
  spread: number;            // annual spread (decimal, e.g. 0.01 = 100 bps)
  hazardCurve: HazardSegment[];
  discountFactor: (t: number) => number;
}

export interface CDSPV {
  premiumLegPV: number;
  protectionLegPV: number;
  netPV: number;
  fairSpread: number;
}

/** Survival probability at time t under the hazard curve. */
export function survivalProbability(curve: HazardSegment[], t: number): number {
  if (t <= 0) return 1;
  let cum = 0;
  let prev = 0;
  for (const seg of curve) {
    if (t <= seg.endTime) {
      cum += seg.lambda * (t - prev);
      return Math.exp(-cum);
    }
    cum += seg.lambda * (seg.endTime - prev);
    prev = seg.endTime;
  }
  // beyond curve: extrapolate flat using last lambda
  const last = curve[curve.length - 1];
  cum += last.lambda * (t - prev);
  return Math.exp(-cum);
}

/** Price a CDS — returns each leg's PV, net PV, and fair-spread. */
export function priceCDS(inputs: CDSInputs): CDSPV {
  const { schedule, recoveryRate, spread, hazardCurve, discountFactor } = inputs;
  const { paymentTimes, dayCountFractions } = schedule;
  if (paymentTimes.length !== dayCountFractions.length)
    throw new Error('priceCDS: schedule lengths mismatch');

  // Premium leg
  let premLeg = 0;
  for (let i = 0; i < paymentTimes.length; i++) {
    const t = paymentTimes[i];
    premLeg += dayCountFractions[i] * survivalProbability(hazardCurve, t) * discountFactor(t);
  }
  // Protection leg — discrete approximation
  let protLeg = 0;
  let prevT = 0;
  for (let i = 0; i < paymentTimes.length; i++) {
    const t = paymentTimes[i];
    const tMid = (prevT + t) / 2;
    const dS = survivalProbability(hazardCurve, prevT) - survivalProbability(hazardCurve, t);
    protLeg += discountFactor(tMid) * dS;
    prevT = t;
  }
  protLeg *= 1 - recoveryRate;

  const fairSpread = premLeg > 0 ? protLeg / premLeg : 0;
  return {
    premiumLegPV: premLeg * spread,
    protectionLegPV: protLeg,
    netPV: protLeg - premLeg * spread,
    fairSpread,
  };
}

/**
 * Bootstrap a piecewise-constant hazard curve from a set of CDS quotes.
 *
 * For each maturity (sorted ascending), solves the par-spread equation for
 * the hazard rate of the new segment, holding earlier segments fixed.
 */
export function bootstrapHazardCurve(
  quotes: { maturity: number; spread: number; recoveryRate: number; schedule: CDSCashflowSchedule }[],
  discountFactor: (t: number) => number
): HazardSegment[] {
  const sorted = [...quotes].sort((a, b) => a.maturity - b.maturity);
  const curve: HazardSegment[] = [];

  for (const quote of sorted) {
    const target = quote.spread;
    // bisection on lambda for new segment
    let lo = 1e-6;
    let hi = 5;
    const evalLambda = (lambda: number): number => {
      const trial = [...curve, { endTime: quote.maturity, lambda }];
      const pv = priceCDS({
        schedule: quote.schedule,
        recoveryRate: quote.recoveryRate,
        spread: target,
        hazardCurve: trial,
        discountFactor,
      });
      return pv.netPV;
    };
    let fLo = evalLambda(lo);
    let fHi = evalLambda(hi);
    if (fLo * fHi > 0) {
      // expand bracket
      let attempts = 0;
      while (fLo * fHi > 0 && attempts < 30) {
        hi *= 2;
        fHi = evalLambda(hi);
        attempts++;
      }
      if (fLo * fHi > 0) throw new Error('bootstrapHazardCurve: cannot bracket lambda');
    }
    let mid = (lo + hi) / 2;
    for (let i = 0; i < 100; i++) {
      mid = (lo + hi) / 2;
      const fMid = evalLambda(mid);
      if (Math.abs(fMid) < 1e-10) break;
      if (fLo * fMid < 0) {
        hi = mid;
        fHi = fMid;
      } else {
        lo = mid;
        fLo = fMid;
      }
    }
    curve.push({ endTime: quote.maturity, lambda: mid });
  }
  return curve;
}
