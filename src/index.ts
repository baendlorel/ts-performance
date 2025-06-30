/**
 * TypeScript 性能测试集合
 * 包含各种常用操作的性能测试
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { displayResults, displaySuggests, generateReport, run } from './core';

async function runAllTests() {
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
  displayResults();
  console.log();
  displaySuggests();
  console.log();
  generateReport();
  console.log('✅ All tests completed successfully!');
}
runAllTests();
