import chalk, { ChalkInstance } from 'chalk';
import { results } from './result';

const color = (ratio: number): ChalkInstance => {
  const ln = Math.log(ratio);
  const TOP = 10;
  const clampedLn = Math.max(0, Math.min(TOP, ln));
  const MID = 1.6;

  if (clampedLn <= MID) {
    // 0~5: 绿到黄 (绿色减少，红色增加)
    const t = clampedLn / MID;
    const r = Math.round(255 * t);
    const g = 255;
    const b = 0;
    return chalk.rgb(r, g, b);
  } else if (clampedLn <= 2 * MID) {
    // 5~10: 黄到红 (绿色减少)
    const t = (clampedLn - MID) / MID;
    const r = 255;
    const g = Math.max(0, Math.round(255 * (1 - t)));
    const b = 0;
    return chalk.rgb(r, g, b);
  } else {
    const r = (225 * (TOP - clampedLn)) / TOP + 30;
    return chalk.bgRgb(r, 0, 0).white;
  }
};

const SPACE = ' '.repeat(4);
export const displayResults = () => {
  console.log();
  const len = Object.keys(results).length;
  const title = chalk.blueBright(`${len} Results (Time unit: ms)`);
  console.log(`========= ${title} =========`);
  console.log();

  for (const [testName, configToGroup] of Object.entries(results)) {
    const pad = ''.padEnd(title.length - testName.length, '=');
    console.log(chalk.bold.underline(testName), pad);

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
        const ratio = time / least;

        const msg =
          i === 0
            ? chalk.yellowBright(`${padLabel}: ${padTime}`)
            : `${padLabel}: ${chalk.gray(padTime)}`;
        console.log(SPACE.repeat(2), msg, color(ratio)(`${ratio.toFixed(2)}x`));
      }
    }

    console.log();
  }
};
