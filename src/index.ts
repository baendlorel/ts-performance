/**
 * TypeScript 性能测试集合
 * 包含各种常用操作的性能测试
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';

import { run } from './core';
import { generateReport } from './report';

async function runAllTests() {
  console.time('✅ All tests completed successfully!');
  const title = chalk.blueBright('TypeScript Performance Test');
  console.log(`========= ${title} =========`);
  console.log();

  const prepareTitle = chalk.yellow('Loading');
  const performanceDir = join(process.cwd(), 'src', 'performance');
  const files = readdirSync(performanceDir);
  console.time(`${prepareTitle} total`);
  for (const f of files) {
    const label = `${prepareTitle} ${chalk.blue(f)}`;
    console.time(label);
    await import(join(performanceDir, f));
    console.timeEnd(label);
  }
  console.timeEnd(`${prepareTitle} total`);
  run();
  console.log();
  generateReport();
  console.log();
  console.timeEnd('✅ All tests completed successfully!');
}
runAllTests();
