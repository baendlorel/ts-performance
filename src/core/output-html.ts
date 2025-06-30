import { readdirSync, writeFileSync } from 'fs';
import { results, suggests } from './result';
import { join } from 'path';

// 清理 ANSI 控制字符
const stripAnsi = (str: string): string => {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
};

// 格式化数字，添加千分位逗号
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

// 格式化配置字符串中的科学计数法数字
const formatConfigString = (str: string): string => {
  // 匹配科学计数法数字 (如 1e7, 2.5e6 等)
  return str.replace(/(\d+(?:\.\d+)?)[eE]([+-]?\d+)/g, (match, base, exponent) => {
    const num = parseFloat(match);
    return formatNumber(num);
  });
};

// 颜色计算函数，返回CSS颜色
const getColor = (ratio: number): string => {
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
    return `rgb(${r}, ${g}, ${b})`;
  } else if (clampedLn <= 2 * MID) {
    // 5~10: 黄到红 (绿色减少)
    const t = (clampedLn - MID) / MID;
    const r = 255;
    const g = Math.max(0, Math.round(255 * (1 - t)));
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const r = (225 * (TOP - clampedLn)) / TOP + 30;
    return `rgb(${r}, 0, 0)`;
  }
};

const formatDateForFilename = (date = new Date()) => {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
};

const outputToHTML = (html: string) => {
  const id = readdirSync(join(process.cwd(), 'reports')).length + 1;
  const dtm = formatDateForFilename();
  const outputPath = join(process.cwd(), 'reports', `id${id}_${dtm}.html`);
  writeFileSync(outputPath, html, 'utf8');
  console.log(`HTML report generated: ${outputPath}`);
};

type Attr = Record<string, string> & { className: string };
type PseudoElementConstructArgs = {
  tag: string;
  attributes?: Attr;
  children?: PseudoElement[];
  innerHTML?: string;
};
class PseudoElement {
  private static id = 1;
  private readonly id: number;
  private readonly tag: string;
  private readonly attributes: Attr;
  private readonly children: PseudoElement[];

  public innerHTML: string = '';
  constructor(args: PseudoElementConstructArgs) {
    this.id = PseudoElement.id++;
    const { tag, attributes = { className: '' }, children = [], innerHTML = '' } = args;
    this.tag = tag;
    this.innerHTML = innerHTML;
    this.attributes = { ...attributes };
    this.children = children;
    if (!Array.isArray(children) || children.some((c) => !c.isPE)) {
      throw new Error('Invalid children');
    }
  }

  get isPE() {
    return true;
  }

  toHTML(): string {
    const innerHTML =
      this.children.length > 0
        ? this.children.map((c) => c.toHTML()).join('')
        : this.innerHTML;
    const attrs = Object.entries(this.attributes)
      .map(([key, value]) => {
        if (key === 'className') {
          return `class="${value}"`;
        } else {
          return `${key}="${value}"`;
        }
      })
      .join(' ');
    return `<${this.tag} ${attrs}>${innerHTML}</${this.tag}>`;
  }
}
const h = (args: PseudoElementConstructArgs) => new PseudoElement(args);

// 生成HTML页面
export const generateReport = () => {
  const len = Object.keys(results).length;

  // 准备 suggests 数据（复制 display.ts 的逻辑）
  for (const [testName, configToGroup] of Object.entries(results)) {
    suggests.set(testName, new Map());

    for (const [configStr, group] of Object.entries(configToGroup)) {
      const suggest = suggests.get(testName)!;
      suggest.set(configStr, []);
      const suggestMethods = suggest.get(configStr)!;

      const arr = Array.from(Object.entries(group));
      arr.sort((a, b) => a[1].time - b[1].time);
      const least = arr.find(([_, res]) => res.extra === false)![1];

      for (const [label, res] of arr) {
        const ratio = res.time / least.time;
        if (ratio < 1.25) {
          suggestMethods.push({ method: label, time: res.time, ratio, extra: res.extra });
        }
      }
    }
  }

  // 创建样式
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .header { 
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white; 
      padding: 30px; 
      text-align: center; 
    }
    .header h1 { 
      font-size: 2.5em; 
      margin-bottom: 10px; 
      font-weight: 300; 
    }
    .header .subtitle { 
      font-size: 1.2em; 
      opacity: 0.9; 
    }
    .content { 
      padding: 30px; 
    }
    .test-section { 
      margin-bottom: 40px; 
      border: 1px solid #e1e5e9; 
      border-radius: 8px; 
      overflow: hidden;
    }
    .test-title { 
      background: #f8f9fa; 
      padding: 20px; 
      font-size: 1.4em; 
      font-weight: 600; 
      color: #495057; 
      border-bottom: 1px solid #e1e5e9;
    }
    .config-section { 
      padding: 20px; 
    }
    .config-title { 
      font-size: 1.1em; 
      color: #6c757d; 
      margin-bottom: 15px; 
      font-weight: 500; 
    }
    .results-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 20px; 
    }
    .results-table th { 
      background: #e9ecef; 
      padding: 12px; 
      text-align: left; 
      font-weight: 600; 
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }
    .results-table td { 
      padding: 10px 12px; 
      border-bottom: 1px solid #dee2e6; 
    }
    .results-table tr:hover { 
      background: #f8f9fa; 
    }
    .method-name { 
      font-weight: 500; 
    }
    .time-value { 
      font-family: 'Courier New', monospace; 
      font-weight: 600; 
    }
    .ratio-badge { 
      padding: 4px 8px; 
      border-radius: 12px; 
      font-size: 0.85em; 
      font-weight: 600; 
      color: white;
    }
    .extra-badge { 
      background: #e83e8c; 
      color: white; 
      padding: 2px 6px; 
      border-radius: 4px; 
      font-size: 0.7em; 
      margin-left: 8px; 
    }
    .best-result { 
      background: #fff3cd !important; 
    }
    .suggests-section { 
      margin-top: 40px; 
      padding: 30px; 
      background: #f8f9fa; 
      border-radius: 8px; 
    }
    .suggests-title { 
      font-size: 1.8em; 
      color: #495057; 
      margin-bottom: 25px; 
      text-align: center; 
      font-weight: 300; 
    }
    .suggest-item { 
      display: flex; 
      align-items: center; 
      padding: 8px 0; 
    }
    .suggest-method { 
      font-weight: 600; 
      margin-right: 15px; 
      min-width: 200px; 
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      color: #6c757d; 
      border-top: 1px solid #e1e5e9; 
      background: #f8f9fa; 
    }
  `;

  // 创建主要内容
  const resultsContent: PseudoElement[] = [];

  for (const [testName, configToGroup] of Object.entries(results)) {
    const configSections: PseudoElement[] = [];

    for (const [configStr, group] of Object.entries(configToGroup)) {
      const arr = Array.from(Object.entries(group));
      arr.sort((a, b) => a[1].time - b[1].time);
      const least = arr.find(([_, res]) => res.extra === false)![1];

      const rows: PseudoElement[] = [];

      for (const [label, res] of arr) {
        const ratio = res.time / least.time;
        const isBest = res === least;

        const row = h({
          tag: 'tr',
          attributes: { className: isBest ? 'best-result' : '' },
          children: [
            h({
              tag: 'td',
              innerHTML: `<span class="method-name">${label}</span>${
                res.extra ? '<span class="extra-badge">EX</span>' : ''
              }`,
            }),
            h({
              tag: 'td',
              innerHTML: `<span class="time-value">${res.time.toFixed(3)} ms</span>`,
            }),
            h({
              tag: 'td',
              innerHTML: `<span class="ratio-badge" style="background-color: ${getColor(
                ratio
              )}">${ratio.toFixed(2)}x</span>`,
            }),
          ],
        });

        rows.push(row);
      }

      const table = h({
        tag: 'table',
        attributes: { className: 'results-table' },
        children: [
          h({
            tag: 'thead',
            children: [
              h({
                tag: 'tr',
                children: [
                  h({ tag: 'th', innerHTML: 'Method' }),
                  h({ tag: 'th', innerHTML: 'Time' }),
                  h({ tag: 'th', innerHTML: 'Ratio' }),
                ],
              }),
            ],
          }),
          h({
            tag: 'tbody',
            children: rows,
          }),
        ],
      });

      configSections.push(
        h({
          tag: 'div',
          attributes: { className: 'config-section' },
          children: [
            h({
              tag: 'div',
              attributes: { className: 'config-title' },
              innerHTML: formatConfigString(configStr),
            }),
            table,
          ],
        })
      );
    }

    resultsContent.push(
      h({
        tag: 'div',
        attributes: { className: 'test-section' },
        children: [
          h({
            tag: 'div',
            attributes: { className: 'test-title' },
            innerHTML: testName,
          }),
          ...configSections,
        ],
      })
    );
  }

  // 创建建议部分
  const suggestsContent: PseudoElement[] = [];

  suggests.forEach((configToGroup, testName) => {
    const testSuggests: PseudoElement[] = [];

    configToGroup.forEach((group, configStr) => {
      const suggestItems: PseudoElement[] = [];

      group.forEach(({ method, time, ratio, extra }) => {
        suggestItems.push(
          h({
            tag: 'div',
            attributes: { className: 'suggest-item' },
            children: [
              h({
                tag: 'span',
                attributes: {
                  className: `suggest-method ${extra ? 'extra-method' : ''}`,
                },
                innerHTML: `${method}${
                  extra ? '<span class="extra-badge">EX</span>' : ''
                }`,
              }),
              h({
                tag: 'span',
                attributes: { className: 'ratio-badge' },
                innerHTML: `<span class="ratio-badge" style="background-color: ${getColor(
                  ratio
                )}">${ratio.toFixed(2)}x</span>`,
              }),
            ],
          })
        );
      });

      if (configToGroup.size > 1) {
        testSuggests.push(
          h({
            tag: 'div',
            attributes: { className: 'config-title' },
            innerHTML: formatConfigString(configStr),
          })
        );
      }

      testSuggests.push(...suggestItems);
    });

    if (testSuggests.length > 0) {
      suggestsContent.push(
        h({
          tag: 'div',
          attributes: { className: 'test-section' },
          children: [
            h({
              tag: 'div',
              attributes: { className: 'test-title' },
              innerHTML: testName,
            }),
            h({
              tag: 'div',
              attributes: { className: 'config-section' },
              children: testSuggests,
            }),
          ],
        })
      );
    }
  });

  // 构建完整页面
  const page = h({
    tag: 'html',
    attributes: { className: '', lang: 'zh-CN' },
    children: [
      h({
        tag: 'head',
        children: [
          h({
            tag: 'meta',
            attributes: { className: '', charset: 'UTF-8' },
          }),
          h({
            tag: 'meta',
            attributes: {
              className: '',
              name: 'viewport',
              content: 'width=device-width, initial-scale=1.0',
            },
          }),
          h({
            tag: 'title',
            innerHTML: 'TypeScript Performance Test Report',
          }),
          h({
            tag: 'style',
            innerHTML: styles,
          }),
        ],
      }),
      h({
        tag: 'body',
        children: [
          h({
            tag: 'div',
            attributes: { className: 'container' },
            children: [
              h({
                tag: 'div',
                attributes: { className: 'header' },
                children: [
                  h({
                    tag: 'h1',
                    innerHTML: 'TypeScript Performance Report',
                  }),
                  h({
                    tag: 'div',
                    attributes: { className: 'subtitle' },
                    innerHTML: `${len} Test Results (Time unit: ms) - Generated on ${new Date().toLocaleString(
                      'zh-CN'
                    )}`,
                  }),
                ],
              }),
              h({
                tag: 'div',
                attributes: { className: 'content' },
                children: resultsContent,
              }),
              ...(suggestsContent.length > 0
                ? [
                    h({
                      tag: 'div',
                      attributes: { className: 'suggests-section' },
                      children: [
                        h({
                          tag: 'h2',
                          attributes: { className: 'suggests-title' },
                          innerHTML: '📋 Performance Suggestions',
                        }),
                        ...suggestsContent,
                      ],
                    }),
                  ]
                : []),
              h({
                tag: 'div',
                attributes: { className: 'footer' },
                innerHTML: `Report generated by TypeScript Performance Tester | ${formatDateForFilename()}`,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const html = '<!DOCTYPE html>\n' + page.toHTML();
  outputToHTML(html);
};
