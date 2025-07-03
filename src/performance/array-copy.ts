import { measure } from '@/core';

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
measure.test('Array Copy', () => {
  measure.addConfig({
    RUN_TIME: 1000,
    ARRAY_SIZE: 10000,
    ARRAY_CREATOR: (size) => {
      const a = new Array(size);
      a.fill(0);
      return a;
    },
  });

  measure.add('slice()', (config, arr: number[]) => {
    arr.slice();
  });
  measure.add('[...old]', (config, arr: number[]) => {
    [...arr];
  });
  measure.add('concat()', (config, arr: number[]) => {
    arr.concat();
  });
  measure.add('Array.from()', (config, arr: number[]) => {
    Array.from(arr);
  });
  measure.add('for a[i] = old[i]', (config, arr: number[]) => {
    const a = [] as any[];
    for (let i = 0; i < arr.length; i++) {
      a[i] = arr[i];
    }
    return a;
  });
  measure.add('for a.push(old[i])', (config, arr: number[]) => {
    const a = [] as any[];
    for (let i = 0; i < arr.length; i++) {
      a.push(arr[i]);
    }
    return a;
  });
});

export {};
