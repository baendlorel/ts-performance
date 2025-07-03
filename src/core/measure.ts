import chalk from 'chalk';
import { ReflectDeep } from 'reflect-deep';
import { results } from './result';

const CONFIG_LABEL = Symbol('config-label');
interface Config<T extends any[] = any[]> {
  RUN_TIME: number;
  ARRAY_SIZE: number;
  ARRAY_CREATOR: (size: number) => T;
  OTHER: Record<string, any>; // other configs
  [CONFIG_LABEL]: string;
}

interface Task {
  configs: Config[];
  taskFn: Function;
  focused: boolean;
  extra: boolean;

  // keys
  testName: string;
  // configAsLabel: string;  // & now load from Config[symbol]
  label: string;
}

type TaskFn = (config: Config, arr: any[]) => void;

const formatNum = (n: any | number) => {
  if (typeof n !== 'number') {
    return n;
  }
  const s = n.toString();
  return s.length > 5 ? `1e${s.length - 1}` : s;
};
class Measure {
  private static readonly tasks: Task[] = [];
  private static noFocusedTask = true;

  private testName: string = '';
  private configs: Config[] = [];
  private tasks: Task[] = [];

  static run() {
    const running = chalk.yellowBright('Running');
    for (const t of Measure.tasks) {
      if (Measure.noFocusedTask || t.focused) {
        const testName = chalk.rgb(255, 165, 0)(t.testName);
        const timeLabel = `${running} ${testName}`;
        console.time(timeLabel);

        for (const config of t.configs) {
          const arr = config.ARRAY_CREATOR(config.ARRAY_SIZE);
          const createAgain =
            arr.length !== 0 &&
            arr.some((a) => (typeof a === 'object' && a !== null) || typeof a === 'function');

          let arrayCreationTime = 0;
          const start = performance.now();
          for (let i = 1; i <= config.RUN_TIME; i++) {
            const copyArrStart = performance.now();
            const newArr = createAgain ? config.ARRAY_CREATOR(config.ARRAY_SIZE) : arr.slice();
            const copyArrEnd = performance.now();
            t.taskFn(config, newArr);
            arrayCreationTime += copyArrEnd - copyArrStart;
          }
          const end = performance.now();
          ReflectDeep.set(results, [t.testName, config[CONFIG_LABEL], t.label], {
            time: end - start - arrayCreationTime,
            extra: t.extra,
            config: { ...config },
          });
        }
        console.timeEnd(timeLabel);
      }
    }
  }

  private addTask(opts: { label: string; extra: boolean; focus: boolean; taskFn: TaskFn }) {
    this.tasks.push({
      configs: this.configs,
      taskFn: opts.taskFn,
      focused: opts.focus,
      extra: opts.extra,
      testName: this.testName,
      label: opts.label,
    });
  }

  private prepare(opts: { testName: string; blockFn: () => void; focus: boolean }) {
    this.testName = opts.testName;

    // clear previous datas
    this.tasks = [];
    this.configs = [];
    opts.blockFn();
    if (opts.focus) {
      Measure.noFocusedTask = false;
      this.tasks.forEach((t) => (t.focused = true));
    }
    Measure.tasks.push(...this.tasks);
  }

  test(testName: string, blockFn: () => void) {
    this.prepare({ testName, blockFn, focus: false });
  }

  ftest(testName: string, blockFn: () => void) {
    this.prepare({ testName, blockFn, focus: true });
  }

  addConfig(newConfig: Partial<Config>) {
    const {
      RUN_TIME = 1,
      ARRAY_SIZE = 0,
      ARRAY_CREATOR = () => [],
      OTHER = {},
    } = Object(newConfig) as Config;

    // # expects
    if (!Number.isSafeInteger(RUN_TIME) || RUN_TIME <= 0) {
      throw new Error('RUN_TIME must be a positive number');
    }
    if (!Number.isSafeInteger(ARRAY_SIZE) || ARRAY_SIZE < 0) {
      throw new Error('ARRAY_SIZE must be a non-negative integer');
    }
    if (typeof ARRAY_CREATOR !== 'function') {
      throw new Error('ARRAY_CREATOR must be a function or omitted');
    }
    if (typeof OTHER !== 'object') {
      throw new Error('ARRAY_CREATOR must be a function or omitted');
    }

    // # adding
    const label: string[] = [
      `${chalk.blueBright('RUN_TIME')}: ${chalk.cyanBright(formatNum(RUN_TIME))}`,
    ];
    if (ARRAY_SIZE > 0) {
      label.push(`${chalk.blueBright('ARRAY_SIZE')}: ${chalk.cyanBright(formatNum(ARRAY_SIZE))}`);
    }

    for (const k in OTHER) {
      const v = typeof OTHER[k] === 'number' ? formatNum(OTHER[k]) : OTHER[k];
      label.push(`${k}: ${chalk.cyanBright(v)}`);
    }

    this.configs.push({
      RUN_TIME,
      ARRAY_SIZE,
      ARRAY_CREATOR,
      OTHER,
      [CONFIG_LABEL]: label.join(', '),
    });
  }

  add(label: string, taskFn: TaskFn) {
    this.addTask({ label, extra: false, focus: false, taskFn });
  }

  extra(label: string, taskFn: TaskFn) {
    this.addTask({ label, extra: true, focus: false, taskFn });
  }
}

export const run = () => Measure.run();
export const measure = new Measure();
