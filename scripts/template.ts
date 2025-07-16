import { measure } from '@/core';

measure.test('{name}', () => {
  measure.addConfig({ runTime: 1000, size: 10000 });

  measure.add('', (config) => {});
});
