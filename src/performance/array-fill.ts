import { measure } from '@/core';

measure.test('Array Fill', () => {
  measure.addConfig({ runTime: 1000000, size: 10 });
  measure.addConfig({ runTime: 1000, size: 10000 });

  measure.add('while-push', (config) => {
    const arr1: number[] = [];
    while (arr1.length < config.size) {
      arr1.push(0);
    }
  });

  measure.add('push(...Array(LENGTH).fill(0))', (config) => {
    const arr2: number[] = [];
    const a = Array(config.size).fill(0);
    arr2.push(...a);
  });
});

export {};
