import { measure } from '@/core';

measure.test('a^b', () => {
  measure.addConfig({ runTime: 1e1 }, () => ({ a: Math.random(), b: Math.random() }));
  measure.addConfig({ runTime: 1e2 }, () => ({ a: Math.random(), b: Math.random() }));
  measure.addConfig({ runTime: 1e3 }, () => ({ a: Math.random(), b: Math.random() }));
  measure.addConfig({ runTime: 1e5 }, () => ({ a: Math.random(), b: Math.random() }));
  measure.addConfig({ runTime: 1e7 }, () => ({ a: Math.random(), b: Math.random() }));

  measure.add('Math.pow(a,b)', (config, data) => {
    return Math.pow(data.a, data.b);
  });

  measure.add('a ** b', (config, data) => {
    return data.a ** data.b;
  });
});
