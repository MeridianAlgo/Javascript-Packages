/**
 * VWAP / TWAP / POV / Implementation-Shortfall execution schedules.
 */
import {
  vwapSchedule,
  twapSchedule,
  povSchedule,
  implementationShortfallSchedule,
} from '../src';

const totalQty = 100_000;
const buckets = 10;

const volumeProfile = [0.05, 0.15, 0.20, 0.10, 0.08, 0.07, 0.08, 0.10, 0.12, 0.05];
const vwap = vwapSchedule({ totalQty, volumeProfile });
const twap = twapSchedule({ totalQty, buckets });
const pov = povSchedule({
  totalQty,
  participation: 0.10,
  marketVolume: volumeProfile.map(v => v * 1_000_000),
});

const isq = implementationShortfallSchedule({
  totalQty,
  buckets,
  sigma: 0.20,
  riskAversion: 1e-6,
  gamma: 1e-7,
  eta: 1e-6,
});

const fmt = (s: { qty: number }[]) => s.map(x => Math.round(x.qty));
console.log('VWAP slices:', fmt(vwap));
console.log('TWAP slices:', fmt(twap));
console.log('POV slices:', fmt(pov));
console.log('Almgren-Chriss IS:', fmt(isq));
