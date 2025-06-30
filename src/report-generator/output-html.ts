import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';

import { results, suggests } from '@/core/result';
import { h, PseudoElement } from './pseudo-element';

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
  str = stripAnsi(str);
  // 匹配科学计数法数字 (如 1e7, 2.5e6 等)
  return str.replace(/(\d+(?:\.\d+)?)[eE]([+-]?\d+)/g, (match, base, exponent) => {
    const num = parseFloat(match);
    return formatNumber(num);
  });
};

// 颜色计算函数，返回CSS颜色和文字颜色
const getColor = (ratio: number): { bgColor: string; textColor: string } => {
  const ln = Math.log(ratio);
  const TOP = 10;
  const clampedLn = Math.max(0, Math.min(TOP, ln));
  const MID = 1.6;

  let r: number, g: number, b: number;

  if (clampedLn <= MID) {
    // 0~5: 绿到黄 (绿色减少，红色增加)
    const t = clampedLn / MID;
    r = Math.round(255 * t);
    g = 255;
    b = 0;
  } else if (clampedLn <= 2 * MID) {
    // 5~10: 黄到红 (绿色减少)
    const t = (clampedLn - MID) / MID;
    r = 255;
    g = Math.max(0, Math.round(255 * (1 - t)));
    b = 0;
  } else {
    r = (225 * (TOP - clampedLn)) / TOP + 30;
    g = 0;
    b = 0;
  }

  const bgColor = `rgb(${r}, ${g}, ${b})`;

  // 改进的亮度计算和文字颜色决策
  const grayscale = Math.floor(r * 0.299 + g * 0.587 + b * 0.114);

  const textColor = grayscale > 128 ? '#000' : '#fff';

  return { bgColor, textColor };
};

const formatDTForFilename = (date = new Date()) => {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
};

const formatDT = (date = new Date()) => {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const outputToHTML = (html: string, reportId: number) => {
  const dtm = formatDTForFilename();
  const outputPath = join(process.cwd(), 'reports', `id_${reportId}__${dtm}.html`);
  writeFileSync(outputPath, html, 'utf8');
  console.log(
    chalk.yellowBright(`HTML Report Generated`),
    chalk.green(relative(process.cwd(), outputPath))
  );
};

// 生成HTML页面
export const generateReport = () => {
  const reportId =
    readdirSync(join(process.cwd(), 'reports')).reduce((prev, cur) => {
      const isReport = /^id_[\d]+__[\d]{4}-[\d]{2}-[\d]{2}_[\d]{2}-[\d]{2}-[\d]{2}\u002Ehtml$/.test(
        cur
      );
      const idStr = cur.replace('id_', '').replace(/__[.]*$/, '');
      return isReport ? Math.max(prev, parseInt(idStr)) : prev;
    }, 0) + 1;

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
          suggestMethods.push({
            approach: label,
            time: res.time,
            ratio,
            extra: res.extra,
          });
        }
      }
    }
  }

  // 创建样式
  const styles = readFileSync(join(__dirname, 'style.css'), 'utf-8');

  // JavaScript代码用于展开/折叠功能和标签页切换
  const script = readFileSync(join(__dirname, 'main.js'), 'utf-8');

  // 创建控制按钮
  const controlsContainer = h({
    tag: 'div',
    attributes: {
      className: 'controls-container',
      tabgroup: 'results',
    },
    children: [
      h({
        tag: 'div',
        attributes: { className: 'controls-left' },
        children: [
          h({
            tag: 'button',
            attributes: {
              className: 'control-btn expand',
              onclick: 'toggleAllSections(false)',
            },
            innerHTML: 'Expand All',
          }),
          h({
            tag: 'button',
            attributes: {
              className: 'control-btn collapse',
              onclick: 'toggleAllSections(true)',
            },
            innerHTML: 'Collapse All',
          }),
        ],
      }),
      h({
        tag: 'div',
        attributes: { className: 'controls-right' },
        children: [
          h({
            tag: 'input',
            attributes: {
              type: 'text',
              id: 'searchInput',
              className: 'search-input',
              placeholder: 'Filter approaches...',
            },
          }),
          h({
            tag: 'button',
            attributes: {
              className: 'control-btn clear',
              onclick: 'clearSearch()',
            },
            innerHTML: 'Clear',
          }),
        ],
      }),
    ],
  });

  // 创建标签页按钮
  const tabButtons = h({
    tag: 'div',
    attributes: { className: 'tab-buttons' },
    children: [
      h({
        tag: 'button',
        attributes: {
          className: 'tab-btn',
          onclick: "switchTab('results')",
        },
        innerHTML: '<span class="emoji">📊</span><span>Performance Results</span>',
      }),
      h({
        tag: 'button',
        attributes: {
          className: 'tab-btn',
          onclick: "switchTab('suggests')",
        },
        innerHTML: '<span class="emoji">📋</span><span>Performance Suggestions</span>',
      }),
    ],
  });

  // 创建主要内容
  const resultsContent: PseudoElement[] = [];
  const navigationItems: PseudoElement[] = [];

  // 添加"显示全部"导航项
  navigationItems.push(
    h({
      tag: 'div',
      attributes: {
        className: 'nav-item active',
        onclick: 'showAllTests()',
      },
      innerHTML: '📊 Show All Tests',
    })
  );

  let testIndex = 0;
  for (const [testName, configToGroup] of Object.entries(results)) {
    testIndex++;
    const configSections: PseudoElement[] = [];

    for (const [configStr, group] of Object.entries(configToGroup)) {
      const arr = Array.from(Object.entries(group));
      arr.sort((a, b) => a[1].time - b[1].time);
      const least = arr.find(([_, res]) => res.extra === false)![1];

      const rows: PseudoElement[] = [];

      for (const [label, res] of arr) {
        const ratio = res.time / least.time;
        const isBest = res === least;

        const methodCell = h({
          tag: 'td',
          innerHTML: `<span class="approach-name">${label}</span>${
            res.extra ? '<span class="extra-badge">EX</span>' : ''
          }`,
        });

        const timeCell = h({
          tag: 'td',
          innerHTML: `<span class="time-value">${res.time.toFixed(3)} ms</span>`,
        });

        const { bgColor, textColor } = getColor(ratio);
        const ratioCell = h({
          tag: 'td',
          innerHTML: `<span class="ratio-badge" style="background-color: ${bgColor}; color: ${textColor}">${ratio.toFixed(
            2
          )}x</span>`,
        });

        const row = h({
          tag: 'tr',
          attributes: { className: isBest ? 'best-result' : '' },
          children: [methodCell, timeCell, ratioCell],
        });

        rows.push(row);
      }

      const tableHeaders = [
        h({ tag: 'th', innerHTML: 'Approach' }),
        h({ tag: 'th', innerHTML: 'Time' }),
        h({ tag: 'th', innerHTML: 'Ratio' }),
      ];

      const tableHeaderRow = h({
        tag: 'tr',
        children: tableHeaders,
      });

      const tableHead = h({
        tag: 'thead',
        children: [tableHeaderRow],
      });

      const tableBody = h({
        tag: 'tbody',
        children: rows,
      });

      const table = h({
        tag: 'table',
        attributes: { className: 'results-table' },
        children: [tableHead, tableBody],
      });

      const configTitle = h({
        tag: 'div',
        attributes: { className: 'config-title' },
        innerHTML: formatConfigString(configStr),
      });

      configSections.push(
        h({
          tag: 'div',
          attributes: { className: 'config-section' },
          children: [configTitle, table],
        })
      );
    }

    const testTitle = h({
      tag: 'div',
      attributes: { className: 'test-title' },
      innerHTML: `<span class="test-number">${testIndex}.</span> ${testName}`,
    });

    const testContent = h({
      tag: 'div',
      attributes: { className: 'test-content' },
      children: configSections,
    });

    const testSection = h({
      tag: 'div',
      attributes: {
        className: 'test-section',
        'data-test-name': testName,
      },
      children: [testTitle, testContent],
    });

    resultsContent.push(testSection);

    // 添加导航项
    navigationItems.push(
      h({
        tag: 'div',
        attributes: {
          className: 'nav-item',
          onclick: `showTest('${testName}')`,
        },
        innerHTML: `<span class="nav-number">${testIndex}.</span> ${testName}`,
      })
    );
  }

  // 创建导航栏
  const navigation = h({
    tag: 'div',
    attributes: { className: 'test-navigation' },
    children: navigationItems,
  });

  // 创建结果容器
  const resultsContainer = h({
    tag: 'div',
    attributes: { className: 'results-container' },
    children: resultsContent,
  });

  // 创建带导航的内容区域
  const resultsWithNav = h({
    tag: 'div',
    attributes: { className: 'results-with-nav' },
    children: [navigation, resultsContainer],
  });

  // 创建建议部分
  const suggestsContent: PseudoElement[] = [];
  const suggestNavigationItems: PseudoElement[] = [];

  // 添加"显示全部"导航项
  suggestNavigationItems.push(
    h({
      tag: 'div',
      attributes: {
        className: 'nav-item active',
        onclick: 'showAllSuggests()',
      },
      innerHTML: '📋 Show All Suggestions',
    })
  );

  // 添加建议标题
  if (suggests.size > 0) {
    // suggestsContent.push(
    //   h({
    //     tag: 'h2',
    //     attributes: { className: 'suggests-title' },
    //     innerHTML: '📋 Performance Suggestions',
    //   })
    // );
  }

  let suggestIndex = 0;
  suggests.forEach((configToGroup, testName) => {
    suggestIndex++;
    const cardContent: PseudoElement[] = [];

    configToGroup.forEach((group, configStr) => {
      const suggestItems: PseudoElement[] = [];

      group.forEach(({ approach: approach, time, ratio, extra }) => {
        const methodSpan = h({
          tag: 'span',
          attributes: {
            className: `suggest-approach ${extra ? 'extra-approach' : ''}`,
          },
          innerHTML: `${approach}${extra ? '<span class="extra-badge">EX</span>' : ''}`,
        });

        const { bgColor, textColor } = getColor(ratio);
        const ratioSpan = h({
          tag: 'span',
          attributes: { className: 'ratio-badge' },
          innerHTML: `<span class="ratio-badge" style="background-color: ${bgColor}; color: ${textColor}">${ratio.toFixed(
            2
          )}x</span>`,
        });

        suggestItems.push(
          h({
            tag: 'div',
            attributes: { className: 'suggest-item' },
            children: [methodSpan, ratioSpan],
          })
        );
      });

      if (configToGroup.size > 1) {
        const configTitle = h({
          tag: 'div',
          attributes: { className: 'config-title' },
          innerHTML: formatConfigString(configStr),
        });
        cardContent.push(configTitle);
      }

      cardContent.push(...suggestItems);
    });

    if (cardContent.length > 0) {
      const suggestCard = h({
        tag: 'div',
        attributes: {
          className: 'suggest-card',
          'data-suggest-name': testName,
        },
        children: [
          h({
            tag: 'div',
            attributes: { className: 'suggest-card-left' },
            children: [
              h({
                tag: 'div',
                attributes: { className: 'suggest-card-title' },
                innerHTML: `<span class="suggest-number">${suggestIndex}.</span> ${testName}`,
              }),
            ],
          }),
          h({
            tag: 'div',
            attributes: { className: 'suggest-card-right' },
            children: [
              h({
                tag: 'div',
                attributes: { className: 'suggest-card-content' },
                children: cardContent,
              }),
            ],
          }),
        ],
      });

      suggestsContent.push(suggestCard);

      // 添加建议导航项
      suggestNavigationItems.push(
        h({
          tag: 'div',
          attributes: {
            className: 'nav-item',
            onclick: `showSuggest('${testName}')`,
          },
          innerHTML: `<span class="nav-number">${suggestIndex}.</span> ${testName}`,
        })
      );
    }
  });

  // 创建建议导航栏
  const suggestNavigation = h({
    tag: 'div',
    attributes: { className: 'test-navigation' },
    children: suggestNavigationItems,
  });

  // 创建建议容器
  const suggestsContainer = h({
    tag: 'div',
    attributes: { className: 'results-container' },
    children: suggestsContent,
  });

  // 创建带导航的建议区域
  const suggestsWithNav = h({
    tag: 'div',
    attributes: { className: 'results-with-nav' },
    children: [suggestNavigation, suggestsContainer],
  });

  // 构建完整页面
  const metaCharset = h({
    tag: 'meta',
    attributes: { className: '', charset: 'UTF-8' },
  });

  const metaViewport = h({
    tag: 'meta',
    attributes: {
      className: '',
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0',
    },
  });

  const pageTitle = h({
    tag: 'title',
    innerHTML: 'TypeScript Performance Test Report',
  });

  const pageStyles = h({
    tag: 'style',
    innerHTML: styles,
  });

  const pageScript = h({
    tag: 'script',
    innerHTML: script,
  });

  const pageHead = h({
    tag: 'head',
    children: [metaCharset, metaViewport, pageTitle, pageStyles, pageScript],
  });

  const headerTitle = h({
    tag: 'h1',
    innerHTML: `TypeScript Performance Report <small style="opacity:0.8;">#${reportId}</small>`,
  });

  const headerSubtitle = h({
    tag: 'div',
    attributes: { className: 'subtitle' },
    innerHTML: `${len} Test Results (Time unit: ms) - Generated on ${formatDT()}`,
  });

  const pageHeader = h({
    tag: 'div',
    attributes: { className: 'header' },
    children: [headerTitle, headerSubtitle],
  });

  // 创建 Results 标签页内容
  const resultsTabContent = h({
    tag: 'div',
    attributes: {
      className: 'tab-content',
      id: 'results-content',
      tabgroup: 'results',
    },
    children: [resultsWithNav],
  });

  // 创建 Suggests 标签页内容
  const suggestsTabContent = h({
    tag: 'div',
    attributes: {
      className: 'tab-content',
      id: 'suggests-content',
      tabgroup: 'suggests',
    },
    children:
      suggestsContent.length > 0
        ? [suggestsWithNav]
        : [
            h({
              tag: 'div',
              attributes: { className: 'no-suggestions' },
              innerHTML:
                '<p style="text-align: center; color: #6c757d; padding: 40px;">No performance suggestions available.</p>',
            }),
          ],
  });

  // 创建标签页容器
  const tabsContainer = h({
    tag: 'div',
    attributes: { className: 'tabs-container' },
    children: [tabButtons, controlsContainer, resultsTabContent, suggestsTabContent],
  });

  const mainContent = h({
    tag: 'div',
    attributes: { className: 'content' },
    children: [tabsContainer],
  });

  const pageFooter = h({
    tag: 'div',
    attributes: { className: 'footer' },
    innerHTML: `Report generated by TypeScript Performance Tester | ${formatDT()}`,
  });

  const containerChildren = [pageHeader, mainContent, pageFooter];

  const pageContainer = h({
    tag: 'div',
    attributes: { className: 'container' },
    children: containerChildren,
  });

  const pageBody = h({
    tag: 'body',
    children: [pageContainer],
  });

  const page = h({
    tag: 'html',
    attributes: { className: '', lang: 'zh-CN' },
    children: [pageHead, pageBody],
  });

  const html = '<!DOCTYPE html>\n' + page.toHTML();
  outputToHTML(html, reportId);
};
