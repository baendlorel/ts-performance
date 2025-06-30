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

type Task = {
  config: Config;
  fn: Function;
  focused: boolean;

  // keys
  testName: string;
  configAsLabel: string;
  label: string;
};

class Measure {
  private testName: string;
  private config: Config = { RUN_TIME: 1 };
  private configAsLabel: string = '';
  private static readonly tasks: Task[] = [];
  private static noFocusedTask = true;

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

  static run() {
    for (const t of Measure.tasks) {
      if (Measure.noFocusedTask || t.focused) {
        const start = performance.now();
        for (let i = 1; i <= t.config.RUN_TIME; i++) {
          t.fn();
        }
        const end = performance.now();
        ReflectDeep.set(results, [t.testName, t.configAsLabel, t.label], {
          time: end - start,
          extra: false,
        });
      }
    }
  }

  focusTask(label: string, fn: () => void) {
    Measure.noFocusedTask = false;
    Measure.tasks.push({
      focused: true,
      config: ReflectDeep.clone(this.config),
      fn,
      testName: this.testName,
      configAsLabel: this.configAsLabel,
      label,
    });
  }

  addTask(label: string, fn: () => void) {
    Measure.tasks.push({
      focused: false,
      config: ReflectDeep.clone(this.config),
      fn,
      testName: this.testName,
      configAsLabel: this.configAsLabel,
      label,
    });
  }

  extraTask(label: string, fn: () => void) {
    const start = performance.now();
    for (let i = 1; i <= this.config.RUN_TIME; i++) {
      fn();
    }
    const end = performance.now();
    ReflectDeep.set(results, [this.testName, this.configAsLabel, label], {
      time: end - start,
      extra: true,
    });
  }
}

export const run = () => Measure.run();
export const createMeasure = (testName: string) => new Measure(testName);
