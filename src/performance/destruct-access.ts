import { measure } from '@/core';

measure.ftest('Destruct Access', () => {
  measure.addConfig({ runTime: 1e1, dataReusable: false }, () =>
    Array.from({ length: 4 }, (_, i) => i)
  );
  measure.addConfig({ runTime: 2e1 }, () => Array.from({ length: 4 }, (_, i) => i));
  measure.addConfig({ runTime: 3e1 }, () => Array.from({ length: 4 }, (_, i) => i));
  measure.addConfig({ runTime: 1e3 }, () => Array.from({ length: 4 }, (_, i) => i));
  measure.addConfig({ runTime: 1e5 }, () => Array.from({ length: 4 }, (_, i) => i));
  measure.addConfig({ runTime: 1e6 }, () => Array.from({ length: 4 }, (_, i) => i));
  measure.addConfig({ runTime: 1e7 }, () => Array.from({ length: 4 }, (_, i) => i));

  measure.add('const [a, b] = arr', (config, data) => {
    const [a, b, c, d] = data;
    return a + b + c + d;
  });

  measure.add('arr[0] arr[1]', (config, data) => {
    return data[0] + data[1] + data[2] + data[3];
  });
});

export {};
