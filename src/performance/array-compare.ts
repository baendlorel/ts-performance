import { measure } from '@/core';

measure.test('Array Compare', () => {
  const creator = (config: any) => ({
    a: Array.from({ length: config.size }, (_, i) => i),
    b: Array.from({ length: config.size }, (_, i) => i),
  });
  measure.addConfig(
    {
      runTime: 100,
      size: 1e6,
    },
    creator
  );

  measure.addConfig(
    {
      runTime: 1e6,
      size: 20,
    },
    creator
  );

  measure.add('for a[i] === b[i]', (config, { a, b }) => {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  });
  measure.add('every ai === b[i]', (config, { a, b }) => {
    return a.every((ai: number, i: number) => b[i] === ai);
  });
});

export {};
