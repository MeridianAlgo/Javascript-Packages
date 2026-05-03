/**
 * Hierarchical Risk Parity (Lopez de Prado, 2016).
 *
 * Algorithm:
 *   1. Compute correlation distance d_ij = sqrt(0.5 * (1 - corr_ij)).
 *   2. Single-linkage agglomerative clustering → ordered leaves (quasi-diagonalization).
 *   3. Recursive bisection: for each split, allocate inverse-variance weights to each subcluster.
 */

export interface HRPInputs {
  /** Asset return series (rows = time, cols = assets). */
  returns: readonly (readonly number[])[];
}

export interface HRPResult {
  /** Weights aligned to original asset index. */
  weights: number[];
  /** Quasi-diagonal ordering (asset indices after clustering). */
  order: number[];
}

function mean(xs: readonly number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

function covMatrix(returns: readonly (readonly number[])[]): number[][] {
  const T = returns.length;
  const N = returns[0].length;
  const means: number[] = new Array(N);
  for (let j = 0; j < N; j++) {
    let s = 0;
    for (let t = 0; t < T; t++) s += returns[t][j];
    means[j] = s / T;
  }
  const cov: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = i; j < N; j++) {
      let s = 0;
      for (let t = 0; t < T; t++) s += (returns[t][i] - means[i]) * (returns[t][j] - means[j]);
      const c = s / (T - 1);
      cov[i][j] = c;
      cov[j][i] = c;
    }
  }
  return cov;
}

function corrFromCov(cov: readonly number[][]): number[][] {
  const N = cov.length;
  const sd = cov.map((row, i) => Math.sqrt(row[i]));
  const out: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      out[i][j] = cov[i][j] / Math.max(sd[i] * sd[j], 1e-12);
    }
  }
  return out;
}

/**
 * Single-linkage agglomerative clustering on a distance matrix.
 * Returns the ordered leaves (quasi-diagonalization).
 */
function clusterOrder(dist: readonly number[][]): number[] {
  const N = dist.length;
  // Each cluster is represented as an array of leaf indices.
  let clusters: number[][] = Array.from({ length: N }, (_, i) => [i]);
  // Distance between clusters = single linkage (min over pairs).
  const clusterDist = (a: number[], b: number[]): number => {
    let m = Infinity;
    for (const i of a) for (const j of b) m = Math.min(m, dist[i][j]);
    return m;
  };
  while (clusters.length > 1) {
    let bestI = 0;
    let bestJ = 1;
    let bestD = clusterDist(clusters[0], clusters[1]);
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusterDist(clusters[i], clusters[j]);
        if (d < bestD) {
          bestD = d;
          bestI = i;
          bestJ = j;
        }
      }
    }
    const merged = [...clusters[bestI], ...clusters[bestJ]];
    const next: number[][] = [];
    for (let k = 0; k < clusters.length; k++) {
      if (k === bestI || k === bestJ) continue;
      next.push(clusters[k]);
    }
    next.push(merged);
    clusters = next;
  }
  return clusters[0];
}

/** Inverse-variance portfolio weights for a subset of assets. */
function ivpWeights(cov: readonly number[][], idx: readonly number[]): number[] {
  const inv = idx.map((i) => 1 / Math.max(cov[i][i], 1e-12));
  const sum = inv.reduce((s, x) => s + x, 0);
  return inv.map((x) => x / sum);
}

/** Cluster variance using inverse-variance weights. */
function clusterVar(cov: readonly number[][], idx: readonly number[]): number {
  const w = ivpWeights(cov, idx);
  let v = 0;
  for (let i = 0; i < idx.length; i++) {
    for (let j = 0; j < idx.length; j++) {
      v += w[i] * w[j] * cov[idx[i]][idx[j]];
    }
  }
  return v;
}

/**
 * Recursive bisection allocator.
 * Walks the ordered leaves, splitting at the midpoint each level,
 * allocating weight to each side proportional to inverse cluster variance.
 */
function recursiveBisection(cov: readonly number[][], order: readonly number[]): number[] {
  const N = order.length;
  const w: number[] = new Array(N).fill(1);
  const stack: { lo: number; hi: number }[] = [{ lo: 0, hi: N - 1 }];
  while (stack.length > 0) {
    const { lo, hi } = stack.pop()!;
    if (lo >= hi) continue;
    const mid = Math.floor((lo + hi) / 2);
    const left = order.slice(lo, mid + 1);
    const right = order.slice(mid + 1, hi + 1);
    const vL = clusterVar(cov, left);
    const vR = clusterVar(cov, right);
    const alpha = 1 - vL / (vL + vR);
    for (let k = lo; k <= mid; k++) w[k] *= alpha;
    for (let k = mid + 1; k <= hi; k++) w[k] *= 1 - alpha;
    stack.push({ lo, hi: mid });
    stack.push({ lo: mid + 1, hi });
  }
  return w;
}

export function hrpAllocate({ returns }: HRPInputs): HRPResult {
  const T = returns.length;
  if (T === 0) throw new Error('hrpAllocate: empty returns');
  const N = returns[0].length;
  if (N === 0) throw new Error('hrpAllocate: empty asset cross-section');
  const cov = covMatrix(returns);
  const corr = corrFromCov(cov);
  const dist: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      dist[i][j] = Math.sqrt(Math.max(0, 0.5 * (1 - corr[i][j])));
    }
  }
  const order = clusterOrder(dist);
  const wOrdered = recursiveBisection(cov, order);
  const weights: number[] = new Array(N).fill(0);
  for (let k = 0; k < N; k++) weights[order[k]] = wOrdered[k];
  return { weights, order };
}

export { covMatrix as _hrpCov, corrFromCov as _hrpCorr };
