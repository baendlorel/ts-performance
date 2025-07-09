import { measure } from '@/core';

measure.test('Log(n,x)', () => {
  const numbers = Array.from({ length: 10 }, (_, i) => i + 35464231);
  measure.addConfig({ runTime: 2e6 });
  measure.addConfig({ runTime: 2e6 });
  measure.addConfig({ runTime: 2e6 });

  measure.add('ln', (config) => {
    for (let i = 0; i < numbers.length; i++) {
      Math.log(numbers[i]);
    }
  });

  measure.add('lg', (config) => {
    for (let i = 0; i < numbers.length; i++) {
      Math.log10(numbers[i]);
    }
  });

  measure.add('lb', (config) => {
    for (let i = 0; i < numbers.length; i++) {
      Math.log2(numbers[i]);
    }
  });

  measure.add('lb', (config) => {
    for (let i = 0; i < numbers.length; i++) {
      Math.log2(numbers[i]);
    }
  });
});
