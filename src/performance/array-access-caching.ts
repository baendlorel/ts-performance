import { measure } from '@/core';

/**
 * 数组访问缓存性能测试
 * 测试在 for 循环中是否需要将 arr[i] 缓存到 const 变量的性能差异
 *
 * 测试结果：
 *
 * 数组长度：100000:
 * - direct: 1.944ms
 * - cached: 1.478ms
 *
 * 数组长度：10000000:
 * - direct: 20.932ms
 * - cached: 7.768ms
 */
measure.test('Array Access', () => {
  measure.addConfig({
    ARRAY_SIZE: 100000,
    ARRAY_CREATOR: (size) => {
      return Array.from({ length: size }, (_, i) => i);
    },
  });

  measure.add('const a = arr[i]', (config, arr: number[]) => {
    let s = 0;
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      s += a * 2;
    }
  });

  measure.add('arr[i]', (config, arr: number[]) => {
    let sum1 = 0;
    for (let i = 0; i < arr.length; i++) {
      sum1 += arr[i] * 2;
    }
  });
});

export {};
