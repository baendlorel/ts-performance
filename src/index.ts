/**
 * TypeScript 性能测试集合
 * 包含各种常用操作的性能测试
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { displayResults } from './core';

async function runAllTests() {
  console.log('=== TypeScript Performance Test ===');
  console.log();

  const performanceDir = join(process.cwd(), 'src', 'performance');
  const files = readdirSync(performanceDir);
  console.time('Running');
  for (const f of files) {
    const func = await import(join(performanceDir, f));
    if (typeof func === 'object' && func.default) {
      func.default();
    }
    console.timeLog('Running', f);
  }
  console.timeEnd('Running');
  displayResults();

  console.log();
  console.log('✅ All tests completed successfully!');
}
runAllTests();
