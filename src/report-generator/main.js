const $ = (...args) => document.querySelectorAll(...args);

document.addEventListener('DOMContentLoaded', function () {
  // 初始化标签页
  initTabs();

  $('.test-title').forEach((title) => {
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

  // 恢复卡片的折叠状态
  $('.test-card-title').forEach((title) => {
    const testName = title.parentElement.getAttribute('data-test-name');
    const savedState = localStorage.getItem('collapse_card_' + testName);
    if (savedState === 'true') {
      title.classList.add('collapsed');
      const content = title.nextElementSibling;
      if (content && content.classList.contains('test-card-content')) {
        content.classList.add('collapsed');
      }
    }
  });
});

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
  $('.tab-btn').forEach((btn) => btn.classList.remove('active'));
  $('[tabgroup]').forEach((content) => content.classList.remove('active'));

  // 激活指定标签页
  const targetBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
  const targetContents = $(`[tabgroup="${tabName}"]`);
  // document.getElementById(tabName + '-content');

  if (targetBtn && targetContents.length) {
    targetBtn.classList.add('active');
    targetContents.forEach((targetContent) => targetContent.classList.add('active'));

    // 保存选择的标签页
    localStorage.setItem('activeTab', tabName);
  }
}

function toggleAllSections(collapse) {
  // 处理旧的test-title结构
  $('.test-title').forEach((title) => {
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

  // 处理新的卡片结构
  $('.test-card-title').forEach((title) => {
    const content = title.nextElementSibling;
    if (content && content.classList.contains('test-card-content')) {
      if (collapse) {
        title.classList.add('collapsed');
        content.classList.add('collapsed');
      } else {
        title.classList.remove('collapsed');
        content.classList.remove('collapsed');
      }
      // 保存状态
      const testName = title.parentElement.getAttribute('data-test-name');
      localStorage.setItem('collapse_card_' + testName, collapse.toString());
    }
  });
}

function filterResults(searchTerm = '') {
  const term = searchTerm.toLowerCase();

  // 清除之前的高亮
  $('.highlight').forEach((el) => {
    el.outerHTML = el.innerHTML;
  });

  $('.test-card').forEach((section) => {
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
            // 使用Unicode转义序列避免正则表达式解析问题
            const escapedTerm = term.replace(
              /[\u002E\u002A\u002B\u003F\u0024\u005E\u007B\u007D\u0028\u0029\u007C\u005B\u005C\u005D]/g,
              '\\$&'
            );
            methodName.innerHTML = originalText.replace(
              new RegExp('(' + escapedTerm + ')', 'gi'),
              '<span class="highlight">$1</span>'
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
  filterResults();
}

// 导航功能
function showAllTests() {
  // 显示所有测试
  $('.test-card').forEach((section) => {
    section.classList.remove('hidden');
  });

  // 更新导航项状态
  const navItems = $('.nav-item');
  navItems.forEach((item) => {
    item.classList.remove('active');
  });

  // 激活"显示全部"项
  const showAllItem = navItems[0]; // 第一个是"显示全部"
  if (showAllItem) {
    showAllItem.classList.add('active');
  }
}

function showTest(testName) {
  clearSearch();

  // 隐藏所有测试
  $('.test-card').forEach((section) => {
    if (section.getAttribute('data-test-name') === testName) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });

  // 更新导航项状态
  $('.nav-item').forEach((item) => {
    item.classList.remove('active');
    // 通过onclick属性判断是否为当前项
    const onclick = item.getAttribute('onclick');
    if (onclick && onclick.includes(JSON.stringify(testName))) {
      item.classList.add('active');
    }
  });
}

// 建议页面导航功能
function showAllSuggests() {
  // 显示所有建议
  $('.suggest-card').forEach((card) => card.classList.remove('hidden'));

  // 更新导航项状态
  const suggestsTabContent = document.getElementById('suggests-content');
  const navItems = suggestsTabContent.querySelectorAll('.nav-item');
  navItems.forEach((item) => item.classList.remove('active'));

  // 激活"显示全部"项
  const showAllItem = navItems[0]; // 第一个是"显示全部"
  if (showAllItem) {
    showAllItem.classList.add('active');
  }
}

function showSuggest(testName) {
  // 隐藏所有建议
  $('.suggest-card').forEach((card) => {
    if (card.getAttribute('data-suggest-name') === testName) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });

  // 更新导航项状态
  const suggestsTabContent = document.getElementById('suggests-content');
  const navItems = suggestsTabContent.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.classList.remove('active');
    // 通过onclick属性判断是否为当前项
    const onclick = item.getAttribute('onclick');
    if (onclick && onclick.includes(JSON.stringify(testName))) {
      item.classList.add('active');
    }
  });
}

// 卡片展开折叠功能
function toggleSection(titleElement) {
  const content = titleElement.nextElementSibling;
  if (content && content.classList.contains('test-card-content')) {
    titleElement.classList.toggle('collapsed');
    content.classList.toggle('collapsed');

    // 存储状态到localStorage
    const testName = titleElement.parentElement.getAttribute('data-test-name');
    const isCollapsed = titleElement.classList.contains('collapsed');
    localStorage.setItem('collapse_card_' + testName, isCollapsed.toString());
  }
}
