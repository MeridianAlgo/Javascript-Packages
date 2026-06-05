/**
 * Master test runner for all deep tests
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';

async function main() {
  console.log('🏁 MeridianAlgo Deep Audit Master Runner\n');

  const files = readdirSync(__dirname).filter(f => f.endsWith('_test.ts') && f !== 'run_all_deep_tests.ts');
  let passed = 0;
  let failed = 0;

  for (const file of files) {
    process.stdout.write(`🏃 Running ${file}... `);
    try {
      execSync(`npx ts-node tests/${file}`, { encoding: 'utf8' });
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED');
      const execErr = err as { stderr?: string | Buffer; stdout?: string | Buffer; message?: string };
      const stderrOutput = execErr.stderr ? execErr.stderr.toString().trim() : '';
      const stdoutOutput = execErr.stdout ? execErr.stdout.toString().trim() : '';
      const details = stderrOutput || stdoutOutput || execErr.message || 'No error details available.';
      console.log(details);
      failed++;
    }
  }

  console.log('\n--- Final Results ---');
  console.log(`Total Tests: ${files.length}`);
  console.log(`Passed:      ${passed}`);
  console.log(`Failed:      ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
