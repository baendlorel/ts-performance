/**
 * 复制数组
 * *数组大小：1000000，每种方案 1000 次测试*
 * - slice(): 5350ms
 * - 展开运算符 ...: 5500ms
 * - concat(): 5340ms
 * - Array.from(): 5770ms
 * - for set: 13602ms
 * - for push: 13270ms
 *
 * *数组大小：100，每种方案 100000 次测试*
 * - slice(): 34.20 ms
 * - 展开运算符 ...: 37.49 ms
 * - concat(): 32.64 ms
 * - Array.from(): 37.67 ms
 * - for set: 53.17 ms
 * - for push: 55.54 ms
 */
() => {
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
};

/**
 * 浅拷贝对象
 *
 * *1000次，100个字段，字段长度200*
 * - ...展开符: 58.641ms
 * - Object.assign: 31.042ms
 * - Reflect.get/set/ownKeys: 25.62ms
 *
 * *1000次，100个字段，字段长度2000*
 * - ...展开符: 64.459ms
 * - Object.assign: 32.383ms
 * - Reflect.get/set/ownKeys: 28.85ms
 *
 * *1000次，1000个字段，字段长度2000*
 * - ...展开符: 5.129s
 * - Object.assign: 412.18ms
 * - Reflect.get/set/ownKeys: 270.114ms
 *
 * *1000次，10000个字段，字段长度20*
 * - ...展开符: 2.173s
 * - Object.assign: 2.889s
 * - Reflect.get/set/ownKeys: 2.625s
 */
() => {
  const chars = '_-+=#@&$ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randStr = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const TIMES = [1000];
  const FIELD_COUNT = [10000];
  const FILED_LEN = [20];
  const run = (TIMES: number, FIELD_COUNT: number, FILED_LEN: number) => {
    const array = [] as any[];

    console.log('TIMES', TIMES, 'FIELD_COUNT', FIELD_COUNT, 'FILED_LEN', FILED_LEN);
    for (let i = 0; i < TIMES; i++) {
      array[i] = {};
      for (let j = 0; j < FIELD_COUNT; j++) {
        array[i][randStr(FILED_LEN)] = Math.random();
      }
    }

    console.time('...展开符');
    for (let i = 0; i < array.length; i++) {
      const a = { ...array[i] };
    }
    console.timeEnd('...展开符');

    console.time('Object.assign');
    for (let i = 0; i < array.length; i++) {
      const a = Object.assign({}, array[i]);
    }
    console.timeEnd('Object.assign');

    const g = Reflect.get;
    const s = Reflect.set;
    const ok = Reflect.ownKeys;
    console.time('Reflect.get/set/ownKeys');
    for (let i = 0; i < array.length; i++) {
      const keys = ok(array[i]);
      const a = {};
      for (let j = 0; j < keys.length; j++) {
        s(a, keys[j], g(array[i], keys[j]));
      }
    }
    console.timeEnd('Reflect.get/set/ownKeys');
  };

  for (const T of TIMES) {
    for (const FC of FIELD_COUNT) {
      for (const FL of FILED_LEN) {
        run(T, FC, FL);
      }
    }
  }
};

/**
 * 遍历对象
 * 执行1000次
 *
 * *字段数量为10*
 * for...in + hasOwnProperty: 0.328ms
 * Object.keys + for: 0.203ms
 * Object.entries + for: 1.337ms
 * Reflect.ownKeys + for: 0.637ms
 * map.foreach: 0.187ms
 *
 * *字段数量为100*
 * - for...in + hasOwnProperty: 4.561ms
 * - Object.keys + for: 2.395ms
 * - Object.entries + for: 10.73ms
 * - Reflect.ownKeys + for: 5.18ms
 * - map.foreach: 0.672ms
 *
 * *字段数量为1000*
 * - for...in + hasOwnProperty: 46.917ms
 * - Object.keys + for: 38.37ms
 * - Object.entries + for: 109.194ms
 * - Reflect.ownKeys + for: 58.278ms
 * - map.foreach: 3.489ms
 *
 * *字段数量为10000*
 * - for...in + hasOwnProperty: 774.305ms
 * - Object.keys + for: 707.136ms
 * - Object.entries + for: 1.761s
 * - Reflect.ownKeys + for: 1.233s
 * - map.foreach: 32.209ms
 */
() => {
  const ITERATIONS = 1_000;
  const OBJ_SIZE = 100;
  const obj: Record<string, number> = {};
  const map = new Map<string, number>();

  // 构造大对象
  for (let i = 0; i < OBJ_SIZE; i++) {
    obj['key' + i] = i;
    map.set('key' + i, i);
  }

  console.time('for...in + hasOwnProperty');
  for (let i = 0; i < ITERATIONS; i++) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
      }
    }
  }
  console.timeEnd('for...in + hasOwnProperty');

  console.time('Object.keys + for');
  for (let i = 0; i < ITERATIONS; i++) {
    const keys = Object.keys(obj);
    for (let j = 0; j < keys.length; j++) {
      const val = obj[keys[j]];
    }
  }
  console.timeEnd('Object.keys + for');

  console.time('Object.entries + for');
  for (let i = 0; i < ITERATIONS; i++) {
    const entries = Object.entries(obj);
    for (let j = 0; j < entries.length; j++) {
      const [key, val] = entries[j];
    }
  }
  console.timeEnd('Object.entries + for');

  console.time('Reflect.ownKeys + for');
  for (let i = 0; i < ITERATIONS; i++) {
    const keys = Reflect.ownKeys(obj);
    for (let j = 0; j < keys.length; j++) {
      const val = (obj as any)[keys[j]];
    }
  }
  console.timeEnd('Reflect.ownKeys + for');

  console.time('map.foreach');
  for (let i = 0; i < ITERATIONS; i++) {
    map.forEach((v, k) => {
      const val = v; // 这里可以使用 k 或 v
      const key = k;
    });
  }
  console.timeEnd('map.foreach');
};

/**
 * 判定是否含有属性 in、Reflect.has
 * 执行1000_0000次
 *
 * *字段数量为10*
 * - in: 3.448ms
 * - reflect: 44.005ms
 *
 * *字段数量为1000*
 * - in: 26.001ms
 * - reflect: 27.404ms
 *
 * *字段数量为100_0000*
 * - in 3.35ms
 * - Reflect.has 25.5ms
 */
() => {
  const obj = { a: 1, b: 2, c: 3 } as any;
  for (let i = 0; i < 10; i++) {
    obj['k' + i] = i;
  }

  console.time('in');
  for (let i = 0; i < 1e7; i++) {
    'a' in obj;
  }
  console.timeEnd('in');

  console.time('reflect');
  for (let i = 0; i < 1e7; i++) {
    Reflect.has(obj, 'a');
  }
  console.timeEnd('reflect');
};

/**
 * 使用a['b']、a.b、Reflect.get获取属性
 * 取属性1_0000_0000次
 *
 * *属性为10个*
 * - direct: 36.624ms
 * - dot: 36.75ms
 * - reflect: 517.779ms
 *
 * *属性为1000个*
 * - direct: 374.521ms
 * - dot: 376.09ms
 * - reflect: 330.358ms // 不明原因比10个属性还要快
 */
() => {
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
};

/**
 * 循环速度
 *
 * *数组长度：100000*
 * for                 : 0.55ms
 * for...of            : 2.61ms
 * for...in            : 4.68ms
 * while               : 0.57ms
 * do...while          : 0.61ms
 * forEach             : 0.63ms
 * map                 : 0.94ms
 * reduce              : 1.27ms
 * Array.from + forEach: 0.96ms
 *
 * *数组长度：10000000*
 * for                 : 4.28ms
 * for...of            : 77.67ms
 * for...in            : 1468.79ms
 * while               : 4.85ms
 * do...while          : 4.38ms
 * forEach             : 42.53ms
 * map                 : 67.68ms
 * reduce              : 54.98ms
 * Array.from + forEach: 50.18ms
 */
() => {
  const iterations = 10_000_0;
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
};

/**
 * for循环是否令const a = arr[i]
 *
 * *数组长度： 100000*
 * direct: 1.944ms
 * cached: 1.478ms
 *
 * *数组长度： 10000000*
 * direct: 20.932ms
 * cached: 7.768ms
 */
() => {
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
};
