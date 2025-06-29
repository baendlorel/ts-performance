/**
 * TypeScript 性能测试集合
 * 包含各种常用操作的性能测试
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 运行所有性能测试
 */
async function runAllTests() {
  console.log('=== TypeScript 性能测试 ===');

  const performanceDir = join(process.cwd(), 'src', 'performance');
  const files = readdirSync(performanceDir);
  for (const f of files) {
    const func = await import(join(performanceDir, f));
    if (typeof func === 'object' && func.default) {
      console.log();
      console.log(`🔄 ${func.meta.name}测试`);
      await func.default();
    }
  }

  console.log();
  console.log('✅ 所有测试完成');
}
runAllTests();
