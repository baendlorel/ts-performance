import { ReflectDeep } from 'reflect-deep';

const results = {} as Record<string, Record<string, number>>;

export const createMeasure = (testName: string) => (label: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  ReflectDeep.set(results, [testName, label], end - start);
};

export const displayResults = () => {
  console.log(`\n=== ${Object.keys(results).length} 个测试结果 ===`);
  for (const [testName, measures] of Object.entries(results)) {
    console.log(`\n${testName}:`);
    for (const [label, time] of Object.entries(measures)) {
      console.log(`  ${label}: ${time.toFixed(2)} ms`);
    }
  }
};
