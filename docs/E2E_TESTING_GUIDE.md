# DeTake 前端 E2E 测试指南

> **使用 Playwright 进行端到端自动化测试**
> **最后更新**: 2026-02-27

---

## 📋 概览

本项目使用 **Playwright** 进行端到端 (E2E) 测试，覆盖关键用户流程和页面功能。

### 为什么选择 Playwright?

- ✅ **跨浏览器支持**: Chromium, Firefox, WebKit
- ✅ **自动等待**: 智能等待元素准备就绪
- ✅ **截图和视频**: 失败时自动记录
- ✅ **移动端测试**: 模拟不同设备视口
- ✅ **并行执行**: 快速测试执行
- ✅ **TypeScript 原生支持**

---

## 🚀 快速开始

### 安装依赖

```bash
# Playwright 已在项目中安装
pnpm install

# 安装浏览器（如果需要）
npx playwright install
```

### 运行测试

```bash
# 运行所有测试
npx playwright test

# 运行特定测试文件
npx playwright test tests/e2e/homepage.spec.js

# 运行特定浏览器
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# 运行移动端测试
npx playwright test --project="Mobile Chrome"

# UI 模式（推荐用于调试）
npx playwright test --ui

# 调试模式
npx playwright test --debug

# 生成报告
npx playwright show-report
```

---

## 📁 测试文件结构

```
tests/
└── e2e/
    ├── homepage.spec.js      # 首页测试
    ├── article.spec.js       # 文章页测试
    └── navigation.spec.js    # 导航测试

test-results/                 # 测试结果（失败截图、视频）
playwright-report/            # HTML 测试报告
playwright.config.js          # Playwright 配置
```

---

## 🔧 配置说明

### playwright.config.js

```javascript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],

  // 自动启动开发服务器
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 📝 编写测试

### 基本测试结构

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // 定位元素
    const element = page.getByRole('button', { name: 'Submit' });

    // 断言
    await expect(element).toBeVisible();

    // 交互
    await element.click();

    // 验证结果
    await expect(page).toHaveURL('/success');
  });
});
```

### 定位器最佳实践

```javascript
// ✅ 推荐: 使用语义化定位器
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { name: 'Title' })
page.getByRole('link', { name: 'Read More' })
page.getByText('Welcome')
page.getByLabel('Email')
page.getByPlaceholder('Enter your name')

// ✅ 使用 .first() 处理多个匹配
page.getByRole('heading', { name: 'Highlights' }).first()

// ✅ 使用过滤器
page.locator('a').filter({ hasText: 'Article' })

// ❌ 避免: CSS 选择器（脆弱）
page.locator('.btn-primary')  // 样式改变就失效
page.locator('#submit-btn')   // ID 可能变化

// ❌ 避免: XPath
page.locator('//div[@class="container"]')
```

### 常用断言

```javascript
// 可见性
await expect(element).toBeVisible()
await expect(element).toBeHidden()

// 文本内容
await expect(element).toHaveText('Hello')
await expect(element).toContainText('World')

// URL
await expect(page).toHaveURL('/home')
await expect(page).toHaveURL(/\/article\//)

// 标题
await expect(page).toHaveTitle(/DeTake/)

// 属性
await expect(element).toHaveAttribute('href', '/link')
await expect(element).toHaveClass(/active/)

// 数量
const links = page.getByRole('link')
await expect(links).toHaveCount(10)
```

### 处理异步操作

```javascript
// 等待导航
await page.click('a[href="/next"]')
await page.waitForURL('/next')

// 等待网络空闲
await page.waitForLoadState('networkidle')

// 等待特定元素
await page.waitForSelector('.loaded')

// 等待超时
await page.waitForTimeout(2000)  // 尽量避免

// 自定义等待
await page.waitForFunction(() => {
  return document.querySelectorAll('.item').length > 5
})
```

---

## 🎯 测试覆盖范围

### 当前测试套件

#### 1. Homepage Tests (`homepage.spec.js`)
- ✅ 页面加载成功
- ✅ 显示顶部导航
- ✅ 显示最新新闻
- ✅ 显示高亮文章
- ✅ 显示热门阅读
- ✅ 文章链接可点击
- ✅ 语言选择器
- ✅ 响应式设计（移动端）
- ✅ 图片加载
- ✅ 搜索功能

#### 2. Article Tests (`article.spec.js`)
- ✅ 从首页导航到文章
- ✅ 显示文章内容
- ✅ 显示作者信息
- ✅ 分享功能

#### 3. Navigation Tests (`navigation.spec.js`)
- ✅ 分类页导航
- ✅ 作者页导航
- ✅ 合集页导航
- ✅ 浏览器前进/后退
- ✅ 直接 URL 访问
- ✅ 404 处理

### 未来测试计划

- [ ] 搜索功能完整流程
- [ ] 用户认证流程（登录/注册）
- [ ] 钱包连接
- [ ] 文章评论
- [ ] 收藏/点赞功能
- [ ] 多语言切换
- [ ] 性能测试
- [ ] 可访问性测试 (a11y)

---

## 📸 截图功能

### 手动截图

```javascript
test('visual test', async ({ page }) => {
  await page.goto('/');

  // 整页截图
  await page.screenshot({
    path: 'homepage-full.png',
    fullPage: true
  });

  // 元素截图
  const article = page.locator('.article').first();
  await article.screenshot({
    path: 'article-card.png'
  });
});
```

### 自动截图

配置在 `playwright.config.js`:

```javascript
use: {
  screenshot: 'only-on-failure',  // 失败时截图
  video: 'retain-on-failure',     // 失败时录制视频
}
```

---

## 🐛 调试技巧

### 1. UI 模式（推荐）

```bash
npx playwright test --ui
```

提供交互式界面：
- 时间轴回放
- 逐步执行
- DOM 快照
- 网络请求
- 控制台日志

### 2. 调试器模式

```bash
npx playwright test --debug
```

逐行执行，类似断点调试。

### 3. 慢速执行

```javascript
test.use({ slowMo: 1000 });  // 每步延迟 1 秒

test('slow motion', async ({ page }) => {
  // 测试逻辑
});
```

### 4. 查看测试报告

```bash
npx playwright show-report
```

浏览器打开 HTML 报告，包含：
- 测试结果概览
- 失败截图
- 失败视频
- 错误堆栈
- DOM 快照

### 5. 控制台日志

```javascript
test('debug with logs', async ({ page }) => {
  // 监听控制台消息
  page.on('console', msg => console.log('Browser:', msg.text()));

  // 执行自定义 JS
  await page.evaluate(() => {
    console.log('Current URL:', window.location.href);
  });
});
```

---

## ⚠️ 常见问题

### 1. Strict Mode Violation

**错误**: `strict mode violation: getByText('News') resolved to 2 elements`

**原因**: 页面中有多个相同文本的元素（如导航和页脚都有 "News"）

**解决**:
```javascript
// ❌ 错误
await page.getByText('News').click()

// ✅ 正确: 使用 .first()
await page.getByText('News').first().click()

// ✅ 更好: 缩小范围
await page.locator('header').getByText('News').click()

// ✅ 最佳: 使用更具体的定位器
await page.getByRole('navigation').getByRole('link', { name: 'News' }).click()
```

### 2. Element Not Visible

**错误**: `Expected: visible, Received: hidden`

**原因**: 元素在 DOM 中但被 CSS 隐藏（如 mobile/desktop 切换）

**解决**:
```javascript
// 检查是否存在（不管可见性）
const count = await element.count()
expect(count).toBeGreaterThan(0)

// 或使用 waitFor 的状态选项
await element.waitFor({ state: 'attached' })  // 只要在 DOM 中
```

### 3. Timeout 超时

**错误**: `Timeout 5000ms exceeded`

**解决**:
```javascript
// 增加超时时间
await element.waitFor({ timeout: 10000 })

// 或在测试级别设置
test('slow test', async ({ page }) => {
  test.setTimeout(60000);  // 60秒
  // 测试逻辑
});

// 或在配置中全局设置
// playwright.config.js
export default defineConfig({
  timeout: 30000,  // 30秒
});
```

### 4. 元素找不到

**排查步骤**:
1. 检查元素是否真的存在
2. 检查是否需要等待加载
3. 使用 Playwright Inspector 查看 DOM
4. 尝试不同的定位器策略

```javascript
// 调试定位器
await page.locator('button').all()  // 获取所有匹配
  .then(btns => console.log('Found', btns.length, 'buttons'))
```

---

## 📊 CI/CD 集成

### GitHub Actions 示例

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎓 最佳实践

### 1. 测试命名

```javascript
// ✅ 清晰描述行为
test('should display error message when email is invalid', ...)
test('should navigate to article detail page when clicking title', ...)

// ❌ 模糊不清
test('test email', ...)
test('click test', ...)
```

### 2. 测试独立性

```javascript
// ✅ 每个测试独立
test('test A', async ({ page }) => {
  await page.goto('/');
  // 不依赖其他测试的状态
});

test('test B', async ({ page }) => {
  await page.goto('/');
  // 独立运行
});

// ❌ 测试之间有依赖
test('login', ...)  // 假设这个会留下登录状态
test('view profile', ...)  // 依赖上一个测试的登录状态
```

### 3. 使用 Page Objects

```javascript
// pages/homepage.js
export class HomePage {
  constructor(page) {
    this.page = page;
    this.newsLink = page.getByRole('link', { name: 'News' });
    this.highlightsSection = page.getByRole('heading', { name: 'Highlights' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickNews() {
    await this.newsLink.click();
  }
}

// 在测试中使用
import { HomePage } from './pages/homepage';

test('navigate to news', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.clickNews();
});
```

### 4. 避免硬编码等待

```javascript
// ❌ 硬编码延迟
await page.waitForTimeout(5000)

// ✅ 等待特定状态
await page.waitForLoadState('networkidle')
await element.waitFor({ state: 'visible' })
```

### 5. 合理使用 beforeEach

```javascript
test.describe('Article Tests', () => {
  // 公共设置
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('test 1', async ({ page }) => {
    // 直接开始测试逻辑
  });

  test('test 2', async ({ page }) => {
    // 直接开始测试逻辑
  });
});
```

---

## 📚 参考资源

- **Playwright 官方文档**: https://playwright.dev
- **Playwright API**: https://playwright.dev/docs/api/class-playwright
- **最佳实践**: https://playwright.dev/docs/best-practices
- **调试指南**: https://playwright.dev/docs/debug
- **CI/CD 集成**: https://playwright.dev/docs/ci

---

## 📞 支持

遇到测试相关问题:
1. 查看本文档的常见问题部分
2. 查看 Playwright 官方文档
3. 使用 `--ui` 或 `--debug` 模式调试
4. 查看失败测试的截图和视频
5. 联系团队技术负责人

---

**最后更新**: 2026-02-27
**维护者**: DeTake 前端团队
