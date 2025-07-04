import { measure } from '@/core';

measure.test('Modulo', () => {
  measure.addConfig({ runTime: 1e8, a: 9, base: 10 });
  measure.addConfig({ runTime: 1e6, a: 756, base: 1652 });

  measure.add('no if', (config) => {
    const q = config.a % config.base;
    const r = Math.floor(config.a / config.base);
  });

  measure.add('if < base', (config) => {
    if (config.a < config.base) {
      const q = 0;
      const r = config.a;
    } else {
      const q = config.a % config.base;
      const r = Math.floor(config.a / config.base);
    }
  });
});

export {};
