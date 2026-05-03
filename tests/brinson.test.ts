import { brinsonAttribution } from '../src/risk/brinson';

describe('Brinson-Hood-Beebower attribution', () => {
  test('decomposes active return into alloc/sel/inter', () => {
    const result = brinsonAttribution([
      {
        name: 'Tech',
        portfolioWeight: 0.5,
        benchmarkWeight: 0.4,
        portfolioReturn: 0.10,
        benchmarkReturn: 0.08,
      },
      {
        name: 'Energy',
        portfolioWeight: 0.5,
        benchmarkWeight: 0.6,
        portfolioReturn: 0.05,
        benchmarkReturn: 0.04,
      },
    ]);
    const { totals } = result;
    expect(totals.allocation + totals.selection + totals.interaction).toBeCloseTo(
      totals.activeReturn,
      8,
    );
    expect(totals.activeReturn).toBeCloseTo(totals.portfolioReturn - totals.benchmarkReturn, 10);
  });
});
