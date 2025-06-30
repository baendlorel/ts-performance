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

  // 计算亮度并决定文字颜色
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness > 150 ? '#000' : '#fff';

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

const outputToHTML = (html: string) => {
  const id = readdirSync(join(process.cwd(), 'reports')).length + 1;
  const dtm = formatDTForFilename();
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
  private readonly id: string;
  private readonly tag: string;
  private readonly attributes: Attr;
  private readonly children: PseudoElement[];

  public innerHTML: string = '';
  constructor(args: PseudoElementConstructArgs) {
    this.id = `el${PseudoElement.id++}`;
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

  // 生成JavaScript代码来引用这个元素
  jsRef(): string {
    return `document.getElementById('${this.id}')`;
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
    return `<${this.tag} id="${this.id}" ${attrs}>${innerHTML}</${this.tag}>`;
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
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #f8f9fa 0%, #bfc5cb 100%);
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
      background: linear-gradient(135deg, rgb(42 165 255) 0%, #1e3a8a 100%);
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
      padding: 10px 20px; 
      font-size: 1.4em; 
      font-weight: 600; 
      color: #495057; 
      border-bottom: 1px solid #e1e5e9;
      cursor: pointer;
      user-select: none;
      position: relative;
      transition: background-color 0.2s ease;
    }
    .test-title:hover {
      background: #e9ecef;
    }
    .test-title::after {
      content: '▼';
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      transition: transform 0.3s ease;
      font-size: 0.8em;
    }
    .test-title.collapsed::after {
      transform: translateY(-50%) rotate(-90deg);
    }
    .test-content {
      overflow: hidden;
      transition: max-height 0.3s ease;
      max-height: 1000px;
    }
    .test-content.collapsed {
      max-height: 0;
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
      position: relative;
    }
    .results-table th:nth-child(n+2) {
      transition: background-color 0.2s ease;
    }
    .results-table th:nth-child(n+2):hover {
      background: #dee2e6;
    }
    .results-table td { 
      padding: 6px 12px; 
      border-bottom: 1px solid #dee2e6; 
    }
    .results-table tr:hover { 
      background: #f8f9fa; 
    }
    .approach-name { 
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
    .best-result .ratio-badge {
      color: #000 !important;
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
    .suggest-approach { 
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

  // JavaScript代码用于展开/折叠功能
  const script = `
    document.addEventListener('DOMContentLoaded', function() {
      const testTitles = document.querySelectorAll('.test-title');
      
      testTitles.forEach(title => {
        title.addEventListener('click', function() {
          const content = this.nextElementSibling;
          if (content && content.classList.contains('test-content')) {
            this.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
            
            // 使用ID存储展开/折叠状态到localStorage
            const titleId = this.id;
            const isCollapsed = this.classList.contains('collapsed');
            localStorage.setItem('collapse_' + titleId, isCollapsed.toString());
          }
        });
        
        // 恢复之前的展开/折叠状态
        const titleId = title.id;
        const savedState = localStorage.getItem('collapse_' + titleId);
        if (savedState === 'true') {
          title.classList.add('collapsed');
          const content = title.nextElementSibling;
          if (content && content.classList.contains('test-content')) {
            content.classList.add('collapsed');
          }
        }
      });
      
      // 添加全局展开/折叠控制和搜索功能
      const header = document.querySelector('.header');
      const content = document.querySelector('.content');
      if (header && content) {
        const controlsDiv = document.createElement('div');
        controlsDiv.innerHTML = \`
          <div style="background: #f8f9fa; padding: 20px; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; gap: 10px;">
              <button onclick="toggleAllSections(false)" style="padding: 8px 16px; background: #007bff; border: none; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Expand All</button>
              <button onclick="toggleAllSections(true)" style="padding: 8px 16px; background: #6c757d; border: none; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Collapse All</button>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="text" id="searchInput" placeholder="Search methods..." style="padding: 8px 12px; border: 1px solid #ced4da; background: white; color: #495057; border-radius: 4px; width: 250px; font-size: 14px;">
              <button onclick="clearSearch()" style="padding: 8px 16px; background: #6c757d; border: none; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">Clear</button>
            </div>
          </div>
        \`;
        
        // 将控制区域插入到content的第一个位置
        content.insertBefore(controlsDiv, content.firstChild);
        
        // 重要：重新选择所有元素，因为DOM结构已经改变
        setTimeout(() => {
          const searchInput = document.getElementById('searchInput');
          if (searchInput) {
            searchInput.addEventListener('input', function() {
              filterResults(this.value);
            });
          }
        }, 10);
      }
    });
    
    function toggleAllSections(collapse) {
      const testTitles = document.querySelectorAll('.test-title');
      testTitles.forEach(title => {
        const content = title.nextElementSibling;
        if (content && content.classList.contains('test-content')) {
          if (collapse) {
            title.classList.add('collapsed');
            content.classList.add('collapsed');
          } else {
            title.classList.remove('collapsed');
            content.classList.remove('collapsed');
          }
          // 保存状态
          localStorage.setItem('collapse_' + title.id, collapse.toString());
        }
      });
    }
    
    // 添加表格排序功能
    function addTableSorting() {
      const tables = document.querySelectorAll('.results-table');
      tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
          if (index > 0) { // 不对Method列排序，只对Time和Ratio列排序
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            header.title = 'Click to sort';
            header.innerHTML += ' ↕️';
            header.addEventListener('click', () => sortTable(table, index));
          }
        });
      });
    }
    
    function sortTable(table, columnIndex) {
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      
      rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        
        if (columnIndex === 1) { // Time column
          const aValue = parseFloat(aText.replace(' ms', ''));
          const bValue = parseFloat(bText.replace(' ms', ''));
          return aValue - bValue;
        } else if (columnIndex === 2) { // Ratio column
          const aValue = parseFloat(aText.replace('x', ''));
          const bValue = parseFloat(bText.replace('x', ''));
          return aValue - bValue;
        }
        return 0;
      });
      
      rows.forEach(row => tbody.appendChild(row));
    }
    
    // 页面加载完成后初始化所有功能
    setTimeout(() => {
      addTableSorting();
      
      // 添加快捷键支持
      document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
          switch(e.key) {
            case 'e':
              e.preventDefault();
              toggleAllSections(false);
              break;
            case 'c':
              e.preventDefault();
              toggleAllSections(true);
              break;
          }
        }
      });
    }, 100);
    
    function filterResults(searchTerm) {
      const rows = document.querySelectorAll('.results-table tbody tr');
      const testSections = document.querySelectorAll('.test-section');
      const term = searchTerm.toLowerCase();
      
      // 清除之前的高亮
      document.querySelectorAll('.highlight').forEach(el => {
        el.outerHTML = el.innerHTML;
      });
      
      testSections.forEach(section => {
        const sectionRows = section.querySelectorAll('.results-table tbody tr');
        let hasVisibleRows = false;
        
        sectionRows.forEach(row => {
          const methodCell = row.cells[0];
          const methodText = methodCell.textContent.toLowerCase();
          
          if (!term || methodText.includes(term)) {
            row.style.display = '';
            hasVisibleRows = true;
            
            // 添加高亮
            if (term) {
              const methodName = methodCell.querySelector('.approach-name');
              if (methodName) {
                const originalText = methodName.textContent;
                const escapedTerm = term.replace(/[.*+?$^{}()|[\\]\\]/g, '\\\\$&');
                const highlightedText = originalText.replace(new RegExp('(' + escapedTerm + ')', 'gi'), '<span class="highlight" style="background-color: #ffeb3b; color: #000; padding: 1px 2px; border-radius: 2px;">$1</span>');
                methodName.innerHTML = highlightedText;
              }
            }
          } else {
            row.style.display = 'none';
          }
        });
        
        // 显示或隐藏整个test section
        if (hasVisibleRows || !term) {
          section.style.display = '';
        } else {
          section.style.display = 'none';
        }
      });
    }
    
    function clearSearch() {
      document.getElementById('searchInput').value = '';
      filterResults('');
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
      innerHTML: testName,
    });

    const testContent = h({
      tag: 'div',
      attributes: { className: 'test-content' },
      children: configSections,
    });

    resultsContent.push(
      h({
        tag: 'div',
        attributes: { className: 'test-section' },
        children: [testTitle, testContent],
      })
    );
  }

  // 创建建议部分
  const suggestsContent: PseudoElement[] = [];

  suggests.forEach((configToGroup, testName) => {
    const testSuggests: PseudoElement[] = [];

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
        testSuggests.push(configTitle);
      }

      testSuggests.push(...suggestItems);
    });

    if (testSuggests.length > 0) {
      const suggestTestTitle = h({
        tag: 'div',
        attributes: { className: 'test-title' },
        innerHTML: testName,
      });

      const suggestConfigSection = h({
        tag: 'div',
        attributes: { className: 'config-section' },
        children: testSuggests,
      });

      suggestsContent.push(
        h({
          tag: 'div',
          attributes: { className: 'test-section' },
          children: [suggestTestTitle, suggestConfigSection],
        })
      );
    }
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
    innerHTML: 'TypeScript Performance Report',
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

  const mainContent = h({
    tag: 'div',
    attributes: { className: 'content' },
    children: resultsContent,
  });

  const suggestsTitle = h({
    tag: 'h2',
    attributes: { className: 'suggests-title' },
    innerHTML: '📋 Performance Suggestions',
  });

  const suggestsSection =
    suggestsContent.length > 0
      ? h({
          tag: 'div',
          attributes: { className: 'suggests-section' },
          children: [suggestsTitle, ...suggestsContent],
        })
      : null;

  const pageFooter = h({
    tag: 'div',
    attributes: { className: 'footer' },
    innerHTML: `Report generated by TypeScript Performance Tester | ${formatDT()}`,
  });

  const containerChildren = [pageHeader, mainContent];
  if (suggestsSection) {
    containerChildren.push(suggestsSection);
  }
  containerChildren.push(pageFooter);

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
  outputToHTML(html);
};
