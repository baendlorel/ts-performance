import { measure } from '@/core';
/**
 * 对象浅拷贝性能测试
 * 测试不同方式进行对象浅拷贝的性能差异
 *
 * 测试结果：
 * - 1000次，100个字段，字段长度200
 * - ...展开符: 58.641ms
 * - Object.assign: 31.042ms
 * - Reflect.get/set/ownKeys: 25.62ms
 *
 * - 1000次，100个字段，字段长度2000
 * - ...展开符: 64.459ms
 * - Object.assign: 32.383ms
 * - Reflect.get/set/ownKeys: 28.85ms
 *
 * - 1000次，1000个字段，字段长度2000
 * - ...展开符: 5.129s
 * - Object.assign: 412.18ms
 * - Reflect.get/set/ownKeys: 270.114ms
 *
 * - 1000次，10000个字段，字段长度20
 * - ...展开符: 2.173s
 * - Object.assign: 2.889s
 * - Reflect.get/set/ownKeys: 2.625s
 */
measure.test('Object Shallow Copy', () => {
  const chars = '_-+=#@&$ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randStr = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const RUN_TIME = 1;
  const OBJ_SIZE = 100000;
  const FILED_LEN = 200;

  measure.addConfig({ RUN_TIME, OTHER: { OBJ_SIZE, FILED_LEN } });

  const o = {} as any;

  for (let j = 0; j < OBJ_SIZE; j++) {
    o[randStr(FILED_LEN)] = Math.random();
  }

  measure.add('{...obj}', () => {
    for (let i = 0; i < o.length; i++) {
      const a = { ...o[i] };
    }
  });

  measure.add('Object.assign', () => {
    for (let i = 0; i < o.length; i++) {
      const a = Object.assign({}, o[i]);
    }
  });

  measure.add('Reflect.get/set/ownKeys', () => {
    for (let i = 0; i < o.length; i++) {
      const keys = Reflect.ownKeys(o[i]);
      const a = {};
      for (let j = 0; j < keys.length; j++) {
        Reflect.set(a, keys[j], Reflect.get(o[i], keys[j]));
      }
    }
  });
});

export {};
