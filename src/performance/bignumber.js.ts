import { measure } from '@/core';
import { BigNumber } from 'bignumber.js';

BigNumber(9999);

measure.test('BigInt power', () => {
  measure.addConfig({ runTime: 1 });
  measure.add('BigNumber(9999)^9999', (config, data) => {
    const a = BigNumber(9999).pow(9999);
    return console.log(a.toString());
  });
});
