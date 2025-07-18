import { measure } from '@/core';

/**
 * 对象遍历性能测试
 * 测试不同方式遍历对象属性的性能差异
 *
 * 测试结果（执行1000次）：
 *
 * 字段数量为10:
 * - for...in + hasOwnProperty: 0.328ms
 * - Object.keys + for: 0.203ms
 * - Object.entries + for: 1.337ms
 * - Reflect.ownKeys + for: 0.637ms
 * - map.foreach: 0.187ms
 *
 * 字段数量为100:
 * - for...in + hasOwnProperty: 4.561ms
 * - Object.keys + for: 2.395ms
 * - Object.entries + for: 10.73ms
 * - Reflect.ownKeys + for: 5.18ms
 * - map.foreach: 0.672ms
 *
 * 字段数量为1000:
 * - for...in + hasOwnProperty: 46.917ms
 * - Object.keys + for: 38.37ms
 * - Object.entries + for: 109.194ms
 * - Reflect.ownKeys + for: 58.278ms
 * - map.foreach: 3.489ms
 *
 * 字段数量为10000:
 * - for...in + hasOwnProperty: 774.305ms
 * - Object.keys + for: 707.136ms
 * - Object.entries + for: 1.761s
 * - Reflect.ownKeys + for: 1.233s
 * - map.foreach: 32.209ms
 */
measure.test('Object Iteration', () => {
  measure.addConfig({ runTime: 1e4, size: 100 }, (config) => {
    const obj: Record<string, number> = {};
    const map = new Map<string, number>();
    // 构造大对象
    for (let i = 0; i < config.size; i++) {
      obj['key' + i] = i;
      map.set('key' + i, i);
    }
    return { obj, map };
  });

  measure.add('for...in + hasOwnProperty', (config, { obj }) => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
      }
    }
  });

  measure.add('Object.keys + for', (config, { obj }) => {
    const keys = Object.keys(obj);
    for (let j = 0; j < keys.length; j++) {
      const val = obj[keys[j]];
    }
  });

  measure.add('Object.entries + for', (config, { obj }) => {
    const entries = Object.entries(obj);
    for (let j = 0; j < entries.length; j++) {
      const [key, val] = entries[j];
    }
  });

  measure.add('Reflect.ownKeys + for', (config, { obj }) => {
    const keys = Reflect.ownKeys(obj);
    for (let j = 0; j < keys.length; j++) {
      const val = (obj as any)[keys[j]];
    }
  });

  measure.extra('map.forEach', (config, { map }) => {
    map.forEach((v: any, k: any) => {
      const val = v; // 这里可以使用 k 或 v
      const key = k;
    });
  });
});
