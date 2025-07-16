import { measure } from '@/core';

measure.test('Switch Map', () => {
  measure.addConfig({ runTime: 1000, size: 10000 });

  measure.add('', (config) => {});
});
