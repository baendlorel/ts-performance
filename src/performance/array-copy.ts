import { createMeasure } from '@/core';

/**
 * 数组复制性能测试
 * 测试不同方式复制数组的性能差异
 *
 * 测试结果：
 * - 数组大小：1000000，每种方案 1000 次测试
 * - slice(): 5350ms
 * - 展开运算符 ...: 5500ms
 * - concat(): 5340ms
 * - Array.from(): 5770ms
 * - for set: 13602ms
 * - for push: 13270ms
 *
 * 数组大小：100，每种方案 100000 次测试
 * - slice(): 34.20 ms
 * - 展开运算符 ...: 37.49 ms
 * - concat(): 32.64 ms
 * - Array.from(): 37.67 ms
 * - for set: 53.17 ms
 * - for push: 55.54 ms
 */
const measure = createMeasure('Array Copy');
const RUN_TIME = 1000;
const ARRAY_SIZE = 10000;
const arr = Array(ARRAY_SIZE).fill(1);

measure.setConfig({ RUN_TIME, ARRAY_SIZE });

measure.add('slice()', () => arr.slice());
measure.add('[...old]', () => [...arr]);
measure.add('concat()', () => arr.concat());
measure.add('Array.from()', () => Array.from(arr));
measure.add('for a[i] = old[i]', () => {
  const a = [] as any[];
  for (let i = 0; i < arr.length; i++) {
    a[i] = arr[i];
  }
  return a;
});
measure.add('for a.push(old[i])', () => {
  const a = [] as any[];
  for (let i = 0; i < arr.length; i++) {
    a.push(arr[i]);
  }
  return a;
});

export {};
