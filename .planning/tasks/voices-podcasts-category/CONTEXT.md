# Task Context: Voices 下新增 Podcasts 类目

## Description

在 Voices 分组下新增 Podcasts 类目，展示以 YouTube 视频为载体的播客内容。每一期播客对应一篇独立页面，页面包含嵌入的 YouTube 视频和提取的字幕台词。页面布局与现有文章页几乎一致，仅在视觉上增加 YouTube 嵌入容器和右上角的 Views 数字块。

**Scope**: 纯前端接入方案。后端数据抓取、字幕提取、admin 录入界面**不在本任务范围内**。

## Decisions (from Q&A)

### 1. 数据定位：新 business_type
- Podcasts 作为与 Voices/Insights/Research/News/Tutorials 同级的新 business_type
- `BUSINESS_TYPE_MAP` 新增 `Podcasts` 项（id 待后端确认，暂用 `'7'`）
- 列表 API 调用 `fetchArticles({ business_type_name: 'Podcasts' })`
- 导航与面包屑上作为 Voices 的视觉分组，但数据层独立

### 2. 字段结构：ApiArticle 扁平可选字段
后端在 `ApiArticle` 上新增以下**可选**字段（仅在 business_type_name=Podcasts 的记录上存在）：

```ts
interface ApiArticle {
  // ... existing fields
  youtube_video_id?: string;       // e.g. "dQw4w9WgXcQ"
  youtube_url?: string;            // original video URL
  youtube_channel_id?: string;
  youtube_channel_url?: string;    // author page jump target
  youtube_view_count?: number;     // displayed as "1000 / Views"
  transcript?: string;             // plain text with \n\n paragraph separators
}
```

前端类型定义写入 `src/types/index.ts`，全部设为可选，不影响其他 business_type。

### 3. 字幕格式：纯文本段落
- `transcript` 是纯文本字符串
- 段落分隔符：`\n\n`（双换行）
- 前端按 `\n\n` split 后用 `.prose` 容器渲染为 `<p>` 列表
- 不处理时间戳/markdown

### 4. 导航入口：Voices 下拉子项
- Header 的 Voices 菜单项改造为下拉菜单
- 下拉包含：Voices（/voices）、Podcasts（/voices/podcasts）
- 移动端 MobileSidebar 对应展开 Voices 下的子项

### 5. 列表卡片：完全复用
- 列表页直接复用 `CategoryPage` 组件和现有 `NewsCard`/`ArticleCard`
- **不**为 Podcast 卡片添加 play 角标，保持与 Voices 完全一致

## Relevant Files (from codebase scouting)

### Read-only references
- `src/pages/voices/index.astro` — 列表页模板，复制改 3 处
- `src/pages/article/[category]/[slug].astro` — 动态详情页路由（已存在，参数化）
- `src/components/article/astro/BaseArticlePage.astro` — 详情页容器，**有 validCategories 白名单需扩展**
- `src/components/article/astro/ArticleContent.astro` — 详情页正文骨架，作为 PodcastContent 基准
- `src/components/article/react/AuthorSection.tsx` — 作者卡片，作为 PodcastAuthorCard 基准
- `src/components/pages/CategoryPage.tsx` — 列表页组件，通过 `category` prop 驱动，**零改动**
- `src/config/article-taxonomy.ts` — `BUSINESS_TYPE_MAP` 需新增 Podcasts
- `src/types/index.ts` — ApiArticle 类型定义，需追加可选字段
- `src/api/articles.ts` — `fetchArticles` / `fetchArticle` 已参数化，**零改动**
- `src/components/common/react/header/` — Header 导航，需为 Voices 加下拉子项

### Files to create
- `src/pages/voices/podcasts/index.astro` — 列表页
- `src/components/article/astro/PodcastContent.astro` — 详情页正文
- `src/components/article/react/YoutubeEmbed.tsx` — YouTube iframe 嵌入组件
- `src/components/article/react/PodcastAuthorCard.tsx` — 作者卡片变体（Subscribe 按钮）

### Files to modify
- `src/types/index.ts` — 追加 6 个可选字段
- `src/config/article-taxonomy.ts` — 在 `BUSINESS_TYPE_MAP` 新增 Podcasts
- `src/components/article/astro/BaseArticlePage.astro` — 白名单增加 `'podcasts'`；根据 `category` 切换 ArticleContent / PodcastContent
- `src/components/common/react/header/**` — Voices 下拉新增 Podcasts 子项
- `src/locales/en/*`, `src/locales/zh/*`, `src/locales/ja/*` — 新增 i18n keys

## Constraints

- 页面风格、组件、token 必须与现有 Voices/Insights 详情页保持一致
- `.prose` 容器样式复用现有全局样式，禁止新增全局样式
- 不引入新依赖（iframe 原生足够）
- YouTube iframe 使用 `youtube-nocookie.com` 域名提升隐私
- `loading="lazy"` 必须加
- 所有 i18n key 必须在三种语言（en/zh/ja）全部补齐
- 提交前必须 `pnpm type-check` 通过
- UI 验证必须执行：启动 dev server 截图对比 Voices 与 Podcasts 的详情页，确认标题区/作者卡/面包屑样式一致

## Dependencies

**Blocking**: 后端需先完成以下工作（前端验证时若后端未就绪，用 mock 数据验证视觉）
- `ApiArticle` 响应增加 6 个可选 YouTube 字段
- `business_type_name='Podcasts'` 记录可通过 `/articles?business_type_name=Podcasts` 查询
- 单条详情 `fetchArticle(slug, locale, 'podcasts')` 可返回数据

**Non-blocking**: Admin 录入界面（独立后台系统实现）

## i18n Keys

```json
{
  "voices.podcasts.title": "Podcasts | DeTake",
  "voices.podcasts.description": "...",
  "podcast.views": "Views",
  "podcast.subscribe": "Subscribe",
  "podcast.transcript": "Transcript",
  "podcast.breadcrumb": "Podcasts",
  "podcast.byAuthor": "By"
}
```

(zh: 观点 / 订阅 / 字幕 / 播客, ja: 对应本地化)

## Verification Plan

1. `pnpm type-check` 无错
2. `pnpm dev` 启动 dev server
3. Playwright 访问 `/us/voices/podcasts` 列表页，截图对比 `/us/voices` 布局一致性
4. Playwright 访问 `/us/article/podcasts/<mock-slug>` 详情页，截图确认：
   - 面包屑 Voices / Podcasts
   - 标题区 + 中/A 语言切换按钮
   - 右上角 Views 数字块
   - YouTube iframe 16:9 无黑边
   - transcript 段落间距与 .prose 一致
   - 作者卡 Subscribe 按钮绿色与其他 primary CTA 一致
5. 点击作者头像确认跳转 YouTube 频道（new tab）
6. Header Voices 下拉能看到 Podcasts 子项

## Commit Message

```
feat(podcasts): add Podcasts category under Voices with YouTube embed
```
