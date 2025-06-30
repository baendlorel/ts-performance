import { createMeasure } from '@/core';

const measure = createMeasure('Function Call');
const RUN_TIME = 1000;

measure.setConfig({ RUN_TIME });

function test(x: number, y: number) {
  return x + y;
}

measure.focusTask('call', () => {
  test.call(null, 1, 2);
});

measure.focusTask('apply', () => {
  test.apply(null, [1, 2]);
});

measure.focusTask('Reflect.apply', () => {
  Reflect.apply(test, null, [1, 2]);
});

export {};
