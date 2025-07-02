import { measure } from '@/core';

measure.test('Array Fill', () => {
  const RUN_TIME = 100;
  const ARRAY_SIZE = 1_000_000; // 需要补多少个 0

  measure.addConfig({ RUN_TIME, ARRAY_SIZE });

  measure.add('while-push', () => {
    let arr1: number[] = [];
    while (arr1.length < ARRAY_SIZE) {
      arr1.push(0);
    }
  });

  measure.add('push(...Array(LENGTH).fill(0))', () => {
    let arr2: number[] = [];
    const a = Array(ARRAY_SIZE).fill(0);
    console.log(a.length);
    arr2.push(...a);
  });
});

export {};
