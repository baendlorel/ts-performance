import chalk from 'chalk';
import { ReflectDeep } from 'reflect-deep';
import { results } from './result';

type Config = Record<string, number | string> & { RUN_TIME: number };

const formatNum = (n: string | number) => {
  if (typeof n !== 'number') {
    return n;
  }
  const s = n.toString();
  s.length > 5 ? `1e${s.length - 1}` : s;
};

type Task = {
  config: Config;
  fn: Function;
  focused: boolean;
  extra: boolean;

  // keys
  testName: string;
  configAsLabel: string;
  label: string;
};

class Measure {
  private static readonly tasks: Task[] = [];
  private static noFocusedTask = true;

  private testName: string;
  private config: Config = { RUN_TIME: 1 };
  private configAsLabel: string = '';
  private tasks: Task[] = [];

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
          extra: t.extra,
        });
      }
    }
  }

  focusTask(label: string, fn: () => void) {
    Measure.noFocusedTask = false;
    Measure.tasks.push({
      focused: true,
      config: this.config,
      fn,
      extra: false,
      testName: this.testName,
      configAsLabel: this.configAsLabel,
      label,
    });
  }

  addTask(label: string, extra: boolean, fn: () => void) {
    Measure.tasks.push({
      focused: false,
      config: ReflectDeep.clone(this.config),
      fn,
      extra,
      testName: this.testName,
      configAsLabel: this.configAsLabel,
      label,
    });
  }

  add(label: string, fn: () => void) {
    this.addTask(label, false, fn);
  }

  extra(label: string, fn: () => void) {
    this.addTask(label, true, fn);
  }
}

export const run = () => Measure.run();
export const createMeasure = (testName: string) => new Measure(testName);
