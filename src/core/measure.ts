import chalk from 'chalk';
import { ReflectDeep } from 'reflect-deep';
import { results } from './result';

const CONFIG_LABEL = Symbol('config-label');
type Config = Record<string, number | string> & {
  RUN_TIME: number;
  ARRAY_SIZE: number;
  [CONFIG_LABEL]: string;
};

const formatNum = (n: any | number) => {
  if (typeof n !== 'number') {
    return n;
  }
  const s = n.toString();
  return s.length > 5 ? `1e${s.length - 1}` : s;
};

type Task = {
  configs: Config[];
  fn: Function;
  focused: boolean;
  extra: boolean;

  // keys
  testName: string;
  // configAsLabel: string;  // & now load from Config[symbol]
  label: string;
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
          const start = performance.now();
          for (let i = 1; i <= config.RUN_TIME; i++) {
            t.fn(config);
          }
          const end = performance.now();
          ReflectDeep.set(results, [t.testName, config[CONFIG_LABEL], t.label], {
            time: end - start,
            extra: t.extra,
            config: { ...config },
          });
        }
        console.timeEnd(timeLabel);
      }
    }
  }

  private addTask(opts: {
    label: string;
    extra: boolean;
    focus: boolean;
    fn: (config: Config) => void;
  }) {
    this.tasks.push({
      configs: this.configs,
      fn: opts.fn,
      focused: opts.focus,
      extra: opts.extra,
      testName: this.testName,
      label: opts.label,
    });
  }

  private prepare(opts: { testName: string; fn: () => void; focus: boolean }) {
    this.testName = opts.testName;

    // clear previous datas
    this.tasks = [];
    this.configs = [];
    opts.fn();
    if (opts.focus) {
      Measure.noFocusedTask = false;
      this.tasks.forEach((t) => (t.focused = true));
    }
    Measure.tasks.push(...this.tasks);
  }

  test(testName: string, fn: () => void) {
    this.prepare({ testName, fn, focus: false });
  }

  ftest(testName: string, fn: () => void) {
    this.prepare({ testName, fn, focus: true });
  }

  addConfig(config: Partial<Config>) {
    const newConfig = Object.assign({ RUN_TIME: 1, ARRAY_SIZE: 0 }, config) as Config;
    const label: string[] = [
      `${chalk.blueBright('RUN_TIME')}: ${chalk.cyanBright(formatNum(newConfig.RUN_TIME))}`,
    ];
    for (const k in newConfig) {
      if (k === 'RUN_TIME') {
        continue;
      }
      if (k === 'ARRAY_SIZE' && newConfig.ARRAY_SIZE === 0) {
        continue; // skip if ARRAY_SIZE is not set
      }
      label.push(`${k}: ${chalk.cyanBright(formatNum(newConfig[k]))}`);
    }
    newConfig[CONFIG_LABEL] = label.join(', ');
    this.configs.push(newConfig);
  }

  add(label: string, fn: (config: Config) => void) {
    this.addTask({ label, extra: false, focus: false, fn });
  }

  extra(label: string, fn: (config: Config) => void) {
    this.addTask({ label, extra: true, focus: false, fn });
  }
}

export const run = () => Measure.run();
export const measure = new Measure();
