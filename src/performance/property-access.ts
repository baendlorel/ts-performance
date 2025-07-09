import { measure } from '@/core';

/**
 * 对象属性访问性能测试
 * 测试使用不同方式访问对象属性的性能差异
 *
 * 测试结果（取属性100000000次）：
 *
 * 属性为10个:
 * - direct: 36.624ms
 * - dot: 36.75ms
 * - reflect: 517.779ms
 *
 * 属性为1000个:
 * - direct: 374.521ms
 * - dot: 376.09ms
 * - reflect: 330.358ms (不明原因比10个属性还要快)
 */
measure.test('Property Access', () => {
  measure.addConfig({ size: 1000, ACCESS_TIME: 1e6 }, (config) => {
    const o = { a: 1, b: 2, c: 3 } as any;
    for (let i = 0; i < config.size; i++) {
      o['k' + i] = i;
    }
    return o;
  });

  const key = 'b';
  measure.add('obj[key]', (config, o) => {
    for (let i = 0; i < config.ACCESS_TIME; i++) {
      const a = o[key];
    }
  });

  measure.add('obj.key', (config, o) => {
    for (let i = 0; i < config.ACCESS_TIME; i++) {
      const a = o.b;
    }
  });

  measure.add('Reflect.get(obj, key)', (config, o) => {
    for (let i = 0; i < config.ACCESS_TIME; i++) {
      const a = Reflect.get(o, key);
    }
  });
});
