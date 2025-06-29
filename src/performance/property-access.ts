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

export default function () {
  const obj = { a: 1, b: 2, c: 3 } as any;
  for (let i = 0; i < 100000; i++) {
    obj['k' + i] = i;
  }

  const key = 'b';
  let sum = 0;

  console.time('direct');
  for (let i = 0; i < 1e8; i++) {
    sum += obj[key];
  }
  console.timeEnd('direct');

  sum = 0;
  console.time('dot');
  for (let i = 0; i < 1e8; i++) {
    sum += obj[key];
  }
  console.timeEnd('dot');

  sum = 0;
  console.time('reflect');
  for (let i = 0; i < 1e8; i++) {
    sum += Reflect.get(obj, key);
  }
  console.timeEnd('reflect');
}
