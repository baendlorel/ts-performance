import { measure } from '@/core';

function fastExpBigInt(a: bigint, exponent: bigint) {
  let result = 1n;
  while (true) {
    if (exponent % 2n === 1n) {
      result *= a;
    }
    exponent /= 2n;
    if (exponent === 0n) {
      break;
    }
    a *= a;
  }
  return result;
}

measure.test('BigInt power', () => {
  const r = (digit: number) => BigInt(Math.random().toFixed(digit).replace('0.', ''));
  measure.addConfig({ runTime: 3e1, digit: 3 }, (config) => ({
    a: r(config.digit),
    b: r(config.digit),
  }));
  measure.addConfig({ runTime: 2e1, digit: 5 }, (config) => ({
    a: r(config.digit),
    b: r(config.digit),
  }));
  measure.addConfig({ runTime: 1e1, digit: 7 }, (config) => ({
    a: r(config.digit),
    b: r(config.digit),
  }));

  measure.add('fastExpBigInt', (config, data) => {
    return fastExpBigInt(data.a, data.b);
  });

  measure.add('a ** b', (config, data) => {
    return data.a ** data.b;
  });
});
