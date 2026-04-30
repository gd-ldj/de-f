# DeTake 全站测试方案 v2

> 目标：系统化测试 https://en.dev.detake.com，发现控制台报错、性能瓶颈、交互问题、API 设计问题、SEO/SSR/a11y 缺陷等。
> 测试工具：Playwright MCP（Chrome 浏览器自动化）+ 现有 Playwright spec 复用
> 修订依据：Codex 对 v1 方案的对抗审查意见

---

## 一、测试范围：完整路由清单

基于 `src/pages/` 的 21 个 .astro 文件，逐一对齐，共 20 类页面（排除 `test.astro`、`api/` 路由）。

### 1.1 页面清单

| # | 页面类型 | 路由模板 | 测试 URL（固化后填入） | 优先级 |
|---|---------|----------|----------------------|--------|
| 1 | 首页 | `index.astro` | `/` | P0 |
| 2 | News 列表 | `news/index.astro` | `/news` | P0 |
| 3 | Research 列表 | `research/index.astro` | `/research` | P0 |
| 4 | Insights 列表 | `insights/index.astro` | `/insights` | P1 |
| 5 | Voices 列表 | `voices/index.astro` | `/voices` | P1 |
| 6 | Podcasts 列表 | `voices/podcasts/index.astro` | `/voices/podcasts` | P1 |
| 7 | 文章详情（源语言） | `article/[category]/[slug].astro` | `（Step 0 固化）` | P0 |
| 8 | 文章详情（翻译版） | `[translationLang]/article/[category]/[slug].astro` | `（Step 0 固化）` | P0 |
| 9 | 用户文章（源语言） | `user/[userId]/article/[category]/[slug].astro` | `（Step 0 固化）` | P1 |
| 10 | 用户文章（翻译版） | `[translationLang]/user/[userId]/article/[category]/[slug].astro` | `（Step 0 固化）` | P1 |
| 11 | 合集列表 | `collections/index.astro` | `/collections` | P1 |
| 12 | 合集详情 | `collections/[collectionId]/index.astro` | `（Step 0 固化）` | P1 |
| 13 | 合集内文章 | `collections/[collectionId]/[slug].astro` | `（Step 0 固化）` | P1 |
| 14 | 合集内文章（翻译版） | `[translationLang]/collections/[collectionId]/[slug].astro` | `（Step 0 固化）` | P2 |
| 15 | Topic 页 | `topics/[topic].astro` | `（Step 0 固化）` | P1 |
| 16 | 作者页 | `authors/[authorName].astro` | `（Step 0 固化）` | P2 |
| 17 | 学习/词汇表列表 | `tutorials/index.astro` | `/tutorials` | P2 |
| 18 | 学习详情 | `tutorials/[slug].astro` | `（Step 0 固化）` | P2 |
| 19 | 学习详情（翻译版） | `[translationLang]/tutorials/[slug].astro` | `（Step 0 固化）` | P2 |
| 20 | 404 页 | `404.astro` | `/this-page-does-not-exist-404` | P2 |

### 1.2 URL 固化规则

动态页面的测试 URL 不应临时取值，需在 **Step 0（采样阶段）** 固化到 `docs/TESTING_FIXTURES.md`：

- 通过 API 或页面采样获取真实的 slug / collectionId / topic / authorName
- 将采样到的具体 URL 记录到 fixture 文件，后续所有测试步骤引用该文件
- fixture 文件同时记录采样时间，如内容变化导致复现差异可追溯

### 1.3 语言切换的实际支持范围

根据代码，**仅以下 4 类页面支持 `[translationLang]` 前缀**：

| 路由 | 翻译路由 |
|------|---------|
| `/article/[category]/[slug]` | `/[lang]/article/[category]/[slug]` |
| `/user/[userId]/article/[category]/[slug]` | `/[lang]/user/[userId]/article/[category]/[slug]` |
| `/collections/[collectionId]/[slug]` | `/[lang]/collections/[collectionId]/[slug]` |
| `/tutorials/[slug]` | `/[lang]/tutorials/[slug]` |

**以下页面不支持语言前缀路由**（访问 `/zh/news` 应返回 404）：
- 首页、News 列表、Research 列表、Insights 列表、Voices 列表、Topics、Authors、Collections 列表

> 测试时不应对不支持的页面尝试语言切换，避免将"产品未支持"误报为 bug。

---

## 二、测试维度与检查项

### 每页统一执行标准

**所有 19 类页面均执行以下 4 项基础检查，无例外、无降级**：

1. Console 消息收集（error + warning）
2. Network 请求记录与分析
3. Performance API 性能指标采集
4. 页面截图

在此基础上，部分页面追加交互测试、SEO 检查等。

---

### 维度 1：控制台错误收集

**方法**：访问页面 → 等待加载完成 → 收集 Console 消息

**检查项**：
- [ ] JavaScript 运行时错误（Console error）
- [ ] 未捕获的 Promise rejection
- [ ] React hydration mismatch 警告
- [ ] React key 重复警告
- [ ] 404 资源加载失败（图片、字体、脚本）
- [ ] CORS 跨域错误
- [ ] Deprecated API 使用警告

**过滤规则**（复用现有 spec 的 IGNORED_ERROR_PATTERNS）：
```
排除：/third-party/, /CORS/, /ERR_BLOCKED_BY_CLIENT/, /analytics/,
      /gtag/, /cloudflare/, /sentry/, /clerk/, /vercel/, /fingerprintjs/
```

**输出格式**：
```
页面: /news
错误级别: error
消息: Cannot read properties of undefined (reading 'title')
来源: ArticleCard.tsx:42
是否已知: 否
影响: 文章卡片渲染失败
```

---

### 维度 2：网络请求分析

**方法**：访问页面 → 记录所有 API 请求（排除静态资源） → 分析模式

**检查项**：
- [ ] 失败请求（4xx / 5xx 状态码，排除已知第三方）
- [ ] 慢请求（响应时间 > 2s）
- [ ] 重复请求（同一 API、同参数被调用 ≥2 次）
- [ ] 并发 API 请求数量（首屏同时发出 > 6 个视为可疑）
- [ ] 瀑布式请求（可并行但串行的请求链）
- [ ] 响应体过大（单个响应 > 500KB）
- [ ] 客户端不必要的请求（SSR 已获取但客户端重复 fetch）

**输出格式**：
```
页面: /
问题类型: 重复请求
API: GET /api/v1/articles?category=news&locale=en&page=1
调用次数: 3
时间窗口: 页面加载后 0-2s 内
影响: 服务器负载 ×3，用户等待时间增加
可能原因: 多个组件独立发起相同查询，缺少 React Query 共享
```

---

### 维度 3：页面加载性能

**方法**：通过 Performance API + PerformanceObserver 采集

**阈值标准**（dev 环境，参考现有 `web-vitals.spec.ts`）：

| 指标 | 合格 | 警告 | 不合格 |
|------|------|------|--------|
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| DOM 节点数 | < 1500 | 1500 - 3000 | > 3000 |

**限制说明**：
- dev 环境 + 单次采样，精度有限，仅作为"发现明显问题"的粗筛
- 不做 cold/warm cache 区分，不做网络 throttle
- 如需审计级性能数据，应使用 Lighthouse CI 或 WebPageTest（不在本次范围内）

**输出格式**：
```
页面: /
LCP: 3.8s ⚠️（阈值 2.5s）
CLS: 0.02 ✅
DOM 节点数: 2340 ⚠️（阈值 1500）
备注: LCP 元素为首屏大图，1.8MB 未压缩
```

---

### 维度 4：交互功能测试（按功能分组）

#### 4.1 全局导航
- [ ] 桌面端：所有导航链接可点击且跳转正确
- [ ] 桌面端：搜索功能可打开、输入、显示结果
- [ ] 移动端（375px）：汉堡菜单可打开/关闭
- [ ] 移动端：侧边栏导航链接可用
- [ ] Logo 点击回首页

#### 4.2 文章列表页（News / Research / Insights / Voices）
- [ ] 首次加载显示文章列表
- [ ] 筛选栏：Category 筛选生效 + URL 参数同步
- [ ] 筛选栏：Topic 筛选生效
- [ ] 筛选栏：Clear All 清空所有筛选
- [ ] 排序切换（Latest / Popular / Trending）+ URL 参数同步
- [ ] 分页翻页后内容更新 + URL 参数同步
- [ ] URL 状态恢复（直接访问 `?page=2&order_by=Popular` 能恢复状态）
- [ ] 文章卡片点击跳转到正确的详情页

#### 4.3 文章详情页
- [ ] 文章标题、正文、作者信息完整渲染
- [ ] 图片正常显示（无 broken image）
- [ ] 侧边栏（推荐文章、Token 信息等）加载正常
- [ ] 分享按钮可用（弹层/链接）
- [ ] 翻译语言链接可用且跳转正确（仅验证文章详情页，此处有语言切换）

#### 4.4 搜索功能
- [ ] 搜索框可聚焦、可输入
- [ ] 输入后展示搜索结果（验证 API 请求参数正确）
- [ ] 搜索结果可点击跳转
- [ ] 空结果时显示提示
- [ ] 防抖验证（连续击键不应每次都发请求）

#### 4.5 首页各区块
- [ ] News / Trending / Research 数据加载正常
- [ ] 右侧栏 Topics 和 Most Read 加载正常
- [ ] 推荐关注列表加载正常

#### 4.6 登录入口和分享弹层（未登录态可见 UI）
- [ ] 文章详情页的分享按钮弹层可打开/关闭
- [ ] 登录入口（AuthMount）在需要时正确显示
- [ ] 登录弹窗（如点击关注等触发）可打开、可关闭、不阻塞页面

> 说明：不测试登录后的用户功能（钱包连接、个人中心等），但测试未登录态下的入口 UI 是否正常。

---

### 维度 5：移动端适配（viewport 375×812）

**方法**：调整浏览器窗口为移动端尺寸，对 P0 + P1 页面逐页检查

**检查项**：
- [ ] 无水平溢出（scrollWidth ≤ viewport width + 2px）
- [ ] 文字大小可读（段落字体 ≥ 12px）
- [ ] 按钮/链接可点击（触控目标 ≥ 20px）
- [ ] 图片宽度 ≤ viewport width
- [ ] Header 固定定位正常，不遮挡首屏内容
- [ ] 弹窗/浮层在小屏正常显示且可关闭
- [ ] 列表页从多列网格降级为单列布局

---

### 维度 6：SEO / SSR / a11y 基线（新增）

#### 6.1 SEO 基线
- [ ] 每页有唯一的 `<title>` 标签
- [ ] 每页有 `<meta name="description">` 且非空
- [ ] 文章详情页有 `<link rel="canonical">`
- [ ] 翻译文章有正确的 `hreflang` alternate 标签
- [ ] 用户文章（unpromoted）有 `<meta name="robots" content="noindex">`
- [ ] Heading 层级连续（不跳级，如 h1 后直接 h4）
- [ ] 页面只有 1 个 `<h1>`

#### 6.2 SSR / Hydration 基线
- [ ] 页面源码（view-source）包含关键内容（非空壳 CSR）
- [ ] 无 hydration mismatch 警告（已在维度 1 覆盖）
- [ ] SSR 预取的数据与客户端渲染结果一致

#### 6.3 a11y 基线（参考现有 `accessibility.spec.ts`）
- [ ] 图片有 alt 属性
- [ ] 可交互元素可键盘聚焦（Tab 导航）
- [ ] 链接有可辨识的文本（非空 `<a>`）
- [ ] 颜色对比度（记录但不阻断，需独立色彩审计）

---

### 维度 7：代码层面分析（基于前 6 个维度的发现）

**方法**：根据测试发现的问题，回到源码定位根因

**检查项**：
- [ ] API 调用是否有不必要的重复（多个组件独立 fetch 相同数据）
- [ ] React Query 缓存策略是否合理（staleTime / gcTime 设置）
- [ ] SSR 预取与客户端 hydration 是否有数据断层
- [ ] 组件是否有不必要的 re-render（如缺少 memo / useMemo）
- [ ] 是否有内存泄漏风险（未清理的定时器、事件监听）
- [ ] 错误边界是否覆盖关键组件

---

## 三、执行步骤

### Step 0: 采样固化（前置步骤）
1. 通过 API 获取真实数据：文章列表、合集列表、Topic 列表、作者列表
2. 从中各取 1-2 个样本，构建完整的测试 URL
3. **写入 `docs/TESTING_FIXTURES.md`**，记录：采样时间、具体 URL、数据快照摘要
4. 后续所有步骤引用 fixture 中的 URL，不再动态取值

### Step 1: 全量页面基础扫描（19 类页面）
对每个页面统一执行（无降级）：
1. 打开页面，等待 networkidle
2. 收集 Console 消息（error + warning）
3. 收集 Network 请求列表
4. 执行 Performance API 获取 LCP / CLS / DOM 节点数
5. 截图记录
6. SEO meta 标签检查（title / description / canonical / hreflang / robots / heading）

> 产出：`docs/TESTING_RAW_DATA.md` — 每页的原始数据

### Step 2: 交互功能测试
按维度 4 的分组逐项执行：
1. 全局导航（桌面 + 移动端）
2. 列表页筛选、排序、分页
3. 文章详情页内容 + 侧边栏 + 分享
4. 搜索功能
5. 登录入口 UI

### Step 3: 移动端适配测试
1. 调整 viewport 为 375×812
2. 对 P0 + P1 页面（#1-#15）逐页执行维度 5 的检查项
3. 重点关注水平溢出和触控目标

### Step 4: 问题归因与代码分析
1. 汇总 Step 1-3 发现的所有问题
2. 对 P0 / P1 问题逐个回到源码定位根因
3. 判断每个问题的归属（前端代码 / 后端 API / 基础设施 / 产品设计）

### Step 5: 汇总报告
1. 按严重程度分类所有问题
2. 给出修复建议和优先级排序
3. 标注哪些问题可沉淀为自动化 spec

---

## 四、与现有测试 spec 的关系

本仓库已有 35 个 Playwright spec 文件，本次测试应：

### 4.1 复用现有 spec 的成果
| 现有 spec | 复用内容 |
|-----------|---------|
| `tests/performance/web-vitals.spec.ts` | LCP/CLS 阈值标准、已知忽略的错误模式 |
| `tests/a11y/accessibility.spec.ts` | axe-core 规则配置、降级规则 |
| `tests/content-health/pages-health.spec.ts` | 毒性模式扫描（[object Object]、undefined 等） |
| `tests/e2e/user-article-route.spec.ts` | 用户文章路由规则、SEO meta 断言 |
| `tests/e2e/search-overlay.spec.ts` | 搜索 API 参数格式、游标分页逻辑 |

### 4.2 将发现的新问题沉淀为 spec
测试完成后，对于可重复验证的问题，建议新增或扩展 spec：
- 新发现的 Console error → 扩展 `web-vitals.spec.ts` 的断言
- 新发现的 SEO 缺失 → 新增 `tests/seo/seo-baseline.spec.ts`
- 新发现的重复请求 → 新增 `tests/performance/api-efficiency.spec.ts`
- 新发现的移动端溢出 → 扩展各页面的 Mobile 375px 测试用例

> 目标：本次一次性审计的发现，转化为可持续回归的自动化测试。

---

## 五、输出物

| 文件 | 内容 |
|------|------|
| `docs/TESTING_FIXTURES.md` | 固化的测试 URL 和数据快照（Step 0 产出） |
| `docs/TESTING_REPORT.md` | 完整测试报告：每页的原始数据 + 问题分析 + 根因 |
| `docs/TESTING_ISSUES.md` | 问题清单（按优先级排序），每条含：问题描述、影响、根因、修复建议、是否可沉淀为 spec |

---

## 六、问题分级标准

| 级别 | 定义 | 举例 |
|------|------|------|
| **P0 Critical** | 功能不可用、页面崩溃、数据丢失 | 白屏、JS 致命错误、API 5xx、关键数据不显示 |
| **P1 Major** | 功能异常但页面可用 | 交互无响应、重复请求 ≥3 次、SEO 关键字段缺失 |
| **P2 Minor** | 体验不佳但不影响核心功能 | 加载稍慢、Console 警告、样式微调、a11y moderate |
| **P3 Info** | 可优化项 | 代码建议、性能优化空间、最佳实践、冗余代码 |

---

## 七、注意事项

1. **环境**：测试环境为 dev（en.dev.detake.com），部分性能数据与生产有差异
2. **登录态**：不测试登录后的用户功能，但测试未登录态下所有可见的入口 UI（分享、关注、登录弹层）
3. **语言切换边界**：仅对支持 `[translationLang]` 的 4 类页面测试翻译路由，不对列表页尝试语言前缀
4. **性能数据精度**：单次采样 + dev 环境，仅用于粗筛明显问题，不作为性能基线
5. **发现问题后先记录、不立即修复**，等你审阅确认后再行动
