/**
 * 数组复制性能测试
 * 测试不同方式复制数组的性能差异
 *
 * 测试结果：
 * - 数组大小：1000000，每种方案 1000 次测试
 * - slice(): 5350ms
 * - 展开运算符 ...: 5500ms
 * - concat(): 5340ms
 * - Array.from(): 5770ms
 * - for set: 13602ms
 * - for push: 13270ms
 *
 * 数组大小：100，每种方案 100000 次测试
 * - slice(): 34.20 ms
 * - 展开运算符 ...: 37.49 ms
 * - concat(): 32.64 ms
 * - Array.from(): 37.67 ms
 * - for set: 53.17 ms
 * - for push: 55.54 ms
 */

export default function () {
  const TOTAL_RUNS = 100000; // 测试轮数
  const ARRAY_SIZE = 100; // 每次数组大小

  function createArray() {
    return Array(ARRAY_SIZE).fill(1);
  }

  function benchmark(label: string, fn: Function) {
    const start = performance.now();
    for (let i = 0; i < TOTAL_RUNS; i++) {
      const arr = createArray();
      fn(arr);
    }
    const end = performance.now();
    console.log(`${label}: ${(end - start).toFixed(2)} ms`);
  }

  console.log(`\n数组大小：${ARRAY_SIZE}，每种方案 ${TOTAL_RUNS} 次测试\n`);

  benchmark('slice()', (arr: any[]) => arr.slice());
  benchmark('展开运算符 ...', (arr: any[]) => [...arr]);
  benchmark('concat()', (arr: any[]) => arr.concat());
  benchmark('Array.from()', (arr: any[]) => Array.from(arr));
  benchmark('loop set', (arr: any[]) => {
    const a = [] as any[];
    for (let i = 0; i < arr.length; i++) {
      a[i] = arr[i];
    }
    return a;
  });
  benchmark('loop push', (arr: any[]) => {
    const a = [] as any[];
    for (let i = 0; i < arr.length; i++) {
      a.push(arr[i]);
    }
    return a;
  });
}
