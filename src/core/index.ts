import chalk from 'chalk';
import { ReflectDeep } from 'reflect-deep';

const results = {} as Record<string, Record<string, Record<string, number>>>;

type Config = Record<string, number | string> & { RUN_TIME: number };

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
      .filter(([key, value]) => key !== 'RUN_TIME')
      .map(([key, value]) => `${key}: ${chalk.green(value)}`);
    list.unshift(`${chalk.blueBright('RUN_TIME')}: ${chalk.green(this.config.RUN_TIME)}`);
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

export const displayResults = () => {
  console.log(`\n=== ${Object.keys(results).length} 个测试结果 ===`);
  for (const [testName, configToGroup] of Object.entries(results)) {
    console.log(chalk.bold.yellow(testName));
    for (const [configAsLabel, group] of Object.entries(configToGroup)) {
      const s = configAsLabel ? `[${configAsLabel}]` : chalk.gray('None');
      console.log(s);
      for (const [label, time] of Object.entries(group)) {
        console.log(`    ${chalk.yellow(label)}: ${chalk.red(time.toFixed(5))} ms`);
      }
    }
  }
};
