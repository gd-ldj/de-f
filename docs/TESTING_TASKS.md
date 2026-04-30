# DeTake 全站测试 — 执行任务清单

> 依据：`docs/SITE_TESTING_PLAN.md` v2
> 目标站点：https://en.dev.detake.com
> 执行工具：Playwright MCP（Chrome 浏览器自动化）
> 产出位置：`docs/TESTING_FIXTURES.md`、`docs/TESTING_REPORT.md`、`docs/TESTING_ISSUES.md`

---

## Task 0: 采样固化

**目标**：获取所有动态页面的真实测试 URL，写入 `docs/TESTING_FIXTURES.md`

**步骤**：
1. 访问 `https://en.dev.detake.com`，从首页提取至少 1 篇文章的链接（获取真实的 category + slug）
2. 访问 `/news`，从列表中提取 1 篇 News 类文章链接
3. 访问 `/collections`，提取 1 个合集 ID 和合集内的 1 篇文章 slug
4. 访问 `/tutorials`，提取 1 个教程 slug
5. 从页面中找到至少 1 个 Topic 名称和 1 个作者名称
6. 通过 Network 请求或页面内容，找到 1 个 user article 的 URL（含 userId）
7. 将以上所有 URL 写入 `docs/TESTING_FIXTURES.md`，格式如下：

```markdown
# 测试 URL 固化表
> 采样时间：YYYY-MM-DD HH:MM

| # | 页面类型 | 测试 URL |
|---|---------|----------|
| 1 | 首页 | `/` |
| 2 | News 列表 | `/news` |
| 3 | Research 列表 | `/research` |
| 4 | Insights 列表 | `/insights` |
| 5 | Voices 列表 | `/voices` |
| 6 | Podcasts 列表 | `/voices/podcasts` |
| 7 | 文章详情（源语言） | `/article/news/xxx-slug` |
| 8 | 文章详情（翻译版） | `/zh/article/news/xxx-slug` |
| 9 | 用户文章（源语言） | `/user/123/article/news/xxx-slug` |
| 10 | 用户文章（翻译版） | `/zh/user/123/article/news/xxx-slug` |
| 11 | 合集列表 | `/collections` |
| 12 | 合集详情 | `/collections/42` |
| 13 | 合集内文章 | `/collections/42/xxx-slug` |
| 14 | 合集内文章（翻译版） | `/zh/collections/42/xxx-slug` |
| 15 | Topic 页 | `/topics/bitcoin` |
| 16 | 作者页 | `/authors/xxx` |
| 17 | 学习列表 | `/tutorials` |
| 18 | 学习详情 | `/tutorials/xxx-slug` |
| 19 | 学习详情（翻译版） | `/zh/tutorials/xxx-slug` |
| 20 | 404 页 | `/this-page-does-not-exist-404` |
```

**注意**：
- 如果某类页面确实找不到真实数据（如 user article），在表中标注"未找到样本"并说明原因
- 翻译版 URL 中的语言前缀用 `zh`（项目支持的翻译语言之一）
- 采样时同时验证 URL 可访问（HTTP 2xx/3xx），不可访问的标注状态码

**产出**：`docs/TESTING_FIXTURES.md`

---

## Task 1: 全量页面基础扫描

**目标**：对 `TESTING_FIXTURES.md` 中的 20 个 URL，逐一执行统一的基础检查

**每个 URL 的操作步骤**（无例外、无降级）：

1. **导航到页面**，等待页面加载完成（networkidle 或至少等 5 秒）
2. **收集 Console 消息**：
   - 使用 `browser_console_messages` level=warning 收集所有 warning 和 error
   - 过滤掉已知的第三方噪音（含 `third-party`、`CORS`、`ERR_BLOCKED_BY_CLIENT`、`analytics`、`gtag`、`cloudflare`、`sentry`、`clerk`、`vercel`、`fingerprintjs` 的消息）
   - 记录剩余的每条消息：级别、内容、来源
3. **收集 Network 请求**：
   - 使用 `browser_network_requests` static=false, requestBody=false, requestHeaders=false
   - 过滤出 API 请求（URL 含 `/api/`）
   - 记录：失败请求（4xx/5xx）、响应慢的请求（可通过请求列表中的时序分析）
   - 检查是否有同 URL 同参数的重复请求
   - 统计首屏 API 并发数量
4. **采集性能指标**：
   - 使用 `browser_evaluate` 执行：
   ```javascript
   () => {
     const nav = performance.getEntriesByType('navigation')[0];
     const paint = performance.getEntriesByType('paint');
     const fcp = paint.find(e => e.name === 'first-contentful-paint');
     return {
       domContentLoaded: Math.round(nav?.domContentLoadedEventEnd || 0),
       loadComplete: Math.round(nav?.loadEventEnd || 0),
       fcp: Math.round(fcp?.startTime || 0),
       domNodes: document.querySelectorAll('*').length,
       documentSize: document.documentElement.outerHTML.length
     };
   }
   ```
5. **SEO meta 检查**：
   - 使用 `browser_evaluate` 执行：
   ```javascript
   () => {
     const h1s = document.querySelectorAll('h1');
     const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({
       tag: h.tagName, text: h.textContent?.trim().substring(0, 50)
     }));
     return {
       title: document.title,
       description: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
       canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
       robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || null,
       hreflangCount: document.querySelectorAll('link[rel="alternate"][hreflang]').length,
       h1Count: h1s.length,
       h1Text: h1s[0]?.textContent?.trim().substring(0, 80) || null,
       headingStructure: headings.slice(0, 20)
     };
   }
   ```
6. **截图**：使用 `browser_take_screenshot` 保存截图

**记录格式**（每页一段，汇总到报告中）：
```
### 页面: /news
Console errors: 2
Console warnings: 5
API 请求数: 8
失败请求: 0
重复请求: GET /api/v1/articles (×2)
FCP: 1200ms
DOM 节点数: 1850
Title: "News - DeTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
```

**产出**：将所有 20 页的原始数据写入 `docs/TESTING_REPORT.md` 的「页面扫描结果」部分

---

## Task 2: 交互功能测试

**目标**：测试核心交互功能是否正常

### 2.1 全局导航（在首页执行）

**桌面端（1440px 宽度）**：
1. 检查 header 中所有导航链接（News、Research、Insights、Voices 等）是否可见
2. 点击 Logo，确认回到首页
3. 点击搜索图标，确认搜索弹层打开
4. 在搜索框输入 "bitcoin"，等待 2 秒，确认出现搜索结果
5. 收集搜索请求的 Network，验证：请求了 `/api/v1/search`，参数含 `q=bitcoin`
6. 关闭搜索弹层

**移动端（resize 到 375×812）**：
7. 检查汉堡菜单按钮可见
8. 点击汉堡菜单，确认侧边栏打开
9. 检查侧边栏中的导航链接可见
10. 关闭侧边栏

### 2.2 列表页筛选/排序/分页（在 `/news` 执行）

**前置**：确保 viewport 为桌面端 1440px

1. 确认文章列表已渲染（至少有 1 个 article 卡片）
2. 查找 Category 筛选控件，如果存在则点击它，选择一个选项
3. 收集 Network，确认 API 请求中携带了 `category_name` 参数
4. 查找排序控件（Latest/Popular/Trending），点击切换到 Popular
5. 确认 URL 中出现 `order_by=Popular`
6. 查找分页控件，如果存在则点击第 2 页
7. 确认 URL 中出现 `page=2`
8. 查找 "Clear All" 按钮，点击清空筛选
9. 确认 URL 参数被清空

### 2.3 文章详情页（使用 fixture 中的文章 URL）

1. 打开文章详情页
2. 确认 h1 标题可见
3. 确认文章正文存在（`.prose` 或 `article` 元素）
4. 确认至少有 1 张图片正常加载（img 有 src 且 naturalWidth > 0）
5. 查找分享按钮，如果存在则点击，确认弹层打开
6. 查找语言切换链接，如果存在则记录链接 href
7. 检查侧边栏是否渲染（推荐文章或 Token 信息）

### 2.4 登录入口 UI（未登录态）

在文章详情页：
1. 查找页面中的关注按钮（Follow），如果存在则点击
2. 确认弹出登录提示/弹窗
3. 确认弹窗可关闭，关闭后页面不阻塞

在 Topic 页：
4. 查找 AuthMount 相关 UI（登录入口、钱包连接按钮等），记录是否存在及状态

**产出**：将交互测试结果写入 `docs/TESTING_REPORT.md` 的「交互测试结果」部分

---

## Task 3: 移动端适配测试

**目标**：在 375×812 viewport 下检查 P0 + P1 页面的适配问题

**页面范围**：fixture 中的 #1-#15（P0 + P1）

**每个页面的检查步骤**：

1. `browser_resize` 设为 375×812
2. 导航到页面，等待加载完成
3. **水平溢出检测**：
   ```javascript
   () => {
     return {
       hasOverflow: document.documentElement.scrollWidth > 375 + 2,
       scrollWidth: document.documentElement.scrollWidth,
       viewportWidth: window.innerWidth
     };
   }
   ```
4. **触控目标检测**：
   ```javascript
   () => {
     const links = [...document.querySelectorAll('a, button')].slice(0, 50);
     const tooSmall = links.filter(el => {
       const rect = el.getBoundingClientRect();
       return rect.width > 0 && rect.height > 0 && (rect.width < 20 || rect.height < 20);
     });
     return tooSmall.map(el => ({
       tag: el.tagName,
       text: el.textContent?.trim().substring(0, 30),
       width: Math.round(el.getBoundingClientRect().width),
       height: Math.round(el.getBoundingClientRect().height)
     }));
   }
   ```
5. **图片溢出检测**：
   ```javascript
   () => {
     const imgs = [...document.querySelectorAll('img')];
     return imgs.filter(img => img.getBoundingClientRect().width > 375 + 5)
       .map(img => ({ src: img.src?.substring(0, 80), width: Math.round(img.getBoundingClientRect().width) }));
   }
   ```
6. 截图保存

**产出**：将移动端测试结果写入 `docs/TESTING_REPORT.md` 的「移动端适配结果」部分

---

## Task 4: SSR / Hydration 验证

**目标**：验证关键页面的 SSR 输出是否包含实际内容（非空壳 CSR）

**页面范围**：首页、文章详情页、列表页（共 3 页）

**步骤**：

1. 对每个页面，用 `browser_evaluate` 禁用 JS 前检查源码：
   ```javascript
   () => {
     // Check if key content exists in initial HTML (SSR)
     const html = document.documentElement.outerHTML;
     return {
       hasArticleContent: html.includes('<article') || html.includes('class="prose"'),
       hasH1: html.includes('<h1'),
       htmlLength: html.length,
       // Check for hydration error markers
       hasHydrationError: html.includes('Hydration') || html.includes('hydrat')
     };
   }
   ```
2. 收集 Console 中与 hydration 相关的警告（过滤 `hydrat` 关键词）
3. 记录每页的 SSR 状态

**产出**：写入 `docs/TESTING_REPORT.md` 的「SSR 验证结果」部分

---

## Task 5: a11y 基础检查

**目标**：检查关键页面的可访问性基线问题

**页面范围**：首页、`/news`、文章详情页（共 3 页）

**步骤**：

1. **图片 alt 属性检查**：
   ```javascript
   () => {
     const imgs = [...document.querySelectorAll('img')];
     const noAlt = imgs.filter(img => !img.hasAttribute('alt'));
     return {
       totalImages: imgs.length,
       missingAlt: noAlt.length,
       samples: noAlt.slice(0, 5).map(img => img.src?.substring(0, 80))
     };
   }
   ```
2. **空链接检查**：
   ```javascript
   () => {
     const links = [...document.querySelectorAll('a')];
     const empty = links.filter(a => !a.textContent?.trim() && !a.getAttribute('aria-label') && !a.querySelector('img'));
     return {
       totalLinks: links.length,
       emptyLinks: empty.length,
       samples: empty.slice(0, 5).map(a => ({ href: a.href?.substring(0, 80), html: a.outerHTML?.substring(0, 100) }))
     };
   }
   ```
3. **Heading 层级检查**（已在 Task 1 SEO 检查中覆盖，此处汇总分析）
4. **键盘导航测试**：
   - 按 Tab 键 10 次，检查 focus 是否按合理顺序移动
   - 检查 focus 元素是否有可见的 focus ring

**产出**：写入 `docs/TESTING_REPORT.md` 的「a11y 检查结果」部分

---

## Task 6: 汇总与问题清单

**目标**：整理所有发现，生成最终报告和问题清单

**步骤**：

1. 汇总 Task 1-5 的所有发现
2. 对每个问题进行分级（P0/P1/P2/P3）：

| 级别 | 标准 |
|------|------|
| P0 Critical | 页面崩溃、白屏、JS 致命错误、API 5xx、关键数据不显示 |
| P1 Major | 交互无响应、同 API 重复请求 ≥3 次、SEO 关键字段缺失、hydration 错误 |
| P2 Minor | 加载慢但可用、Console 非致命警告、样式瑕疵、a11y moderate |
| P3 Info | 优化建议、代码规范、冗余请求 |

3. 写入 `docs/TESTING_ISSUES.md`，格式：

```markdown
# 测试问题清单
> 生成时间：YYYY-MM-DD HH:MM
> 总计：X 个问题（P0: X, P1: X, P2: X, P3: X）

## P0 Critical

### [P0-001] 问题标题
- **页面**：/news
- **现象**：描述
- **Console/Network 证据**：贴关键信息
- **影响**：用户影响范围
- **可能根因**：初步分析（指向源文件和行号）
- **截图**：有/无
- **可沉淀为 spec**：是（建议扩展 xxx.spec.ts）/ 否

## P1 Major
...
```

4. 在 `docs/TESTING_REPORT.md` 开头写执行摘要：
   - 测试执行时间
   - 覆盖页面数
   - 各级别问题数量
   - 最严重的 3 个发现
   - 整体健康度判断

**产出**：
- `docs/TESTING_REPORT.md`（完整报告）
- `docs/TESTING_ISSUES.md`（问题清单）

---

## 执行顺序与依赖

```
Task 0 (采样固化)
  │
  ▼
Task 1 (全量页面扫描) ──→ Task 4 (SSR 验证)
  │                         │
  ▼                         ▼
Task 2 (交互测试)      Task 5 (a11y 检查)
  │                         │
  ▼                         ▼
Task 3 (移动端测试)         │
  │                         │
  └─────────┬───────────────┘
            ▼
       Task 6 (汇总报告)
```

- Task 0 必须最先执行，其产出（TESTING_FIXTURES.md）是后续所有 Task 的输入
- Task 1 完成后，Task 2/3/4/5 可并行执行
- Task 6 必须最后执行，依赖前面所有 Task 的数据

---

## 约束与注意事项

1. **所有页面统一标准执行**，不因优先级降低检查项
2. **语言切换测试边界**：仅对 article / user article / collection article / tutorial 这 4 类页面测试翻译版路由，不对列表页尝试 `/{lang}/` 前缀
3. **登录态**：不测试登录后功能，但测试未登录态下可见的入口 UI（关注按钮、分享弹层、登录弹窗）
4. **性能数据精度**：dev 环境单次采样，仅粗筛明显问题
5. **发现问题只记录不修复**，等人工审阅确认后再处理
6. **每个 Task 产出的数据直接写入对应的 md 文件**，不要只口头描述
