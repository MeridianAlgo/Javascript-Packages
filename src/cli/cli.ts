#!/usr/bin/env node
/**
 * MeridianAlgo CLI
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import {
  YahooAdapter,
  DataManager,
  TimeBasedEngine,
  FixedCommission,
  FixedSlippage,
  trendFollowing,
  meanReversion
} from '../index';

const program = new Command();

program
  .name('meridianalgo')
  .description('MeridianAlgo - Quantitative Finance Framework')
  .version('3.11.0');

program
  .command('backtest')
  .description('Run a backtest against Yahoo Finance data')
  .option('-s, --symbol <symbol>', 'Symbol to backtest', 'AAPL')
  .option('--start <date>', 'Start date (YYYY-MM-DD)', '2023-01-01')
  .option('--end <date>', 'End date (YYYY-MM-DD)', '2023-12-31')
  .option('--strategy <strategy>', 'Strategy: trend-following | mean-reversion', 'trend-following')
  .option('--fast <n>', 'Fast period', '10')
  .option('--slow <n>', 'Slow period', '30')
  .option('--cash <n>', 'Initial cash', '100000')
  .option('--commission <n>', 'Per-trade commission', '1')
  .option('--slippage <n>', 'Slippage in bps', '5')
  .action(async (options) => {
    try {
      const yahoo = new YahooAdapter();
      const dataManager = new DataManager(new Map([['yahoo', yahoo]]));
      const bars = await dataManager.fetch('yahoo', options.symbol, {
        start: options.start,
        end: options.end,
        interval: '1d'
      });
      if (bars.length === 0) {
        console.error(`No data returned for ${options.symbol}`);
        process.exitCode = 1;
        return;
      }

      const fast = parseInt(options.fast, 10);
      const slow = parseInt(options.slow, 10);
      const strategy = options.strategy === 'mean-reversion'
        ? meanReversion({ period: slow, stdDev: 2 })
        : trendFollowing({ fastPeriod: fast, slowPeriod: slow, maType: 'ema' });

      const engine = new TimeBasedEngine({
        strategy,
        data: bars,
        initialCash: parseFloat(options.cash),
        commission: new FixedCommission(parseFloat(options.commission)),
        slippage: new FixedSlippage(parseFloat(options.slippage))
      });

      const result = await engine.run();
      const finalEquity = result.equity[result.equity.length - 1].equity;
      console.log(JSON.stringify({
        symbol: options.symbol,
        strategy: options.strategy,
        bars: bars.length,
        finalEquity: Number(finalEquity.toFixed(2)),
        totalReturn: Number((result.metrics.totalReturn * 100).toFixed(4)),
        annualizedReturn: Number((result.metrics.annualizedReturn * 100).toFixed(4)),
        sharpeRatio: Number(result.metrics.sharpeRatio.toFixed(4)),
        maxDrawdown: Number((result.metrics.maxDrawdown * 100).toFixed(4)),
        winRate: Number((result.metrics.winRate * 100).toFixed(4)),
        profitFactor: Number(result.metrics.profitFactor.toFixed(4)),
        totalTrades: result.metrics.totalTrades
      }, null, 2));
    } catch (err) {
      console.error('Backtest failed:', err instanceof Error ? err.message : err);
      process.exitCode = 1;
    }
  });

program
  .command('init')
  .description('Scaffold a new MeridianAlgo project')
  .argument('<name>', 'Project directory name')
  .option('-t, --template <template>', 'Template: basic | strategy', 'basic')
  .action((name: string, options: { template: string }) => {
    const target = path.resolve(process.cwd(), name);
    if (fs.existsSync(target)) {
      console.error(`Directory '${name}' already exists`);
      process.exitCode = 1;
      return;
    }
    fs.mkdirSync(target, { recursive: true });

    const pkg = {
      name,
      version: '0.1.0',
      private: true,
      scripts: {
        start: 'ts-node index.ts',
        build: 'tsc'
      },
      dependencies: {
        meridianalgo: '^3.11.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        'ts-node': '^10.9.0',
        typescript: '^5.3.0'
      }
    };
    fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify(pkg, null, 2));

    const tsconfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'CommonJS',
        moduleResolution: 'node',
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        outDir: 'dist'
      },
      include: ['*.ts']
    };
    fs.writeFileSync(path.join(target, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    const indexSrc = options.template === 'strategy'
      ? `import { trendFollowing, TimeBasedEngine, YahooAdapter, DataManager, FixedCommission, FixedSlippage } from 'meridianalgo';

async function main() {
  const yahoo = new YahooAdapter();
  const dm = new DataManager(new Map([['yahoo', yahoo]]));
  const bars = await dm.fetch('yahoo', 'AAPL', { start: '2023-01-01', end: '2023-12-31', interval: '1d' });
  const strategy = trendFollowing({ fastPeriod: 10, slowPeriod: 30, maType: 'ema' });
  const engine = new TimeBasedEngine({
    strategy,
    data: bars,
    initialCash: 100000,
    commission: new FixedCommission(1),
    slippage: new FixedSlippage(5)
  });
  const result = await engine.run();
  console.log('Sharpe:', result.metrics.sharpeRatio.toFixed(2));
}

main().catch(console.error);
`
      : `import { Indicators } from 'meridianalgo';

const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
console.log('SMA(5):', Indicators.sma(prices, 5));
`;
    fs.writeFileSync(path.join(target, 'index.ts'), indexSrc);

    fs.writeFileSync(path.join(target, 'README.md'),
      `# ${name}\n\nGenerated with \`meridianalgo init\`.\n\n## Setup\n\n\`\`\`\nnpm install\nnpm start\n\`\`\`\n`);

    console.log(`Created ${name}/ (template: ${options.template})`);
    console.log('Next:');
    console.log(`  cd ${name}`);
    console.log('  npm install');
    console.log('  npm start');
  });

program.parse();
