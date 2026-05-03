/**
 * Pseudo-random number generators with seeding for reproducible Monte Carlo.
 */

/**
 * Mulberry32 PRNG — uniform in [0,1). Fast, decent quality, deterministic.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Box-Muller transform — converts a uniform PRNG to standard-normal samples.
 * Returns a function that yields one N(0,1) sample per call.
 */
export function boxMuller(uniform: () => number): () => number {
  let cached: number | null = null;
  return function (): number {
    if (cached !== null) {
      const v = cached;
      cached = null;
      return v;
    }
    let u1 = uniform();
    let u2 = uniform();
    if (u1 < 1e-12) u1 = 1e-12;
    const mag = Math.sqrt(-2 * Math.log(u1));
    const z0 = mag * Math.cos(2 * Math.PI * u2);
    const z1 = mag * Math.sin(2 * Math.PI * u2);
    cached = z1;
    return z0;
  };
}

/** Convenience: seeded normal RNG. */
export function normalRng(seed = 42): () => number {
  return boxMuller(mulberry32(seed));
}
