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

export default function () {
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
}
