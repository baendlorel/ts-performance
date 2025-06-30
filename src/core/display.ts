import chalk, { ChalkInstance } from 'chalk';
import { results, suggests } from './result';

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
  const len = Object.keys(results).length;
  const title = chalk.blueBright(`${len} Results (Time unit: ms)`);
  console.log(`========= ${title} =========`);
  console.log();

  for (const [testName, configToGroup] of Object.entries(results)) {
    const pad = ''; // ''.padEnd(title.length - testName.length, '=');
    console.log(chalk.bold.underline(testName), pad);

    // Prepare suggest map
    suggests.set(testName, new Map());

    for (const [configStr, group] of Object.entries(configToGroup)) {
      console.log();
      console.log(SPACE, configStr);

      // Prepare suggest map
      const suggest = suggests.get(testName)!;
      suggest.set(configStr, []);
      const suggestMethods = suggest.get(configStr)!;

      // Padding output
      const arr = Array.from(Object.entries(group));
      const maxLabelLen = Math.max(...arr.map(([label]) => label.length));
      const maxTimeLen = Math.max(...arr.map(([_, res]) => res.time.toFixed(3).length));

      // sort ascending order
      arr.sort((a, b) => a[1].time - b[1].time);
      // const least = arr[0][1];
      const least = arr.find(([_, res]) => res.extra === false)![1];

      for (let i = 0; i < arr.length; i++) {
        const [label, res] = arr[i];
        const time = res.time;
        const padLabel = label.padEnd(maxLabelLen + 1, ' ');
        const padTime = time.toFixed(3).padEnd(maxTimeLen + 1, ' ');
        const ratio = time / least.time;
        const ratioStr = color(ratio)(`${ratio.toFixed(2)}x`);

        if (ratio < 1.25) {
          suggestMethods.push({ approach: label, time, ratio, extra: res.extra });
        }

        const msg =
          res === least
            ? chalk.yellowBright(`${padLabel}: ${padTime}`)
            : `${padLabel}: ${chalk.gray(padTime)}`;

        const EX = res.extra ? chalk.bgMagenta('EX') : '';

        console.log(SPACE.repeat(2), msg, ratioStr, EX);
      }
    }

    console.log();
  }
};

export const displaySuggests = () => {
  const title = chalk.blueBright(`Suggests`);
  console.log(`========= ${title} =========`);
  console.log();

  suggests.forEach((configToGroup, testName) => {
    console.log(chalk.bold.underline(testName));
    configToGroup.forEach((group, configStr) => {
      if (configToGroup.size > 1) {
        // Only display configStr if there are multiple configs
        console.log(SPACE, configStr);
      }
      const maxLen = Math.max(...group.map(({ approach }) => approach.length));
      group.forEach(({ approach, time, ratio, extra }) => {
        const padMethod = (extra ? chalk.magentaBright : chalk.yellowBright)(
          approach.padEnd(maxLen + 1, ' ')
        );
        const ratioStr = color(ratio)(`${ratio.toFixed(2)}x`);
        const EX = extra ? chalk.bgMagenta('EX') : '';
        console.log(SPACE.repeat(2), `${padMethod}: ${ratioStr}`, EX);
      });
    });
    console.log();
  });
};
