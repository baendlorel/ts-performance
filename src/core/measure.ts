import chalk from 'chalk';
import { ReflectDeep } from 'reflect-deep';
import { results } from './result';

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
  if (s.length > 5) {
    return `1e${s.length - 1}`;
  } else {
    return s;
  }
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
      .map(([key, value]) => `${key}: ${chalk.cyanBright(formatNum(value))}`);
    list.unshift(
      `${chalk.blueBright('RUN_TIME')}: ${chalk.cyanBright(
        formatNum(this.config.RUN_TIME)
      )}`
    );
    this.configAsLabel = list.join(', ');
  }

  run(label: string, fn: () => void) {
    const start = performance.now();
    for (let i = 1; i <= this.config.RUN_TIME; i++) {
      fn();
    }
    const end = performance.now();
    ReflectDeep.set(results, [this.testName, this.configAsLabel, `${label}`], {
      time: end - start,
      extra: false,
    });
  }

  extraRun(label: string, fn: () => void) {
    const start = performance.now();
    for (let i = 1; i <= this.config.RUN_TIME; i++) {
      fn();
    }
    const end = performance.now();
    ReflectDeep.set(results, [this.testName, this.configAsLabel, `${label}`], {
      time: end - start,
      extra: true,
    });
  }
}

export const createMeasure = (testName: string) => new Measure(testName);
