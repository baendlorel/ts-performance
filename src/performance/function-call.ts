import { measure } from '@/core';

measure.test('Function Call', () => {
  measure.addConfig({ runTime: 10 });
  measure.addConfig({ runTime: 1000 });
  measure.addConfig({ runTime: 1000000 });

  function test(x: number, y: number) {
    return x + y;
  }

  measure.add('fn()', () => {
    test(1, 2);
  });

  measure.add('fn.call', () => {
    test.call(null, 1, 2);
  });

  measure.add('fn.apply', () => {
    test.apply(null, [1, 2]);
  });

  measure.add('Reflect.apply', () => {
    Reflect.apply(test, null, [1, 2]);
  });
});

export {};
