import { measure } from '@/core';

measure.test('Array Fill', () => {
  measure.addConfig({ RUN_TIME: 1000000, ARRAY_SIZE: 10 });
  measure.addConfig({ RUN_TIME: 1000, ARRAY_SIZE: 10000 });

  measure.add('while-push', (config) => {
    const arr1: number[] = [];
    while (arr1.length < config.ARRAY_SIZE) {
      arr1.push(0);
    }
  });

  measure.add('push(...Array(LENGTH).fill(0))', (config) => {
    const arr2: number[] = [];
    const a = Array(config.ARRAY_SIZE).fill(0);
    arr2.push(...a);
  });
});

export {};
