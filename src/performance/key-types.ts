import { measure } from '@/core';

measure.test('Key Types', () => {
  measure.addConfig({ runTime: 10 });
  measure.addConfig({ runTime: 1000 });
  measure.addConfig({ runTime: 1e7 });
  const createTestObject = () => {
    const obj: Record<string | symbol, string> = {};
    const randomString = (length: number): string => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    // Add 30 string keys
    for (let i = 0; i < 30; i++) {
      const key = randomString(8);
      obj[key] = `value_${i}`;
    }

    // Add 30 symbol keys
    for (let i = 0; i < 30; i++) {
      const key = Symbol(`symbol_${i}`);
      obj[key] = `symbol_value_${i}`;
    }

    return obj;
  };
  const rand = (n: number) => Math.floor(Math.random() * n);

  const a = createTestObject();

  const syms = Object.getOwnPropertySymbols(a);
  const strs = Object.getOwnPropertyNames(a);

  measure.add('random', () => {
    return rand(syms.length);
  });

  measure.add('Use Symbol as key', () => {
    const sym = syms[rand(syms.length)];
    return a[sym];
  });

  measure.add('Use String as key', () => {
    const str = strs[rand(strs.length)];
    return a[str];
  });
});
