/**
 * Execution algorithms — schedules for slicing parent orders into child orders.
 *
 * Each algorithm produces a Schedule: an ordered list of slices with
 * timing and quantity. Schedules are produced offline (planning); a separate
 * execution layer is responsible for sending child orders to a venue.
 */

export interface OrderSlice {
  /** Index of the slice (0-based). */
  index: number;
  /** Trading-day fraction at which this slice starts (0..1). */
  startFrac: number;
  /** Trading-day fraction at which this slice ends. */
  endFrac: number;
  /** Quantity to execute in this slice (signed: + buy, - sell). */
  qty: number;
  /** Cumulative quantity executed by end of this slice. */
  cumQty: number;
  /** For VWAP/POV: expected market volume share captured. */
  marketShare?: number;
}

export type Schedule = OrderSlice[];

export interface VWAPInputs {
  /** Total order quantity (signed). */
  totalQty: number;
  /** Forecasted volume profile (must sum to 1). */
  volumeProfile: readonly number[];
}

/** VWAP slicing — proportional to forecasted volume profile. */
export function vwapSchedule({ totalQty, volumeProfile }: VWAPInputs): Schedule {
  const n = volumeProfile.length;
  if (n === 0) throw new Error('vwapSchedule: empty volumeProfile');
  const sum = volumeProfile.reduce((s, v) => s + v, 0);
  if (Math.abs(sum - 1) > 1e-6) throw new Error('vwapSchedule: volumeProfile must sum to 1');
  const sched: Schedule = [];
  let cum = 0;
  for (let i = 0; i < n; i++) {
    const qty = totalQty * volumeProfile[i];
    cum += qty;
    sched.push({
      index: i,
      startFrac: i / n,
      endFrac: (i + 1) / n,
      qty,
      cumQty: cum,
      marketShare: volumeProfile[i],
    });
  }
  return sched;
}

export interface TWAPInputs {
  totalQty: number;
  /** Number of equal time-buckets to slice into. */
  buckets: number;
}

/** TWAP slicing — equal quantity per equal-length bucket. */
export function twapSchedule({ totalQty, buckets }: TWAPInputs): Schedule {
  if (buckets <= 0) throw new Error('twapSchedule: buckets must be > 0');
  const sched: Schedule = [];
  const qty = totalQty / buckets;
  let cum = 0;
  for (let i = 0; i < buckets; i++) {
    cum += qty;
    sched.push({
      index: i,
      startFrac: i / buckets,
      endFrac: (i + 1) / buckets,
      qty,
      cumQty: cum,
    });
  }
  return sched;
}

export interface POVInputs {
  totalQty: number;
  /** Participation rate as fraction of market volume (e.g. 0.10 = 10% POV). */
  participation: number;
  /** Forecasted per-bucket market volume. */
  marketVolume: readonly number[];
}

/**
 * Participation-of-Volume — execute at a fraction of market volume.
 * Trades until cumulative qty == totalQty (final slice may be partial).
 */
export function povSchedule({ totalQty, participation, marketVolume }: POVInputs): Schedule {
  if (participation <= 0 || participation > 1) throw new Error('povSchedule: participation must be in (0,1]');
  const sched: Schedule = [];
  const sign = totalQty >= 0 ? 1 : -1;
  let remaining = Math.abs(totalQty);
  const n = marketVolume.length;
  let cum = 0;
  for (let i = 0; i < n && remaining > 0; i++) {
    const planned = participation * marketVolume[i];
    const exec = Math.min(planned, remaining);
    remaining -= exec;
    cum += sign * exec;
    sched.push({
      index: i,
      startFrac: i / n,
      endFrac: (i + 1) / n,
      qty: sign * exec,
      cumQty: cum,
      marketShare: participation,
    });
  }
  return sched;
}

export interface ImplementationShortfallInputs {
  totalQty: number;
  /** Number of buckets. */
  buckets: number;
  /** Asset volatility per bucket (decimal). */
  sigma: number;
  /** Permanent impact coefficient (per-share, per unit qty rate). */
  gamma: number;
  /** Temporary impact coefficient. */
  eta: number;
  /** Risk aversion (lambda). Higher => front-load. */
  riskAversion: number;
}

/**
 * Almgren-Chriss optimal Implementation Shortfall schedule.
 *
 * Solves x_k for k = 0..N where x_0 = X (total), x_N = 0:
 *   x_k = X * sinh(kappa * (T - t_k)) / sinh(kappa * T)
 * with kappa = sqrt(lambda * sigma^2 / eta).
 *
 * Returns child slices (differences of x_k).
 */
export function implementationShortfallSchedule(inputs: ImplementationShortfallInputs): Schedule {
  const { totalQty, buckets, sigma, eta, riskAversion } = inputs;
  if (buckets <= 0) throw new Error('implementationShortfallSchedule: buckets must be > 0');
  const T = 1; // normalized horizon
  const tau = T / buckets;
  const kappaSq = (riskAversion * sigma * sigma) / Math.max(eta, 1e-12);
  const kappa = Math.sqrt(kappaSq);
  const sinhKT = Math.sinh(kappa * T);
  const x: number[] = new Array(buckets + 1);
  for (let k = 0; k <= buckets; k++) {
    if (sinhKT === 0) {
      // limit case (lambda -> 0): TWAP
      x[k] = totalQty * (1 - k / buckets);
    } else {
      x[k] = totalQty * (Math.sinh(kappa * (T - k * tau)) / sinhKT);
    }
  }
  const sched: Schedule = [];
  let cum = 0;
  for (let i = 0; i < buckets; i++) {
    const slice = x[i] - x[i + 1];
    cum += slice;
    sched.push({
      index: i,
      startFrac: i / buckets,
      endFrac: (i + 1) / buckets,
      qty: slice,
      cumQty: cum,
    });
  }
  return sched;
}
