import { createMeasure } from '@/core';

const measure = createMeasure('Function Call');
export default function () {
  const RUN_TIME = 1e7;

  measure.setConfig({ RUN_TIME });

  function test(x: number, y: number) {
    return x + y;
  }

  measure.addTask('call', () => {
    test.call(null, 1, 2);
  });

  measure.addTask('apply', () => {
    test.apply(null, [1, 2]);
  });

  measure.addTask('Reflect.apply', () => {
    Reflect.apply(test, null, [1, 2]);
  });
}
