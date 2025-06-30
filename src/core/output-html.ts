import { readdirSync, writeFileSync } from 'fs';
import { results, suggests } from './result';
import { join } from 'path';

// 清理 ANSI 控制字符
const stripAnsi = (str: string): string => {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
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

function formatDateForFilename(date = new Date()) {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
}

// 生成HTML页面
export const generateReport = () => {
  const style = ` <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'SF Mono', 'Monaco', monospace;
            font-weight: 500;
            background: linear-gradient(135deg,rgb(102, 130, 254) 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 20px;
        }
        
        .test-group {
            margin-bottom: 40px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .test-title {
            background: #f5f5f5;
            padding: 15px;
            font-size: 1.4rem;
            font-weight: 600;
            color: #333;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .config-section {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .config-section:last-child {
            border-bottom: none;
        }
        
        .config-title {
            font-size: 1.1rem;
            font-weight: 500;
            color: #666;
            margin-bottom: 10px;
            padding-left: 10px;
            border-left: 4px solid #2196F3;
        }
        
        .results-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .results-table th {
            background: #fafafa;
            padding: 8px 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .results-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .results-table tr:hover {
            background: #fafafa;
        }
        
        .method-name {
            font-weight: 500;
            color: #333;
        }
        
        .fastest {
            background: linear-gradient(135deg, #4CAF50, #45a049) !important;
            color: white;
        }
        
        .fastest .method-name {
            color: white;
            font-weight: 600;
        }
        
        .time {
            font-family: 'SF Mono', monospace;
            font-weight: 500;
        }
        
        .ratio {
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;
            color: black;
            font-size: 0.9rem;
        }
        
        .extra-badge {
            background: #E91E63;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .suggests {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .suggests h2 {
            color: #2196F3;
            margin-bottom: 20px;
            font-size: 1.8rem;
            font-weight: 300;
        }
        
        .suggest-group {
            margin-bottom: 25px;
        }
        
        .suggest-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
        }
        
        .suggest-config {
            font-size: 1rem;
            color: #666;
            margin-bottom: 8px;
            margin-left: 15px;
        }
        
        .suggest-list {
            list-style: none;
            margin-left: 30px;
        }
        
        .suggest-item {
            background: white;
            padding: 8px 12px;
            margin: 4px 0;
            border-radius: 4px;
            border-left: 4px solid #4CAF50;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .suggest-method {
            font-weight: 600;
            color: #333;
        }
        
        .extra-method {
            color: #E91E63 !important;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            border-top: 1px solid #e0e0e0;
            background: #fafafa;
        }
    </style>`;
  const len = Object.keys(results).length;

  const id = readdirSync(join(process.cwd(), 'reports')).length + 1;

  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeScript Performance Report</title>
    ${style}
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TypeScript Performance Report <small>ID: ${id}</small></h1>
            <p>${len} Performance Tests • Time unit: ms</p>
        </div>
        
        <div class="content">
`;

  // 生成测试结果部分
  for (const [testName, configToGroup] of Object.entries(results)) {
    html += `
            <div class="test-group">
                <div class="test-title">${testName}</div>
`;

    // 准备建议数据
    suggests.set(testName, new Map());

    for (const [configStr, group] of Object.entries(configToGroup)) {
      html += `
                <div class="config-section">
                    <div class="config-title">${stripAnsi(configStr)}</div>
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Time (ms)</th>
                                <th>Ratio</th>
                                <th>Extra</th>
                            </tr>
                        </thead>
                        <tbody>
`;

      // 准备建议数据
      const suggest = suggests.get(testName)!;
      suggest.set(configStr, []);
      const suggestMethods = suggest.get(configStr)!;

      // 排序和处理数据
      const arr = Array.from(Object.entries(group));
      arr.sort((a, b) => a[1].time - b[1].time);
      const least = arr.find(([_, res]) => res.extra === false)![1];

      for (const [label, res] of arr) {
        const time = res.time;
        const ratio = time / least.time;
        const color = getColor(ratio);
        const isLeast = res === least;

        if (ratio < 1.25) {
          suggestMethods.push({ method: label, time, ratio, extra: res.extra });
        }

        html += `
                            <tr ${isLeast ? 'class="fastest"' : ''}>
                                <td><span class="method-name">${label}</span></td>
                                <td><span class="time">${time.toFixed(3)}</span></td>
                                <td><span class="ratio" style="background-color: ${color}">${ratio.toFixed(
          2
        )}x</span></td>
                                <td>${
                                  res.extra ? '<span class="extra-badge">EX</span>' : ''
                                }</td>
                            </tr>
`;
      }

      html += `
                        </tbody>
                    </table>
                </div>
`;
    }

    html += `
            </div>
`;
  }

  // 生成建议部分
  html += `
            <div class="suggests">
                <h2>Performance Suggestions</h2>
`;

  suggests.forEach((configToGroup, testName) => {
    html += `
                <div class="suggest-group">
                    <div class="suggest-title">${testName}</div>
`;

    configToGroup.forEach((group, configStr) => {
      if (configToGroup.size > 1) {
        html += `
                    <div class="suggest-config">${stripAnsi(configStr)}</div>
`;
      }

      html += `
                    <ul class="suggest-list">
`;

      group.forEach(({ method, ratio, extra }) => {
        const color = getColor(ratio);
        html += `
                        <li class="suggest-item">
                            <span class="suggest-method ${
                              extra ? 'extra-method' : ''
                            }">${method}</span>
                            <span class="ratio" style="background-color: ${color}; margin-left: 10px;">${ratio.toFixed(
          2
        )}x</span>
                            ${
                              extra
                                ? '<span class="extra-badge" style="margin-left: 8px;">EX</span>'
                                : ''
                            }
                        </li>
`;
      });

      html += `
                    </ul>
`;
    });

    html += `
                </div>
`;
  });

  html += `
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString(
              'zh-CN'
            )} • TypeScript Performance Analysis</p>
        </div>
    </div>
</body>
</html>
`;

  // 写入文件
  {
    const dtm = formatDateForFilename();
    const outputPath = join(process.cwd(), 'reports', `id${id}_${dtm}.html`);
    writeFileSync(outputPath, html, 'utf8');
    console.log(`HTML report generated: ${outputPath}`);
  }
};
