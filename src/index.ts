/**
 * TypeScript 性能测试集合
 * 包含各种常用操作的性能测试
 */

export { testArrayCopy } from './performance/array-copy';
export { testObjectShallowCopy } from './performance/object-shallow-copy';
export { testObjectIteration } from './performance/object-iteration';
export { testPropertyDetection } from './performance/property-detection';
export { testPropertyAccess } from './performance/property-access';
export { testArrayLoops } from './performance/array-loops';
export { testArrayAccessCaching } from './performance/array-access-caching';

/**
 * 运行所有性能测试
 */
export function runAllTests() {
  console.log('=== TypeScript 性能测试 ===\n');

  console.log('🔄 数组复制测试');
  testArrayCopy();

  console.log('\n📦 对象浅拷贝测试');
  testObjectShallowCopy();

  console.log('\n🔍 对象遍历测试');
  testObjectIteration();

  console.log('\n🔎 属性检测测试');
  testPropertyDetection();

  console.log('\n📖 属性访问测试');
  testPropertyAccess();

  console.log('\n🔄 数组循环测试');
  testArrayLoops();

  console.log('\n💾 数组访问缓存测试');
  testArrayAccessCaching();

  console.log('\n✅ 所有测试完成');
}

/**
 * 运行特定分类的测试
 */
export const testSuites = {
  array: {
    copy: testArrayCopy,
    loops: testArrayLoops,
    accessCaching: testArrayAccessCaching,
  },
  object: {
    shallowCopy: testObjectShallowCopy,
    iteration: testObjectIteration,
    propertyDetection: testPropertyDetection,
    propertyAccess: testPropertyAccess,
  },
};
