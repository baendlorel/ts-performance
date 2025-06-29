import { createMeasure } from '@/core';

/**
 * 对象属性检测性能测试
 * 测试使用 in 操作符和 Reflect.has 检测对象属性的性能差异
 *
 * 测试结果（执行10000000次）：
 *
 * 字段数量为10:
 * - in: 3.448ms
 * - reflect: 44.005ms
 *
 * 字段数量为1000:
 * - in: 26.001ms
 * - reflect: 27.404ms
 *
 * 字段数量为1000000:
 * - in: 3.35ms
 * - Reflect.has: 25.5ms
 */
const measure = createMeasure('Property detection');
export default function () {
  const RUN_TIME = 1e7;
  const OBJ_SIZE = 10;
  measure.setConfig({ RUN_TIME, OBJ_SIZE });

  const obj = { a: 1, b: 2, c: 3 } as any;
  for (let i = 0; i < OBJ_SIZE; i++) {
    obj['k' + i] = i;
  }

  measure.run('in', () => {
    'a' in obj;
  });

  measure.run('Reflect.has', () => {
    for (let i = 0; i < 1e7; i++) {
      Reflect.has(obj, 'a');
    }
  });
}
