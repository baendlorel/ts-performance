import { createMeasure } from '@/core';

const measure = createMeasure('Function Call');

measure.addConfig({ RUN_TIME: 10 });
measure.addConfig({ RUN_TIME: 1000 });
measure.addConfig({ RUN_TIME: 10000000 });

function test(x: number, y: number) {
  return x + y;
}

measure.focus('()', () => {
  test(1, 2);
});

measure.focus('call', () => {
  test.call(null, 1, 2);
});

measure.focus('apply', () => {
  test.apply(null, [1, 2]);
});

measure.focus('Reflect.apply', () => {
  Reflect.apply(test, null, [1, 2]);
});

export {};
