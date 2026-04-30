# 测试问题清单
> 生成时间：2026-04-30 11:29
> 人工审阅：2026-04-30
> 总计：5 个问题（P0: 0, P1: 1, P2: 4, P3: 0）

## P0 Critical

- 无

## P1 Major

### [P1-001] Tutorials 和 Collections 页面 FCP 严重超标（6-7.5 秒）
- **页面**：/collections/17（FCP 7576ms）、/zh/tutorials/...（FCP 7144ms）、/tutorials（FCP 6388ms）
- **现象**：3 个页面首次内容绘制超出 2.5s 阈值 2-3 倍，用户可感知的明显白屏等待。
- **Console/Network 证据**：Performance API 采集 FCP 分别为 7576ms、7144ms、6388ms；其余页面均在 2s 以内。
- **影响**：用户在访问学习词汇表和合集详情时需等待 6-7 秒才能看到内容，严重影响体验。
- **可能根因**：
  - 合集详情页 `src/pages/collections/[collectionId]/index.astro:34` 执行 `fetchCollections(1, 100)` 拉取全量 100 条合集数据，仅为匹配 1 个 ID，应改为按 ID 直接查询
  - 学习列表页 `src/pages/tutorials/index.astro:33` 的 `fetchLearnItemsByLetter` + `getAvailableLetters` 两个 API 在 SSR 阶段串行/并行耗时过长，需排查后端响应速度
- **截图**：output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/collections-17.jpg、tutorials.jpg
- **可沉淀为 spec**：是（扩展 `tests/performance/web-vitals.spec.ts` 覆盖 /tutorials 和 /collections/{id}）

## P2 Minor

### [P2-001] 站内未暴露作者页入口，authors 路由只能靠手工构造访问
- **页面**：/、/news、/article/news/premium-how-openai-challe-264d-xG0zT
- **现象**：采样阶段在首页、列表页、文章页都未找到任何可见的 `/authors/` 链接，只能通过文章 API 回填 `authorName` 再构造 `/authors/Michael%20Smith` 验证路由。
- **Console/Network 证据**：页面 DOM 扫描 `/authors/` 链接结果为 0；fixtures 的作者样本来自 `articles/info` API 回填。
- **影响**：作者页可访问但不可发现，作者维度流量与 SEO 内链价值被浪费。
- **可能根因**：多处作者入口被降级为纯文本或直接注释，例如 `src/components/article/astro/ArticleContent.astro:153`、`src/components/article/astro/ArticleContent.astro:232`、`src/components/common/react/ArticleGrid.tsx:75`、`src/components/home/react/TrendingGrid.tsx:56`。
- **截图**：无
- **可沉淀为 spec**：是（建议补充 author-entry discoverability spec）

### [P2-002] 部分页面 SEO 基线不完整
- **页面**：/、/zh/article/news/premium-how-openai-challe-264d-xG0zT、/zh/user/26/article/news/premium-how-openai-challe-264d-xG0zT、/this-page-does-not-exist-404
- **现象**：首页与 404 页缺少 H1；两条翻译文章路由的 `meta description` 为空。
- **Console/Network 证据**：`/` => `h1Count=0`；`/this-page-does-not-exist-404` => `h1Count=0`；`/zh/article/...` 与 `/zh/user/...` => `description=null`。
- **影响**：会削弱语义层级、搜索摘要质量和页面可发现性。
- **可能根因**：首页模板 `src/pages/index.astro:66` 没有输出 H1；404 模板 `src/pages/404.astro:41` 用普通 `div` 显示 404 文案；翻译文章页的 description 只取 `article.sub_title`，一旦翻译副标题为空就会丢失 meta description，见 `src/components/article/astro/BaseArticlePage.astro:87`。
- **截图**：output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/home.jpg
- **可沉淀为 spec**：是（建议扩展 metadata smoke spec，覆盖 H1 与 description）

### [P2-003] 多个移动端页面存在过小触控目标
- **页面**：/news、/research、/voices/podcasts、/article/news/...、/collections/17、/topics/openai 等 11 个页面
- **现象**：虽然没有水平溢出，但存在高度低于 20px 的可点击元素；最明显的是文章页语言切换链接仅 `18x18`，Podcast/News 卡片标题链接高度也只有 `19px`。
- **Console/Network 证据**：`/article/news/...` 检测到 5 个 `18x18` 语言切换 `<a>`；`/voices/podcasts` 检测到 3 个高度 `19px` 的标题链接；`/topics/openai` 的 "Articles" 入口高度 `17px`。
- **影响**：会降低小屏设备点击命中率，尤其影响多语言切换和内容卡片点击。
- **可能根因**：文章页语言切换按钮硬编码为 `w-[18px] h-[18px]`，见 `src/components/article/astro/ArticleContent.astro:103` 与 `src/components/article/astro/ArticleContent.astro:119`；其余列表页链接主要缺少移动端最小高度/内边距。
- **截图**：output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/article-news-premium-how-openai-challe-264d-xG0zT.jpg
- **可沉淀为 spec**：是（建议把触控目标最小尺寸断言扩展到 P1 页面全集）

### [P2-004] Header 导航中存在空文本链接，影响键盘导航和屏幕阅读器
- **页面**：/（首页）、/news、/article/news/... — 所有含 header 的页面
- **现象**：Tab 键导航时，第 5 个焦点落在一个无文本、无 aria-label 的 `<a>` 元素上。3 个测试页面的 focus 轨迹一致：`1.BUTTON:News → 2.A:Research → 3.A:Insights → 4.A:Voices → 5.A:(empty) → 6.A:Collections`。
- **Console/Network 证据**：a11y 检查中 focus 轨迹第 5 项为 `A:(empty)`，所有页面复现。
- **影响**：屏幕阅读器用户会遇到一个无意义的链接焦点，无法理解其用途；键盘用户多按一次 Tab 才能到达下一个有效链接。
- **可能根因**：header 导航区域可能有一个装饰性链接（如分隔符或图标链接）缺少 `aria-label` 或 `aria-hidden="true"`，需检查 `src/components/common/react/header/DesktopHeader.tsx` 的导航项渲染。
- **截图**：无
- **可沉淀为 spec**：是（扩展 `tests/a11y/accessibility.spec.ts` 断言 header 无空链接）

## P3 Info

- 无

---

## 已排除项（经人工确认为产品决策，非 bug）

| 原编号 | 问题 | 排除原因 |
|--------|------|---------|
| 原 P1-001 | 列表页 FilterBar 未渲染 | 产品有意隐藏（代码标注 `temporarily hidden`），非遗漏 |
| 原 P3-001 | 文章详情页无 Follow 入口 | Follow 功能已下线 |
