import { measure } from '@/core';

measure.ftest('Array Unshift', () => {
  const create = (config: { size: number }) => {
    return Array.from({ length: config.size }, (_, i) => i);
  };
  measure.addConfig({ size: 1e1 }, create);
  measure.addConfig({ size: 1e2 }, create);
  measure.addConfig({ size: 1e3 }, create);
  measure.addConfig({ size: 1e4 }, create);
  measure.addConfig({ size: 1e5 }, create);

  measure.add('unshift', (config, arr: number[]) => {
    const newarr: number[] = arr.slice();
    for (let i = 0; i < arr.length; i++) {
      newarr.unshift(arr[i]);
    }
  });

  measure.add('reverse+push+reverse', (config, arr: number[]) => {
    const newarr: number[] = arr.slice().reverse();
    for (let i = 0; i < arr.length; i++) {
      newarr.push(arr[i]);
    }
    newarr.reverse();
  });
});
