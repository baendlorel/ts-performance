import { measure } from '@/core';

measure.test('Modulo positive', () => {
  measure.addConfig({ runTime: 1e6, a: 9, base: 10, '': 'assume value is 0~2*base-1' });
  measure.addConfig({ runTime: 1e4, a: 756, base: 1652, '': 'assume value is 0~2*base-1' });

  measure.add('no if', (config) => {
    const value = config.a % config.base;
    const carry = Math.floor(config.a / config.base);
  });

  measure.add('if < base', (config) => {
    if (config.a < config.base) {
      const value = 0;
      const carry = config.a;
    } else {
      const value = config.a - config.base;
      const carry = 1;
    }
  });
});

measure.test('Modulo negative', () => {
  measure.addConfig({ runTime: 1e7, a: -9, base: 10, '': 'assume value is (-1~1)*(base-1)' });
  measure.addConfig({ runTime: 1e6, a: -756, base: 1652, '': 'assume value is (-1~1)*(base-1)' });

  measure.add('no if', (config) => {
    const value = ((config.a % config.base) + config.base) % config.base;
    const carry = Math.floor(config.a / config.base);
  });

  measure.add('if < base', (config) => {
    if (config.a < 0) {
      const value = config.a + config.base;
      const carry = -1;
    } else {
      const value = config.a;
      const carry = 0;
    }
  });
});

measure.ftest('Modulo sub+mul⭕mod', () => {
  const r = () => Math.ceil(Math.random() * 1e6);
  measure.addConfig({ runTime: 1e7 }, (config) => {
    // calculate  a / b
    return {
      a: r(),
      b: r(),
    };
  });

  measure.add('mod', (config) => {
    const carry = Math.floor(config.a / config.b);
    const value = config.a % config.b;
  });

  measure.add('sub+mul', (config) => {
    const carry = Math.floor(config.a / config.b);
    const value = config.a - carry * config.b;
  });
});

export {};
