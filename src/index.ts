/**
 * TypeScript 性能测试集合
 * 包含各种常用操作的性能测试
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { displayResults } from './core';

async function runAllTests() {
  const title = chalk.blueBright('TypeScript Performance Test');
  console.log(`========= ${title} =========`);
  console.log();

  const performanceDir = join(process.cwd(), 'src', 'performance');
  const files = readdirSync(performanceDir);
  for (const f of files) {
    const Running = chalk.yellow('Running');
    console.time(`${Running} ${f}`);
    const func = await import(join(performanceDir, f));
    if (typeof func === 'object' && func.default) {
      func.default();
    }
    console.timeEnd(`${Running} ${f}`);
  }
  displayResults();

  console.log();
  console.log('✅ All tests completed successfully!');
}
runAllTests();
