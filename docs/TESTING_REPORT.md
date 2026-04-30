# DeTake 全站测试报告
> 执行时间：2026-04-30 11:29
> 覆盖页面数：20
> 问题统计：P0 0 / P1 1 / P2 3 / P3 1
> 整体健康度：Needs attention

## 执行摘要
- 测试执行时间：2026-04-30 11:29
- 覆盖页面数：20
- 各级别问题数量：P0 0 / P1 1 / P2 3 / P3 1
- 最严重的 3 个发现：
- [P1] 列表页筛选与排序入口未渲染（/news、/research、/insights、/voices）
- [P2] 部分页面 SEO 基线不完整（首页/404 缺少 H1，翻译文章 description 为空）
- [P2] 多个移动端页面存在过小触控目标（文章语言切换仅 18×18）
- 整体判断：站点可访问，首页搜索与移动导航可用，但内容发现与基础可用性仍有明显短板。

## 页面扫描结果

### 页面: /
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 1200ms
DOM 节点数: 859
Title: "DeTake - Decentralized takes" ✅
H1 数量: 0 ❌
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/home.jpg

### 页面: /news
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 1576ms
DOM 节点数: 404
Title: "News | DeTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/news.jpg

### 页面: /research
Console errors: 0
Console warnings: 0
API 请求数: 3
失败请求: 0
重复请求: 无
FCP: 1016ms
DOM 节点数: 243
Title: "Research | DeTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/research.jpg

### 页面: /insights
Console errors: 0
Console warnings: 0
API 请求数: 3
失败请求: 0
重复请求: 无
FCP: 816ms
DOM 节点数: 263
Title: "Insights | DeTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/insights.jpg

### 页面: /voices
Console errors: 0
Console warnings: 0
API 请求数: 3
失败请求: 0
重复请求: 无
FCP: 1020ms
DOM 节点数: 163
Title: "Voices | DeTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/voices.jpg

### 页面: /voices/podcasts
Console errors: 0
Console warnings: 0
API 请求数: 3
失败请求: 0
重复请求: 无
FCP: 1024ms
DOM 节点数: 279
Title: "Podcasts | DeTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/voices-podcasts.jpg

### 页面: /article/news/premium-how-openai-challe-264d-xG0zT
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 1728ms
DOM 节点数: 346
Title: "Premium: How OpenAI Challenges Oracle | news | deTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 7
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/article-news-premium-how-openai-challe-264d-xG0zT.jpg

### 页面: /zh/article/news/premium-how-openai-challe-264d-xG0zT
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 1968ms
DOM 节点数: 346
Title: "高端：OpenAI 如何挑战甲骨文 | news | deTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 7
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/zh-article-news-premium-how-openai-challe-264d-xG0zT.jpg

### 页面: /user/26/article/news/premium-how-openai-challe-264d-xG0zT
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 1760ms
DOM 节点数: 334
Title: "Premium: How OpenAI Challenges Oracle | news | deTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/user-26-article-news-premium-how-openai-challe-264d-xG0zT.jpg

### 页面: /zh/user/26/article/news/premium-how-openai-challe-264d-xG0zT
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 1932ms
DOM 节点数: 334
Title: "高端：OpenAI 如何挑战甲骨文 | news | deTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/zh-user-26-article-news-premium-how-openai-challe-264d-xG0zT.jpg

### 页面: /collections
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 1820ms
DOM 节点数: 339
Title: "Collections | deTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/collections.jpg

### 页面: /collections/17
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 7576ms
DOM 节点数: 212
Title: "On-Chain Insight Weekly" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/collections-17.jpg

### 页面: /collections/17/anthropic-attempts-last-d-yuud
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 2696ms
DOM 节点数: 374
Title: "Anthropic attempts last-ditch bid to salvage the Pentagon deal after a blowup | news | deTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 7
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/collections-17-anthropic-attempts-last-d-yuud.jpg

### 页面: /zh/collections/17/anthropic-attempts-last-d-yuud
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 2496ms
DOM 节点数: 374
Title: "在冲突爆发后，Anthropic试图以最后一搏挽救与五角大楼的交易 | news | deTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 7
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/zh-collections-17-anthropic-attempts-last-d-yuud.jpg

### 页面: /topics/openai
Console errors: 0
Console warnings: 0
API 请求数: 3
失败请求: 0
重复请求: 无
FCP: 1480ms
DOM 节点数: 454
Title: "OpenAI | DeTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/topics-openai.jpg

### 页面: /authors/Michael%20Smith
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 1364ms
DOM 节点数: 295
Title: "Crypto Feed News | Author Profile | deTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/authors-Michael-20Smith.jpg

### 页面: /tutorials
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 6388ms
DOM 节点数: 385
Title: "Learn | Paragons | deTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/tutorials.jpg

### 页面: /tutorials/what-is-a-black-hole-a-si-3ghk-xG0zT
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 1952ms
DOM 节点数: 263
Title: "What Is a Black Hole? A Simple Guide to the Universe’s Dark Monsters | DeTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 7
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/tutorials-what-is-a-black-hole-a-si-3ghk-xG0zT.jpg

### 页面: /zh/tutorials/what-is-a-black-hole-a-si-3ghk-xG0zT
Console errors: 0
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 7144ms
DOM 节点数: 263
Title: "什么是黑洞？关于宇宙黑暗怪物的简单指南 | DeTake" ✅
H1 数量: 1 ✅
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 7
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/zh-tutorials-what-is-a-black-hole-a-si-3ghk-xG0zT.jpg

### 页面: /this-page-does-not-exist-404
Console errors: 1
Console warnings: 0
API 请求数: 2
失败请求: 0
重复请求: 无
FCP: 832ms
DOM 节点数: 168
Title: "404 - Page Not Found | deTake" ✅
H1 数量: 0 ❌
Canonical: 有 ✅
Robots: noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
Hreflang: 0
截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/page-scan/this-page-does-not-exist-404.jpg

## 交互测试结果

### 2.1 全局导航
- 桌面端导航可见性：News=可见，Research=可见，Insights=可见，Voices=可见
- Logo 首页链接：Header 中存在 `href="/"` 的可见 Logo，首页态点击保持在首页 ✅
- 搜索弹层打开：通过
- 搜索结果数量：1
- 搜索请求验证：通过（`/api/v1/search?q=bitcoin&locale=en&limit=8&page=1`）
- 移动端汉堡按钮：可见
- 移动端侧边栏打开：通过
- 移动端侧边栏链接：News=可见，Research=可见，Insights=可见，Voices=可见
- 移动端侧边栏关闭：通过

### 2.2 列表页筛选/排序/分页（/news）
- 文章卡片数：12
- Category 筛选控件：缺失
- Category 请求参数验证：未执行（控件未渲染）
- Popular 排序控件：缺失
- Popular URL 同步：未执行（控件未渲染）
- 分页控件（第 2 页）：存在
- 分页 URL 同步：通过（点击后 URL 变为 `/news?page=2`）
- Clear All 按钮：缺失
- Clear All URL 清空：未执行（控件未渲染）

### 2.3 文章详情页
- H1 可见：通过
- 正文存在：通过
- 正常加载图片数：25
- Share 按钮存在：未找到独立弹层按钮；页面渲染的是右侧内联分享区
- 语言切换链接：`/zh/article/news/premium-how-openai-challe-264d-xG0zT`
- 侧边栏渲染：有

### 2.4 登录入口 UI（未登录态）
- Follow 按钮存在：缺失
- 登录提示出现：未验证（页面未暴露 Follow 入口）
- 登录提示关闭：未验证（页面未暴露 Follow 入口）
- Topic 页 AuthMount UI：Get Started=false，Connect Wallet=false，Login=false，Share Root=true

## 移动端适配结果

### 页面: /
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：0
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/home.jpg

### 页面: /news
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：1
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/news.jpg

### 页面: /research
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：1
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/research.jpg

### 页面: /insights
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：0
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/insights.jpg

### 页面: /voices
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：0
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/voices.jpg

### 页面: /voices/podcasts
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：3
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/voices-podcasts.jpg

### 页面: /article/news/premium-how-openai-challe-264d-xG0zT
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：5
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/article-news-premium-how-openai-challe-264d-xG0zT.jpg

### 页面: /zh/article/news/premium-how-openai-challe-264d-xG0zT
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：5
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/zh-article-news-premium-how-openai-challe-264d-xG0zT.jpg

### 页面: /user/26/article/news/premium-how-openai-challe-264d-xG0zT
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：5
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/user-26-article-news-premium-how-openai-challe-264d-xG0zT.jpg

### 页面: /zh/user/26/article/news/premium-how-openai-challe-264d-xG0zT
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：5
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/zh-user-26-article-news-premium-how-openai-challe-264d-xG0zT.jpg

### 页面: /collections
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：0
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/collections.jpg

### 页面: /collections/17
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：1
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/collections-17.jpg

### 页面: /collections/17/anthropic-attempts-last-d-yuud
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：5
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/collections-17-anthropic-attempts-last-d-yuud.jpg

### 页面: /zh/collections/17/anthropic-attempts-last-d-yuud
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：5
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/zh-collections-17-anthropic-attempts-last-d-yuud.jpg

### 页面: /topics/openai
- 水平溢出：无（scrollWidth=375, viewport=375）
- 触控目标过小：1
- 图片溢出：0
- 截图: output/playwright/site-testing-2026-04-30T03-29-02-551Z/mobile-adapt/topics-openai.jpg

## SSR 验证结果

### 结论
- 首页、`/news`、文章详情页的初始 HTML 都远大于空壳阈值，说明关键内容已由 SSR 输出，不是纯 CSR 空白壳。
- 本轮未在 Console 中捕获到明确的 hydration mismatch warning。
- 首页与 404 页缺少 H1 属于 SEO/语义问题，已单独计入问题清单，不视为 SSR 失效。

### 页面: /
- 初始 HTML 长度: 455725
- 包含 article/prose: true
- 包含 H1: false
- SSR 判断: 通过（有完整内容输出）

### 页面: /news
- 初始 HTML 长度: 101260
- 包含 article/prose: true
- 包含 H1: false
- SSR 判断: 通过（有完整内容输出）

### 页面: /article/news/premium-how-openai-challe-264d-xG0zT
- 初始 HTML 长度: 80556
- 包含 article/prose: true
- 包含 H1: true
- SSR 判断: 通过（有完整内容输出）

## a11y 检查结果

### 页面: /
- 图片总数: 48
- 缺失 alt: 0
- 空链接: 0
- Tab 前 10 次可见 focus: 9
- Focus 轨迹: 1.BUTTON:News | 2.A:Research | 3.A:Insights | 4.A:Voices | 5.A:(empty) | 6.A:Collections | 7.A:Tutorials | 8.BUTTON:Search | 9.BUTTON:English | 10.BUTTON:User menu

### 页面: /news
- 图片总数: 27
- 缺失 alt: 0
- 空链接: 0
- Tab 前 10 次可见 focus: 9
- Focus 轨迹: 1.BUTTON:News | 2.A:Research | 3.A:Insights | 4.A:Voices | 5.A:(empty) | 6.A:Collections | 7.A:Tutorials | 8.BUTTON:Search | 9.BUTTON:English | 10.BUTTON:User menu

### 页面: /article/news/premium-how-openai-challe-264d-xG0zT
- 图片总数: 25
- 缺失 alt: 0
- 空链接: 0
- Tab 前 10 次可见 focus: 9
- Focus 轨迹: 1.BUTTON:News | 2.A:Research | 3.A:Insights | 4.A:Voices | 5.A:(empty) | 6.A:Collections | 7.A:Tutorials | 8.BUTTON:Search | 9.BUTTON:English | 10.BUTTON:User menu
