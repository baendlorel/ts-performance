import { createMeasure } from '@/core';

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
const measure = createMeasure('Property Access');
export default function () {
  const RUN_TIME = 10000_0000;
  const OBJ_SIZE = 100000;
  measure.setConfig({ RUN_TIME, OBJ_SIZE });

  const obj = { a: 1, b: 2, c: 3 } as any;
  for (let i = 0; i < OBJ_SIZE; i++) {
    obj['k' + i] = i;
  }

  const key = 'b';
  let sum = 0;

  measure.run('obj[key]', () => {
    sum += obj[key];
  });

  measure.run('obj.key', () => {
    sum += obj.b;
  });

  sum = 0;
  measure.run('Reflect.get(obj, key)', () => {
    sum += Reflect.get(obj, key);
  });
}
