/**
 * CPPI (Constant Proportion Portfolio Insurance) and TIPP (Time-Invariant Portfolio Protection).
 *
 * CPPI:
 *   floor = floorFraction * V_0   (fixed in monetary terms)
 *   cushion_t = max(V_t - floor, 0)
 *   risky_t = min(multiplier * cushion_t, V_t)
 *   safe_t = V_t - risky_t
 *
 * TIPP: same but floor ratchets up:
 *   floor_t = max(floor_{t-1}, floorFraction * V_t)
 */

export interface CPPIInputs {
  initialValue: number;
  /** Floor as fraction of initial value (e.g. 0.80 for 80% protection). */
  floorFraction: number;
  /** Multiplier (typical 3–5). */
  multiplier: number;
  /** Periodic risky-asset returns. */
  riskyReturns: readonly number[];
  /** Periodic safe-asset returns (e.g. T-bill); defaults to 0. */
  safeReturns?: readonly number[];
}

export interface CPPIPath {
  /** Portfolio value at end of each period (length = riskyReturns.length + 1). */
  value: number[];
  /** Risky allocation at start of each period. */
  riskyAlloc: number[];
  /** Safe allocation at start of each period. */
  safeAlloc: number[];
  /** Floor at each period (constant for CPPI, ratcheting for TIPP). */
  floor: number[];
}

/** CPPI strategy with constant monetary floor. */
export function cppiStrategy(inputs: CPPIInputs): CPPIPath {
  const { initialValue, floorFraction, multiplier, riskyReturns } = inputs;
  const safeReturns = inputs.safeReturns ?? new Array(riskyReturns.length).fill(0);
  if (safeReturns.length !== riskyReturns.length) {
    throw new Error('cppiStrategy: safe and risky returns length mismatch');
  }
  const floor = initialValue * floorFraction;
  const value: number[] = [initialValue];
  const riskyAlloc: number[] = [];
  const safeAlloc: number[] = [];
  const floorPath: number[] = [floor];
  for (let t = 0; t < riskyReturns.length; t++) {
    const v = value[t];
    const cushion = Math.max(v - floor, 0);
    const risky = Math.min(multiplier * cushion, v);
    const safe = v - risky;
    riskyAlloc.push(risky);
    safeAlloc.push(safe);
    const next = risky * (1 + riskyReturns[t]) + safe * (1 + safeReturns[t]);
    value.push(next);
    floorPath.push(floor);
  }
  return { value, riskyAlloc, safeAlloc, floor: floorPath };
}

/** TIPP — floor ratchets up to never fall below `floorFraction * V_t`. */
export function tippStrategy(inputs: CPPIInputs): CPPIPath {
  const { initialValue, floorFraction, multiplier, riskyReturns } = inputs;
  const safeReturns = inputs.safeReturns ?? new Array(riskyReturns.length).fill(0);
  if (safeReturns.length !== riskyReturns.length) {
    throw new Error('tippStrategy: safe and risky returns length mismatch');
  }
  let floor = initialValue * floorFraction;
  const value: number[] = [initialValue];
  const riskyAlloc: number[] = [];
  const safeAlloc: number[] = [];
  const floorPath: number[] = [floor];
  for (let t = 0; t < riskyReturns.length; t++) {
    const v = value[t];
    const cushion = Math.max(v - floor, 0);
    const risky = Math.min(multiplier * cushion, v);
    const safe = v - risky;
    riskyAlloc.push(risky);
    safeAlloc.push(safe);
    const next = risky * (1 + riskyReturns[t]) + safe * (1 + safeReturns[t]);
    value.push(next);
    floor = Math.max(floor, next * floorFraction);
    floorPath.push(floor);
  }
  return { value, riskyAlloc, safeAlloc, floor: floorPath };
}
