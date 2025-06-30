/**
 * TypeScript 性能测试集合
 * 包含各种常用操作的性能测试
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { displayResults, displaySuggests, run } from './core';

async function runAllTests() {
  const title = chalk.blueBright('TypeScript Performance Test');
  console.log(`========= ${title} =========`);
  console.log();

  const Running = chalk.yellow('Running');
  const performanceDir = join(process.cwd(), 'src', 'performance');
  const files = readdirSync(performanceDir);
  console.time(`${Running} total`);
  for (const f of files) {
    const label = `${Running} ${chalk.blue(f)}`;
    console.time(label);
    const func = await import(join(performanceDir, f));
    if (typeof func === 'object' && func.default) {
      func.default();
    }
    console.timeEnd(label);
  }
  console.timeEnd(`${Running} total`);
  run();
  console.log();
  displayResults();
  console.log();
  displaySuggests();
  console.log();
  console.log('✅ All tests completed successfully!');
}
runAllTests();
