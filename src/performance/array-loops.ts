/**
 * 数组循环性能测试
 * 测试不同循环方式的性能差异
 *
 * 测试结果：
 *
 * 数组长度：100000:
 * - for                 : 0.55ms
 * - for...of            : 2.61ms
 * - for...in            : 4.68ms
 * - while               : 0.57ms
 * - do...while          : 0.61ms
 * - forEach             : 0.63ms
 * - map                 : 0.94ms
 * - reduce              : 1.27ms
 * - Array.from + forEach: 0.96ms
 *
 * 数组长度：10000000:
 * - for                 : 4.28ms
 * - for...of            : 77.67ms
 * - for...in            : 1468.79ms
 * - while               : 4.85ms
 * - do...while          : 4.38ms
 * - forEach             : 42.53ms
 * - map                 : 67.68ms
 * - reduce              : 54.98ms
 * - Array.from + forEach: 50.18ms
 */

export const meta = {
  name: '数组循环性能',
};

export default function () {
  const iterations = 10_000_000;
  const arr = Array.from({ length: iterations }, (_, i) => i);

  // 工具函数
  function measure(label: string, fn: Function) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${label.padEnd(20)}: ${(end - start).toFixed(2)}ms`);
  }

  console.log(`数组长度：${arr.length}\n`);

  measure('for', () => {
    for (let i = 0; i < arr.length; i++) {
      const x = arr[i] * 2;
    }
  });

  measure('for...of', () => {
    for (const val of arr) {
      const x = val * 2;
    }
  });

  measure('for...in', () => {
    for (const key in arr) {
      const x = arr[key] * 2;
    }
  });

  measure('while', () => {
    let i = 0;
    while (i < arr.length) {
      const x = arr[i] * 2;
      i++;
    }
  });

  measure('do...while', () => {
    let i = 0;
    do {
      const x = arr[i] * 2;
      i++;
    } while (i < arr.length);
  });

  measure('forEach', () => {
    arr.forEach((val) => {
      const x = val * 2;
    });
  });

  measure('map', () => {
    arr.map((val) => val * 2);
  });

  measure('reduce', () => {
    arr.reduce((acc, val) => acc + val * 2, 0);
  });

  measure('Array.from + forEach', () => {
    Array.from(arr).forEach((val) => {
      const x = val * 2;
    });
  });
}
