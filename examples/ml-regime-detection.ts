/**
 * HMM regime detection on synthetic returns.
 * Bull regime: positive drift, low vol. Bear regime: negative drift, high vol.
 */
import { trainHMM, viterbi, logReturns } from '../src';

function genRegimeReturns(n: number): { returns: number[]; truth: number[] } {
  const returns: number[] = [];
  const truth: number[] = [];
  let state = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < 0.02) state = 1 - state;
    truth.push(state);
    const mu = state === 0 ? 0.001 : -0.002;
    const sigma = state === 0 ? 0.008 : 0.025;
    const z = Math.random() * 2 - 1 + (Math.random() * 2 - 1);
    returns.push(mu + sigma * z);
  }
  return { returns, truth };
}

const { returns, truth } = genRegimeReturns(500);
const { params, logLik, iterations } = trainHMM(returns, 2, { maxIter: 100 });
const states = viterbi(returns, params);

const matches = states.filter((s, i) => s === truth[i]).length;
const matchesFlipped = states.filter((s, i) => s !== truth[i]).length;
const accuracy = Math.max(matches, matchesFlipped) / states.length;

console.log('HMM converged after', iterations, 'iterations');
console.log('Final logLik:', logLik.toFixed(2));
console.log('Means:', params.mu.map(x => x.toFixed(4)));
console.log('Sigmas:', params.sigma.map(x => x.toFixed(4)));
console.log('Transition matrix:', params.A);
console.log('Decode accuracy vs ground truth:', (accuracy * 100).toFixed(1) + '%');
