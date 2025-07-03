import chalk from 'chalk';
import { ReflectDeep } from 'reflect-deep';
import { results } from './result';

const CONFIG_LABEL = Symbol('config-label');

interface BaseConfig {
  runTime: number;
  size: number;
  dataReusable: boolean;
}

interface FullConfig extends BaseConfig {
  createData: (config: Partial<Config>) => unknown;

  // allow other properties
  [key: string]: any;

  // internal
  [CONFIG_LABEL]: string;
}

interface Config extends BaseConfig {
  // allow other properties
  [key: string]: any;
}

interface Task {
  configs: FullConfig[];
  taskFn: Function;
  focused: boolean;
  extra: boolean;

  // keys
  testName: string;
  // configAsLabel: string;  // & now load from Config[symbol]
  label: string;
}

type TaskFn = (config: FullConfig, data: any) => void;

const formatNum = (n: any | number) => {
  if (typeof n !== 'number') {
    return n;
  }
  const s = n.toString();
  return s.length > 5 ? `1e${s.length - 1}` : s;
};

const toUpperSnake = (name: string) => {
  if (/^[A-Z_]+$/g.test(name)) {
    return name;
  }
  return name.replace(/([A-Z])/g, '_$1').toUpperCase();
};

class Measure {
  private static readonly tasks: Task[] = [];
  private static noFocusedTask = true;

  private testName: string = '';
  private configs: FullConfig[] = [];
  private tasks: Task[] = [];

  static run() {
    const running = chalk.yellowBright('Running');
    for (const t of Measure.tasks) {
      if (Measure.noFocusedTask || t.focused) {
        const testName = chalk.rgb(255, 165, 0)(t.testName);
        const timeLabel = `${running} ${testName}`;
        console.time(timeLabel);

        for (const config of t.configs) {
          const data = config.createData(config);
          const copy = config.dataReusable ? () => data : () => config.createData(config);

          let arrayCreationTime = 0;
          const start = performance.now();
          for (let i = 1; i <= config.runTime; i++) {
            const copyStart = performance.now();
            const newData = copy();
            const copyEnd = performance.now();
            t.taskFn(config, newData);
            arrayCreationTime += copyEnd - copyStart;
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

  addConfig<T extends Partial<Config>>(newConfig: T, dataCreator?: (config: T) => unknown) {
    const { runTime = 1, size = 0, dataReusable = true } = Object(newConfig) as Config;
    dataCreator = dataCreator ?? ((config: T) => {});

    // # expects
    if (!Number.isSafeInteger(runTime) || runTime <= 0) {
      throw new Error('RUN_TIME must be a positive number');
    }
    if (typeof dataCreator !== 'function') {
      throw new Error('DATA_CREATOR must be a function or omitted');
    }
    if (typeof size !== 'number' || !Number.isSafeInteger(size) || size < 0) {
      throw new Error('ARRAY_SIZE must be a non-negative integer or omitted');
    }

    // # adding
    const label: string[] = [
      `${chalk.blueBright('RUN_TIME')}: ${chalk.cyanBright(formatNum(runTime))}`,
    ];

    const exclude: (keyof BaseConfig)[] = ['runTime', 'dataReusable'];
    const SIZE: keyof BaseConfig = 'size';
    for (const k in newConfig) {
      if (exclude.includes(k as keyof BaseConfig)) {
        continue;
      }
      if (k === SIZE) {
        label.push(`${toUpperSnake(SIZE)}: ${chalk.cyanBright(formatNum(newConfig.size))}`);
        continue;
      }
      const v = typeof newConfig[k] === 'number' ? formatNum(newConfig[k]) : newConfig[k];
      label.push(`${toUpperSnake(k)}: ${chalk.cyanBright(v)}`);
    }

    this.configs.push({
      runTime,
      size,
      dataReusable,
      createData: dataCreator as (config: Partial<Config>) => unknown,
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
