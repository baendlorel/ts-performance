import { createMeasure } from '@/core';
/**
 * 数组循环性能测试
 * 测试不同循环方式的性能差异
 *
 * 测试结果：
 *
 * 数组长度：100000:
 * - for                 : 0.55ms
 * - for...of            : 2.61ms
 * - for...in            : 4.68ms
 * - while               : 0.57ms
 * - do...while          : 0.61ms
 * - forEach             : 0.63ms
 * - map                 : 0.94ms
 * - reduce              : 1.27ms
 * - Array.from + forEach: 0.96ms
 *
 * 数组长度：10000000:
 * - for                 : 4.28ms
 * - for...of            : 77.67ms
 * - for...in            : 1468.79ms
 * - while               : 4.85ms
 * - do...while          : 4.38ms
 * - forEach             : 42.53ms
 * - map                 : 67.68ms
 * - reduce              : 54.98ms
 * - Array.from + forEach: 50.18ms
 */
const measure = createMeasure('Array Loops');
const ARRAY_SIZE = 10_000_000;
const arr = Array.from({ length: ARRAY_SIZE }, (_, i) => i);
measure.addConfig({ ARRAY_SIZE });

measure.add('for classic', () => {
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i] * 2;
  }
});

measure.add('for...of', () => {
  for (const val of arr) {
    const x = val * 2;
  }
});

measure.add('for...in', () => {
  for (const key in arr) {
    const x = arr[key] * 2;
  }
});

measure.add('while', () => {
  let i = 0;
  while (i < arr.length) {
    const x = arr[i] * 2;
    i++;
  }
});

measure.add('do...while', () => {
  let i = 0;
  do {
    const x = arr[i] * 2;
    i++;
  } while (i < arr.length);
});

measure.add('forEach', () => {
  arr.forEach((val) => {
    const x = val * 2;
  });
});

measure.add('map', () => {
  arr.map((val) => val * 2);
});

measure.add('reduce', () => {
  arr.reduce((acc, val) => acc + val * 2, 0);
});

export {};
