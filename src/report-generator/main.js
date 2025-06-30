document.addEventListener('DOMContentLoaded', function () {
  // 初始化标签页
  initTabs();

  const testTitles = document.querySelectorAll('.test-title');

  testTitles.forEach((title) => {
    title.addEventListener('click', function () {
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

  // 初始化搜索功能
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      filterResults(this.value);
    });
  }
});

function initTabs() {
  // 默认显示第一个标签页（Results）
  const firstTab = document.querySelector('.tab-btn');
  const firstContent = document.querySelector('.tab-content');
  if (firstTab && firstContent) {
    firstTab.classList.add('active');
    firstContent.classList.add('active');
  }

  // 恢复之前选择的标签页
  const savedTab = localStorage.getItem('activeTab');
  if (savedTab) {
    switchTab(savedTab);
  }
}

function switchTab(tabName) {
  // 移除所有active状态
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
  document
    .querySelectorAll('.tab-content')
    .forEach((content) => content.classList.remove('active'));

  // 激活指定标签页
  const targetBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
  const targetContent = document.getElementById(tabName + '-content');

  if (targetBtn && targetContent) {
    targetBtn.classList.add('active');
    targetContent.classList.add('active');

    // 保存选择的标签页
    localStorage.setItem('activeTab', tabName);
  }
}

function toggleAllSections(collapse) {
  const testTitles = document.querySelectorAll('.test-title');
  testTitles.forEach((title) => {
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
  tables.forEach((table) => {
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
      if (index > 0) {
        // 不对Method列排序，只对Time和Ratio列排序
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

    if (columnIndex === 1) {
      // Time column
      const aValue = parseFloat(aText.replace(' ms', ''));
      const bValue = parseFloat(bText.replace(' ms', ''));
      return aValue - bValue;
    } else if (columnIndex === 2) {
      // Ratio column
      const aValue = parseFloat(aText.replace('x', ''));
      const bValue = parseFloat(bText.replace('x', ''));
      return aValue - bValue;
    }
    return 0;
  });

  rows.forEach((row) => tbody.appendChild(row));
}

// 页面加载完成后初始化所有功能
setTimeout(() => {
  addTableSorting();

  // 添加快捷键支持
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
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
  document.querySelectorAll('.highlight').forEach((el) => {
    el.outerHTML = el.innerHTML;
  });

  testSections.forEach((section) => {
    const sectionRows = section.querySelectorAll('.results-table tbody tr');
    let hasVisibleRows = false;

    sectionRows.forEach((row) => {
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
            methodName.innerHTML = originalText.replace(
              new RegExp('(' + escapedTerm + ')', 'gi'),
              '<span class="highlight" style="">$1</span>'
            );
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
