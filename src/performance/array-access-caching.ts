/**
 * 数组访问缓存性能测试
 * 测试在 for 循环中是否需要将 arr[i] 缓存到 const 变量的性能差异
 *
 * 测试结果：
 *
 * 数组长度：100000:
 * - direct: 1.944ms
 * - cached: 1.478ms
 *
 * 数组长度：10000000:
 * - direct: 20.932ms
 * - cached: 7.768ms
 */

export default function () {
  const LEN = 100000000;
  const arr = Array.from({ length: LEN }, (_, i) => i);
  console.log('数组长度：', LEN);

  // 方案2：缓存到 const
  console.time('cached');
  let sum2 = 0;
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    sum2 += a * 2;
  }
  console.timeEnd('cached');

  // 方案1：不缓存
  console.time('direct');
  let sum1 = 0;
  for (let i = 0; i < arr.length; i++) {
    sum1 += arr[i] * 2;
  }
  console.timeEnd('direct');

  // 方案2：缓存到 const
  console.time('cached');
  let sum3 = 0;
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    sum3 += a * 2;
  }
  console.timeEnd('cached');

  // 方案1：不缓存
  console.time('direct');
  let sum4 = 0;
  for (let i = 0; i < arr.length; i++) {
    sum4 += arr[i] * 2;
  }
  console.timeEnd('direct');
}
