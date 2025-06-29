import chalk from 'chalk';
import { ReflectDeep } from 'reflect-deep';

const results = {} as Record<string, Record<string, Record<string, number>>>;

type Config = Record<string, number | string> & { RUN_TIME: number };

const formatNum1 = (n: string | number) => {
  if (typeof n !== 'number') {
    return n;
  }
  const s = n.toString();
  if (/1[0]+/.test(s)) {
    const zeros = s.length - 1;
    const unitIndex = Math.floor(zeros / 3);
    const rest = zeros % 3;
    const unit = ['K', 'M', 'B', 'T'][unitIndex];
    return `${s.slice(0, rest + 1)}${unit}`;
  }
  return s;
};

const formatNum2 = (n: string | number) => {
  if (typeof n !== 'number') {
    return n;
  }
  const s = n.toString();
  return `1e${s.length - 1}`;
};

const formatNum = formatNum2;

class Measure {
  private testName: string;
  private config: Config = { RUN_TIME: 1 };
  private configAsLabel: string = '';

  constructor(testName: string) {
    this.testName = testName;
  }

  setConfig(config: Partial<Config>) {
    Object.assign(this.config, config);
    const list = Object.entries(this.config)
      .filter(([key]) => key !== 'RUN_TIME')
      .map(([key, value]) => `${key}: ${chalk.green(formatNum(value))}`);
    list.unshift(
      `${chalk.blueBright('RUN_TIME')}: ${chalk.green(formatNum(this.config.RUN_TIME))}`
    );
    this.configAsLabel = list.join(', ');
  }

  run(label: string, fn: () => void) {
    const start = performance.now();
    for (let i = 1; i <= this.config.RUN_TIME; i++) {
      fn();
    }
    const end = performance.now();
    ReflectDeep.set(
      results,
      [this.testName, this.configAsLabel, `${label}`],
      end - start
    );
  }
}

export const createMeasure = (testName: string) => new Measure(testName);

const SPACE = ' '.repeat(4);
export const displayResults = () => {
  console.log(`\n=== ${Object.keys(results).length} 个测试结果 ===`);
  // console.log(Object.keys(results).length);
  for (const [testName, configToGroup] of Object.entries(results)) {
    console.log(chalk.bold.underline(testName));
    for (const [configStr, group] of Object.entries(configToGroup)) {
      console.log(SPACE, configStr);
      const arr = Array.from(Object.entries(group));
      const maxLen = Math.max(...arr.map(([label]) => label.length));
      arr.sort((a, b) => a[1] - b[1]);
      for (let i = 0; i < arr.length; i++) {
        const [label, time] = arr[i];
        const msg =
          i === 0
            ? chalk.underline.yellowBright(
                `${label.padEnd(maxLen, ' ')}: ${time.toFixed(3)}`
              )
            : `${label.padEnd(maxLen, ' ')}: ${chalk.gray(time.toFixed(3))}`;
        console.log(SPACE.repeat(2), msg);
      }
    }
    console.log();
  }
};
