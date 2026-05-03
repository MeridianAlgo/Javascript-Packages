/**
 * Brinson-Hood-Beebower (1986) performance attribution.
 *
 * Decomposes active return into:
 *   - Allocation: (w_p - w_b) * R_b   (benchmark sector return × over/underweight)
 *   - Selection:  w_b * (R_p - R_b)   (benchmark weight × selection skill)
 *   - Interaction: (w_p - w_b) * (R_p - R_b)
 *
 * Total active = Allocation + Selection + Interaction
 *              = R_portfolio - R_benchmark
 */

export interface BrinsonSegment {
  name: string;
  /** Portfolio weight in this segment (sums to 1 across all). */
  portfolioWeight: number;
  /** Benchmark weight in this segment (sums to 1). */
  benchmarkWeight: number;
  /** Portfolio return from this segment. */
  portfolioReturn: number;
  /** Benchmark return for this segment. */
  benchmarkReturn: number;
}

export interface BrinsonAttribution {
  segments: {
    name: string;
    allocation: number;
    selection: number;
    interaction: number;
    total: number;
  }[];
  totals: {
    allocation: number;
    selection: number;
    interaction: number;
    activeReturn: number;
    portfolioReturn: number;
    benchmarkReturn: number;
  };
}

export function brinsonAttribution(segments: readonly BrinsonSegment[]): BrinsonAttribution {
  let totalAlloc = 0;
  let totalSel = 0;
  let totalInter = 0;
  let portRet = 0;
  let benchRet = 0;
  const out: BrinsonAttribution['segments'] = [];
  for (const s of segments) {
    const alloc = (s.portfolioWeight - s.benchmarkWeight) * s.benchmarkReturn;
    const sel = s.benchmarkWeight * (s.portfolioReturn - s.benchmarkReturn);
    const inter = (s.portfolioWeight - s.benchmarkWeight) * (s.portfolioReturn - s.benchmarkReturn);
    totalAlloc += alloc;
    totalSel += sel;
    totalInter += inter;
    portRet += s.portfolioWeight * s.portfolioReturn;
    benchRet += s.benchmarkWeight * s.benchmarkReturn;
    out.push({
      name: s.name,
      allocation: alloc,
      selection: sel,
      interaction: inter,
      total: alloc + sel + inter,
    });
  }
  return {
    segments: out,
    totals: {
      allocation: totalAlloc,
      selection: totalSel,
      interaction: totalInter,
      activeReturn: portRet - benchRet,
      portfolioReturn: portRet,
      benchmarkReturn: benchRet,
    },
  };
}
