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
    ReflectDeep.set(
      results,
      [this.testName, this.configAsLabel, `${label}`],
      end - start
    );
  }
}

export const createMeasure = (testName: string) => new Measure(testName);

const getRatioColor = (ratio: number): [number, number, number] => {
  const ln = Math.log(ratio);
  const clampedLn = Math.max(0, Math.min(10, ln));
  const MID = 1.6;

  if (clampedLn <= MID) {
    // 0~5: 绿到黄 (绿色减少，红色增加)
    const t = clampedLn / MID;
    const r = Math.round(255 * t);
    const g = 255;
    const b = 0;
    return [r, g, b];
  } else {
    // 5~10: 黄到红 (绿色减少)
    const t = (clampedLn - MID) / MID;
    const r = 255;
    const g = Math.max(0, Math.round(255 * (1 - t)));
    const b = 0;
    return [r, g, b];
  }
};

const SPACE = ' '.repeat(4);
export const displayResults = () => {
  console.log();
  console.log(`=== ${Object.keys(results).length} Results ===`);
  console.log(`Time unit: ms`);
  for (const [testName, configToGroup] of Object.entries(results)) {
    console.log(chalk.bold.underline(testName));
    for (const [configStr, group] of Object.entries(configToGroup)) {
      console.log();
      console.log(SPACE, configStr);
      const arr = Array.from(Object.entries(group));
      const maxLabelLen = Math.max(...arr.map(([label]) => label.length));
      const maxTimeLen = Math.max(...arr.map(([_, time]) => time.toFixed(3).length));

      arr.sort((a, b) => a[1] - b[1]);
      const least = arr[0][1];

      for (let i = 0; i < arr.length; i++) {
        const [label, time] = arr[i];
        const padLabel = label.padEnd(maxLabelLen + 1, ' ');
        const padTime = time.toFixed(3).padEnd(maxTimeLen + 1, ' ');
        const ratio = (time / least).toFixed(2);
        const color = chalk.rgb(...getRatioColor(time / least));
        const msg =
          i === 0
            ? chalk.yellowBright(`${padLabel}: ${padTime}`)
            : `${padLabel}: ${chalk.gray(padTime)}`;
        console.log(SPACE.repeat(2), msg, color(`${ratio}x`));
      }
    }
    console.log();
  }
};
