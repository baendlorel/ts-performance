import { measure } from '@/core';

measure.ftest('Number Parse', () => {
  const creator = () => (100 * Math.random()).toString();
  measure.addConfig({ runTime: 1e1 }, creator);
  measure.addConfig({ runTime: 2e1 }, creator);
  measure.addConfig({ runTime: 3e1 }, creator);
  measure.addConfig({ runTime: 1e3 }, creator);
  measure.addConfig({ runTime: 1e5 }, creator);
  measure.addConfig({ runTime: 1e6 }, creator);
  measure.addConfig({ runTime: 1e7 }, creator);

  measure.add('parseInt(x)', (config, data) => {
    return parseInt(data);
  });

  measure.add('parseFloat(x)', (config, data) => {
    return parseFloat(data);
  });

  measure.add('Number(x)', (config, data) => {
    return Number(data);
  });

  measure.add('+x', (config, data) => {
    return +data;
  });
});

export {};
