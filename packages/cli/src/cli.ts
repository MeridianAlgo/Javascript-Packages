#!/usr/bin/env node
/**
 * MeridianAlgo CLI
 */

import { Command } from 'commander';

const program = new Command();

program
  .name('meridianalgo')
  .description('MeridianAlgo - Quantitative Finance Framework')
  .version('2.0.0');

program
  .command('backtest')
  .description('Run a backtest')
  .option('-s, --symbol <symbol>', 'Symbol to backtest', 'AAPL')
  .option('--start <date>', 'Start date', '2023-01-01')
  .option('--end <date>', 'End date', '2023-12-31')
  .option('--strategy <strategy>', 'Strategy to use', 'trend-following')
  .action(async (options) => {
    console.log('Running backtest with options:', options);
    console.log('Note: Full implementation requires running example code');
  });

program
  .command('init')
  .description('Initialize a new project')
  .argument('<name>', 'Project name')
  .option('-t, --template <template>', 'Template to use', 'basic')
  .action((name, options) => {
    console.log(`Initializing project: ${name} with template: ${options.template}`);
    console.log('Note: Template scaffolding not yet implemented');
  });

program.parse();
