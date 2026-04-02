# DeTake 前端项目 - 完整知识图谱

> **文档用途**: AI 上下文参考 & 开发人员快速入门指南
> **最后更新**: 2026-02-27
> **维护者**: Claude Code

---

## 📋 项目概览

**项目名称**: DeTake 加密货币新闻和分析平台前端
**技术栈**: Astro 5.13.2 + React 19 + TypeScript 5.9 + Tailwind CSS 4
**架构模式**: SSR (服务端渲染) + Islands Architecture
**部署平台**: Vercel
**包管理器**: pnpm 9.15.3

---

## 🏗️ 核心架构特点

### 1. **多源站点国际化架构**

- **源语言概念**: 每个域名对应一个源语言站点
  - `en.detake.com` - 英文源站点
  - `zh.detake.com` - 中文源站点
  - `ja.detake.com` - 日文源站点

- **翻译路径**: 通过路径前缀表示翻译版本
  - 源语言文章: `ja.detake.com/article/news/example`
  - 翻译文章: `ja.detake.com/fr/article/news/example`
  - 用户文章: `ja.detake.com/u/{userId}/article/news/example`

- **自动跳转**: `ja.detake.com/ja/article/...` → `ja.detake.com/article/...` (301)

### 2. **Astro + React 混合策略**

- **Astro**: 负责页面结构、SSR、SEO优化
- **React**: 通过 Islands 方式实现交互功能
- **客户端指令**:
  - `client:load` - 立即水合
  - `client:idle` - 空闲时水合
  - `client:visible` - 可见时水合

### 3. **类型系统**

```typescript
// 核心类型定义 (src/types/index.ts)
type SourceLanguage = 'en' | 'zh' | 'ja'  // 站点级语言
type TranslationLanguage = 'en' | 'zh' | 'ja' | 'fr' | 'ar' | 'ru' | 'de' | 'es' | 'ko'  // 内容级翻译
type Locale = 'en' | 'zh' | 'ja'  // 向后兼容的旧类型

// 文章数据结构
interface ApiArticle {
  entry_id: string
  title: string
  sub_title: string
  slug: string
  body?: string
  author_name: string
  category_names: string[]
  tags: string[]
  img_url?: string
  language?: string
  user_id?: string  // 用户文章特有
}
```

---

## 📂 目录结构详解

```
detake-frontend/
├── src/
│   ├── api/                    # API 接口封装
│   │   ├── articles.ts         # 文章相关API (列表、详情、分类、标签)
│   │   ├── collections.ts      # 合集API
│   │   ├── learn.ts            # 学习页面API
│   │   ├── users.ts            # 用户API
│   │   └── auth.ts             # 认证API (钱包、邮箱)
│   │
│   ├── components/             # 组件库 (Astro + React 双层结构)
│   │   ├── article/            # 文章相关组件
│   │   │   ├── astro/          # BaseArticlePage, ArticleCard 等
│   │   │   └── react/          # ArticleContent, LanguageSwitcher 等
│   │   ├── common/             # 通用组件
│   │   │   ├── astro/          # Layout, SEO 组件
│   │   │   └── react/
│   │   │       ├── header/     # Header, MobileNav, CategoryDropdown
│   │   │       ├── footer/     # Footer, SocialLinks
│   │   │       └── FilterBar.tsx, Pagination.tsx 等
│   │   ├── home/               # 首页组件 (Hero, NewsGrid, WhoToFollow)
│   │   ├── pages/              # 页面级复合组件
│   │   │   ├── CategoryPage.tsx
│   │   │   ├── TopicPage.tsx
│   │   │   └── AuthorPage.tsx
│   │   ├── collections/        # 合集组件
│   │   ├── learn/              # 学习页面组件
│   │   ├── author/             # 作者页组件
│   │   └── social/             # 社交功能组件
│   │
│   ├── pages/                  # Astro 路由页面 (基于文件的路由)
│   │   ├── index.astro         # 主页
│   │   ├── article/[category]/[slug].astro  # 源语言文章
│   │   ├── u/[userId]/article/[category]/[slug].astro  # 用户文章
│   │   ├── [translationLang]/  # 翻译路径
│   │   │   ├── article/[category]/[slug].astro
│   │   │   ├── u/[userId]/article/[category]/[slug].astro
│   │   │   ├── collections/[collectionId]/[slug].astro
│   │   │   └── tutorials/[slug].astro
│   │   ├── collections/        # 合集页面
│   │   │   ├── index.astro     # 合集列表
│   │   │   ├── [collectionId]/index.astro
│   │   │   └── [collectionId]/[slug].astro
│   │   ├── topics/[topic].astro  # Topic页
│   │   ├── authors/[authorName].astro  # 作者页
│   │   ├── news/index.astro    # 新闻分类
│   │   ├── research/index.astro  # 研究分类
│   │   ├── insights/index.astro  # 洞察分类
│   │   ├── voices/index.astro  # 声音分类
│   │   ├── tutorials/          # 教程页面
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── api/                # API 端点
│   │       ├── analytics/events.ts
│   │       ├── cf-headers.ts
│   │       └── og/[...params].ts
│   │
│   ├── layouts/                # 布局组件
│   │   └── BaseLayout.astro    # 基础布局 (SEO, Meta, Hreflang)
│   │
│   ├── lib/                    # 工具库
│   │   ├── i18n.ts             # 国际化系统 (t, tl, useTranslation)
│   │   ├── language-utils.ts   # 语言工具函数 (20+ 函数)
│   │   ├── analytics.ts        # 分析和埋点系统
│   │   ├── utils.ts            # 通用工具函数 (cn, debounce, throttle)
│   │   ├── useAuth.ts          # 认证 Hooks (统一认证接口)
│   │   ├── useWalletAuth.ts    # 钱包认证 (Privy)
│   │   ├── useEmailAuth.ts     # 邮箱认证 (Clerk)
│   │   ├── useDeviceType.ts    # 设备检测 (mobile/desktop)
│   │   └── serverFetch.ts      # SSR 请求封装 (超时、重试、日志)
│   │
│   ├── stores/                 # Jotai 全局状态
│   │   └── index.ts            # 所有 Atoms 定义
│   │
│   ├── config/                 # 全局配置
│   │   └── constants.ts        # 常量配置
│   │       - SITE_CONFIG       # 环境、API端点
│   │       - MULTI_SOURCE_CONFIG  # 多源站点配置
│   │       - STORAGE_KEYS      # localStorage 键名
│   │       - ANALYTICS_CONFIG  # 分析配置
│   │       - TRACKING_EVENTS   # 事件类型
│   │
│   ├── types/                  # TypeScript 类型
│   │   └── index.ts            # 所有类型定义
│   │
│   ├── styles/                 # 全局样式
│   │   └── global.css          # Tailwind 配置 + 自定义样式
│   │
│   ├── assets/                 # 静态资源
│   │   └── imgs/
│   │
│   ├── scripts/                # 客户端脚本
│   └── utils/                  # 辅助工具
│
├── public/                     # 公共静态文件
│   └── locales/                # 翻译文件
│       ├── en/translation.json # 英文翻译
│       ├── zh/translation.json # 中文翻译
│       └── ja/translation.json # 日文翻译
│
├── docs/                       # 项目文档
│   ├── ANALYTICS_GUIDE.md      # 分析系统文档
│   ├── FINAL_SUMMARY.md        # 多源站点架构总结
│   ├── MULTI_SOURCE_SITE_ARCHITECTURE.md  # 架构设计
│   ├── I18N_UPDATE.md          # 国际化更新说明
│   ├── MIGRATION_MULTI_SOURCE.md  # 迁移指南
│   ├── ROUTE_CHANGES.md        # 路由变更说明
│   ├── GA_IP_LOGIC.md          # GA IP 逻辑
│   ├── ENVIRONMENT_VARIABLES.md  # 环境变量说明
│   └── PROJECT_KNOWLEDGE_MAP.md  # 本文档
│
├── astro.config.mts            # Astro 配置 (SSR + Vercel)
├── package.json                # 依赖和脚本
├── tsconfig.json               # TypeScript 配置
├── tailwind.config.js          # Tailwind CSS v4 配置
├── vercel.json                 # Vercel 部署配置
├── CLAUDE.md                   # AI 使用说明 (项目规范)
├── NEWSGRID_USAGE.md           # NewsGrid 组件使用说明
└── README.md                   # 项目说明
```

---

## 🔑 核心系统深入解析

### 1. **配置系统** (`src/config/constants.ts`)

#### SITE_CONFIG - 站点环境配置

```typescript
SITE_CONFIG = {
  // 环境类型
  ENVIRONMENT: 'beta' | 'web2' | 'web3' | 'beta_dev',

  // API 端点映射
  API_ENDPOINTS: {
    beta: 'https://beta-api.detake.com',
    web2: 'https://beta-api.detake.com',
    web3: 'https://api.detake.com',
    beta_dev: 'https://preview-api.detake.com',
  },

  // SSR 专用 API (服务端渲染时使用)
  SSR_API_BASE_URL: 'https://beta-ssr-api.detake.com',

  // 站点 URL 映射
  SITE_URLS: {
    beta: 'https://beta.detake.com',
    web2: 'https://detake.com',
    web3: 'https://web3.detake.com',
    beta_dev: 'https://detake.news',
  },

  // Getter 方法
  get API_BASE_URL(): string,
  get SITE_URL(): string,
}
```

#### MULTI_SOURCE_CONFIG - 多源站点配置

```typescript
MULTI_SOURCE_CONFIG = {
  // 当前站点源语言 (从环境变量读取)
  SOURCE_LANGUAGE: 'en' | 'zh' | 'ja',

  // 域名到源语言的映射
  SOURCE_LANGUAGE_DOMAINS: {
    en: ['en.detake.com', 'detake.com', 'en.dev.detake.com', ...],
    zh: ['zh.detake.com', 'zh.dev.detake.com', ...],
    ja: ['ja.detake.com', 'ja.dev.detake.com', ...],
  },

  // 工具方法
  getSourceLanguageFromDomain(hostname: string): SourceLanguage,
  languageToLocale(language: SourceLanguage): Locale,
  localeToLanguage(locale: Locale): SourceLanguage,
}
```

**使用示例**:
```typescript
// 在 Astro 组件中获取源语言
const sourceLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(Astro.url.hostname)
// ja.detake.com → 'ja'
// en.detake.com → 'en'
// detake.com → 'en'
```

#### STORAGE_KEYS - LocalStorage 键名

```typescript
STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  ACCESS_TOKEN: 'access_token',
  USER_ID: 'user_id',
  PROMOTE_CODE: 'promote_code',     // 默认值: xG0zT
  VISITOR_ID: 'visitor_id',
  GA_CLIENT_ID: 'ga_client_id',
  USER_BEHAVIOR_DATA: 'user_behavior_data',
  SOURCE_LANGUAGE: 'source_language',
}
```

#### ANALYTICS_CONFIG - 分析配置

```typescript
ANALYTICS_CONFIG = {
  // Google Analytics
  GA_MEASUREMENT_ID: import.meta.env.PUBLIC_GA_MEASUREMENT_ID,

  // Cloudflare Analytics
  CLOUDFLARE_ANALYTICS_TOKEN: import.meta.env.PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN,

  // 行为追踪间隔
  HEARTBEAT_INTERVAL: 30000,  // 30秒
  SCROLL_THROTTLE: 500,       // 500ms
  CLICK_DEBOUNCE: 300,        // 300ms

  // 数据收集限制
  MAX_EVENTS_QUEUE: 100,
  BATCH_SEND_INTERVAL: 60000, // 1分钟
}
```

---

### 2. **国际化系统** (`src/lib/i18n.ts`)

#### 新 API (推荐用于新代码)

```typescript
// 翻译函数 (基于源语言)
tl(language: SourceLanguage, key: string, fallback?: string): string

// React Hook
useLanguageTranslation(language: SourceLanguage) => { t }

// 创建绑定翻译器
createLanguageTranslator(language: SourceLanguage) => (key, fallback?) => string
```

**使用示例**:
```typescript
// 在 Astro 组件中
import { createLanguageTranslator } from '@/lib/i18n'
const t = createLanguageTranslator('ja')
const title = t('pages.homeTitle', '默认标题')

// 在 React 组件中
import { useLanguageTranslation } from '@/lib/i18n'
const { t } = useLanguageTranslation('ja')
const text = t('common.filters')
```

#### 旧 API (向后兼容)

```typescript
// 基于 Locale 的翻译函数
t(locale: Locale, key: string, fallback?: string): string
useTranslation(locale: Locale) => { t }
createTranslator(locale: Locale) => (key, fallback?) => string
```

#### 回退机制

翻译查找顺序:
1. 尝试当前语言
2. 回退到英文 (如果当前不是英文)
3. 返回自定义 fallback (如果提供)
4. 返回 key 本身

#### 翻译文件结构

```json
{
  "navigation": {
    "allCategories": "所有分类",
    "socialMedia": "社交媒体",
    ...
  },
  "common": {
    "filters": "筛选",
    "clearAll": "清空",
    "category": "分类",
    ...
  },
  "article": {
    "aboutAuthor": "关于作者",
    "shareToEarn": "分享赚取",
    ...
  },
  "pages": {
    "homeTitle": "首页",
    ...
  }
}
```

---

### 3. **语言工具库** (`src/lib/language-utils.ts`)

提供 **20+ 实用函数**,核心功能分类:

#### 语言检测

```typescript
// 从 URL 获取源语言
getSourceLanguageFromUrl(url: URL): SourceLanguage

// 从请求获取源语言 (SSR)
getSourceLanguageFromRequest(request: Request, hostname?: string): SourceLanguage

// 从路径提取翻译语言
extractTranslationLanguageFromPath(pathname: string): TranslationLanguage | null
// '/fr/article/news/example' → 'fr'
// '/article/news/example' → null
```

#### URL 构建

```typescript
// 构建文章 URL
buildArticleUrl(
  category: string,
  slug: string,
  sourceLanguage: SourceLanguage,
  translationLanguage: TranslationLanguage | null = null,
  userId?: string
): string

// 示例:
buildArticleUrl('news', 'example', 'ja', 'fr')
// → '/fr/article/news/example'

buildArticleUrl('news', 'example', 'ja', null, 'user123')
// → '/u/user123/article/news/example'

// 构建合集 URL
buildCollectionUrl(
  collectionId: string,
  slug: string,
  sourceLanguage: SourceLanguage,
  translationLanguage: TranslationLanguage | null = null
): string
```

#### 路径处理

```typescript
// 移除翻译前缀
removeTranslationPrefix(pathname: string): string
// '/fr/article/news/example' → '/article/news/example'

// 添加翻译前缀
addTranslationPrefix(pathname: string, lang: TranslationLanguage): string
// '/article/news/example' + 'fr' → '/fr/article/news/example'

// 检查是否为翻译路径
isTranslationPath(pathname: string): boolean
```

#### SEO 相关

```typescript
// 生成 hreflang 交替链接
generateHreflangAlternates(
  currentUrl: URL,
  sourceLanguage: SourceLanguage,
  availableTranslations: TranslationLanguage[]
): Array<{ hreflang: string; href: string }>

// 返回示例:
[
  { hreflang: 'x-default', href: 'https://ja.detake.com/article/news/example' },
  { hreflang: 'ja', href: 'https://ja.detake.com/article/news/example' },
  { hreflang: 'en', href: 'https://ja.detake.com/en/article/news/example' },
  { hreflang: 'fr', href: 'https://ja.detake.com/fr/article/news/example' },
]
```

#### 语言判断

```typescript
// 验证翻译语言
isValidTranslationLanguage(lang: string): lang is TranslationLanguage

// 验证源语言
isValidSourceLanguage(lang: string): lang is SourceLanguage

// 判断是否应跳转到源版本
shouldRedirectToSourceVersion(
  sourceLanguage: SourceLanguage,
  translationLanguage: TranslationLanguage | null
): boolean
```

#### 其他工具

```typescript
// 获取语言显示名称
getLanguageDisplayName(lang: TranslationLanguage, displayIn: 'en' | 'native'): string
// getLanguageDisplayName('ja', 'native') → '日本語'
// getLanguageDisplayName('ja', 'en') → 'Japanese'

// 解析 URL 中的语言信息
parseLanguagesFromUrl(url: URL): {
  sourceLanguage: SourceLanguage
  translationLanguage: TranslationLanguage | null
}

// 获取有效显示语言
getEffectiveLanguage(
  sourceLanguage: SourceLanguage,
  translationLanguage: TranslationLanguage | null
): TranslationLanguage
```

---

### 4. **状态管理** (`src/stores/index.ts` - Jotai Atoms)

#### 核心状态

```typescript
// 语言和主题
localeAtom: Atom<Locale>                  // 当前语言
themeAtom: Atom<'light' | 'dark'>         // 主题

// 用户和认证
userAtom: Atom<User | null>               // 用户信息
walletAddressAtom: Atom<string | null>    // 钱包地址
accessTokenAtom: Atom<string | null>      // 访问令牌
userIdAtom: Atom<string | null>           // 用户ID

// UI 状态
loadingAtom: Atom<boolean>                // 全局加载状态
mobileMenuOpenAtom: Atom<boolean>         // 移动端菜单

// 搜索和缓存
searchQueryAtom: Atom<string>             // 搜索查询
articlesCacheAtom: Atom<Record<string, any>>  // 文章缓存

// 推广码 (默认: xG0zT)
promoteCodeAtom: Atom<string>
```

#### 持久化 Atoms (自动同步到 localStorage)

```typescript
// 钱包地址持久化
persistedWalletAddressAtom
// 读取: get(persistedWalletAddressAtom)
// 写入: set(persistedWalletAddressAtom, '0x...')
// → 自动保存到 localStorage.wallet_address

// 访问令牌持久化
persistedAccessTokenAtom
// 写入时自动保存到 localStorage.access_token

// 推广码持久化 (双存储: localStorage + Cookie)
persistedPromoteCodeAtom
// 读取优先级: localStorage → Cookie → 默认值
// 写入时同时更新 localStorage 和 Cookie
// 触发 'promoteCodeChanged' 自定义事件
```

#### 复合操作 Atoms

```typescript
// 钱包登录数据批量设置
setWalletAuthDataAtom
// 用法: set(setWalletAuthDataAtom, { access_token, user_id })
// → 同时更新 accessTokenAtom 和 userIdAtom 及 localStorage

// 认证状态 (派生 Atom)
isAuthenticatedAtom
// 只读,自动基于 accessToken 和 userId 计算
// get(isAuthenticatedAtom) → boolean
```

#### 使用示例

```typescript
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { persistedPromoteCodeAtom, isAuthenticatedAtom } from '@/stores'

function MyComponent() {
  // 读写
  const [promoteCode, setPromoteCode] = useAtom(persistedPromoteCodeAtom)

  // 只读
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  // 只写
  const setWalletAddress = useSetAtom(persistedWalletAddressAtom)

  return (
    <div>
      <p>Promote Code: {promoteCode}</p>
      <button onClick={() => setPromoteCode('newCode')}>
        Update Code
      </button>
    </div>
  )
}
```

---

### 5. **API 接口封装** (`src/api/`)

#### 核心文件

**articles.ts** - 文章相关
```typescript
// 获取文章列表 (支持高级筛选和分页)
fetchArticles(
  locale: Locale,
  page: number,
  limit: number,
  options?: {
    category?: string
    business_type_name?: string
    category_names?: string
    subcategory_names?: string
    tag?: string
    author_name?: string
    order_by?: 'Latest' | 'Popular' | 'Trending'
    cursor?: string
    signal?: AbortSignal
  }
): Promise<ArticlesResponse | null>

// 获取单篇文章
fetchArticleBySlug(slug: string, locale: Locale): Promise<ApiArticle | null>

// 获取分类列表
fetchCategories(locale: Locale): Promise<ArticleCategory[]>

// 获取标签列表
fetchTags(locale: Locale): Promise<ArticleTag[]>

// 获取作者文章
fetchAuthorArticles(authorName: string, locale: Locale, page: number): Promise<ArticlesResponse | null>

// 首页数据
fetchHomePageData(locale: Locale): Promise<HomePageData | null>
```

**collections.ts** - 合集相关
```typescript
// 获取合集列表
fetchCollections(page: number, limit: number): Promise<CollectionItem[]>

// 获取合集详情
fetchCollectionById(id: string): Promise<CollectionItem | null>
```

**users.ts** - 用户相关
```typescript
// 获取用户个人信息
fetchUserPersonalInfo(userId: string, accessToken: string): Promise<UserPersonalInfo | null>

// 更新用户信息
updateUserPersonalInfo(userId: string, data: Partial<UserPersonalInfo>, accessToken: string): Promise<boolean>
```

**auth.ts** - 认证相关
```typescript
// 钱包登录
walletLogin(walletAddress: string, signature: string): Promise<WalletLoginData | null>

// 获取登录消息
getLoginMessage(walletAddress: string): Promise<string | null>
```

#### 请求策略

```typescript
// API Base URL 自动选择
const getApiBaseUrl = () => (
  typeof window === 'undefined'
    ? SSR_API_BASE_URL  // 服务端渲染: https://beta-ssr-api.detake.com
    : API_BASE_URL      // 客户端渲染: https://beta-api.detake.com
)

// 使用 ssrFetch 包装所有请求
import { ssrFetch } from '@/lib/serverFetch'

const response = await ssrFetch(`${getApiBaseUrl()}/api/v1/articles`, {
  headers: { 'Content-Type': 'application/json' },
  signal: options?.signal,  // 支持中断
  endpointName: 'fetchArticles',  // 日志标识
})
```

#### 分页模式

```typescript
// 支持两种分页方式

// 1. Page-based (传统分页)
fetchArticles(locale, page, limit)

// 2. Cursor-based (推荐用于无限滚动)
fetchArticles(locale, 1, limit, { cursor: 'eyJpZCI6MTIzfQ==' })
```

---

### 6. **SEO 优化** (`src/layouts/BaseLayout.astro`)

#### BaseLayout Props

```typescript
interface Props {
  // 基础 SEO
  title: string
  description?: string
  locale: Locale
  canonicalUrl?: string

  // Open Graph / Twitter Card
  ogImage?: string
  ogImageAlt?: string
  ogType?: 'website' | 'article'
  twitterCard?: 'summary' | 'summary_large_image'

  // 文章特定
  author?: string
  publishedTime?: string
  modifiedTime?: string
  keywords?: string[]
  articleSection?: string

  // 多源站点架构
  sourceLanguage?: SourceLanguage
  translationLanguage?: TranslationLanguage | null
  availableTranslations?: TranslationLanguage[]

  // 页面语言覆盖
  pageLang?: TranslationLanguage | string
}
```

#### 生成的 SEO 标签

**Canonical URL**:
```html
<link rel="canonical" href="https://ja.detake.com/article/news/example" />
```

**Hreflang 标签** (自动生成):
```html
<link rel="alternate" hreflang="x-default" href="https://ja.detake.com/article/news/example" />
<link rel="alternate" hreflang="ja" href="https://ja.detake.com/article/news/example" />
<link rel="alternate" hreflang="en" href="https://ja.detake.com/en/article/news/example" />
<link rel="alternate" hreflang="fr" href="https://ja.detake.com/fr/article/news/example" />
```

**Open Graph**:
```html
<meta property="og:title" content="文章标题" />
<meta property="og:description" content="文章描述" />
<meta property="og:image" content="https://cdn.detake.com/images/article.jpg" />
<meta property="og:url" content="https://ja.detake.com/article/news/example" />
<meta property="og:type" content="article" />
<meta property="og:locale" content="ja_JP" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:locale:alternate" content="fr_FR" />
```

**Twitter Card**:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="文章标题" />
<meta name="twitter:description" content="文章描述" />
<meta name="twitter:image" content="https://cdn.detake.com/images/article.jpg" />
```

**Robots** (根据环境自动切换):
```html
<!-- 生产环境 -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

<!-- 测试环境 -->
<meta name="robots" content="noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
```

#### 使用示例

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'

const sourceLanguage = 'ja'
const availableTranslations = ['en', 'fr', 'zh']
---

<BaseLayout
  title="文章标题"
  description="文章描述"
  locale="ja"
  sourceLanguage={sourceLanguage}
  availableTranslations={availableTranslations}
  ogImage="https://cdn.detake.com/images/article.jpg"
  ogType="article"
  keywords={['crypto', 'news', 'bitcoin']}
  author="John Doe"
  publishedTime="2026-02-27T10:00:00Z"
>
  <!-- 页面内容 -->
</BaseLayout>
```

---

### 7. **分析与埋点系统** (`src/lib/analytics.ts`)

#### 集成服务

- **Google Analytics 4** (GA4)
- **Cloudflare Analytics**
- **自定义访客 ID 系统**

#### 核心功能

```typescript
// 获取 Analytics 实例 (单例)
const analytics = getAnalytics()

// 追踪事件
analytics.trackEvent(eventType: string, data: Record<string, any>)

// 初始化 (自动在 AnalyticsProvider 中调用)
analytics.initialize()

// 清理
analytics.cleanup()
```

#### 支持的事件类型

```typescript
// 页面相关
'page_view'           // 页面浏览
'time_on_page'        // 页面停留时间
'scroll_depth'        // 滚动深度

// 文章相关
'article_view'        // 文章查看
'article_share'       // 文章分享

// 用户交互
'click_event'         // 点击事件
'search_event'        // 搜索事件
'user_engagement'     // 用户参与度

// 认证相关
'login_attempt'       // 登录尝试
'login_success'       // 登录成功
'login_failure'       // 登录失败

// 自定义 UI 事件
'header_user_button_click'  // 头部用户按钮点击
'wallet_button_click'       // 钱包按钮点击
```

#### 使用示例

```typescript
import { getAnalytics } from '@/lib/analytics'

// 在组件中使用
function MyComponent() {
  const analytics = getAnalytics()

  const handleArticleView = () => {
    analytics.trackEvent('article_view', {
      articleId: 'article-123',
      category: 'news',
      author: 'John Doe',
      title: 'Article Title',
    })
  }

  const handleShare = () => {
    analytics.trackEvent('article_share', {
      articleId: 'article-123',
      platform: 'twitter',
    })
  }

  return <div>...</div>
}
```

#### 集成到布局

```astro
---
import AnalyticsProvider from '@/components/common/AnalyticsProvider'
---

<html>
  <body>
    <!-- 页面内容 -->

    <!-- Analytics Provider (在页面底部) -->
    <AnalyticsProvider client:load />
  </body>
</html>
```

#### 特性

- **批量发送**: 每 60 秒发送一次事件队列
- **事件队列**: 最多缓存 100 个事件
- **防抖/节流**:
  - 滚动事件: 500ms 节流
  - 点击事件: 300ms 防抖
- **localStorage 持久化**: 访客 ID、GA Client ID
- **SSR 兼容**: 仅在客户端初始化

---

## 🚀 关键开发流程

### 创建新的 Astro 页面

```astro
---
// src/pages/my-page.astro
import BaseLayout from '@/layouts/BaseLayout.astro'
import { MULTI_SOURCE_CONFIG } from '@/config/constants'
import { createLanguageTranslator } from '@/lib/i18n'

// 1. 获取源语言
const sourceLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(Astro.url.hostname)

// 2. 转换为 Locale (向后兼容)
const locale = MULTI_SOURCE_CONFIG.languageToLocale(sourceLanguage)

// 3. 创建翻译函数
const t = createLanguageTranslator(sourceLanguage)

// 4. 获取数据 (如果需要)
const data = await fetchSomeData(locale)
---

<BaseLayout
  title={t('pages.myPageTitle')}
  description={t('pages.myPageDescription')}
  locale={locale}
  sourceLanguage={sourceLanguage}
>
  <h1>{t('pages.myPageHeading')}</h1>
  <!-- 页面内容 -->
</BaseLayout>
```

### 创建交互式 React 组件

```tsx
// src/components/common/react/MyComponent.tsx
import { useLanguageTranslation } from '@/lib/i18n'
import type { SourceLanguage } from '@/types'

interface Props {
  sourceLanguage: SourceLanguage
  data?: any
}

export default function MyComponent({ sourceLanguage, data }: Props) {
  const { t } = useLanguageTranslation(sourceLanguage)

  return (
    <div className="container mx-auto px-4">
      <h2>{t('common.title')}</h2>
      {/* 组件内容 */}
    </div>
  )
}
```

在 Astro 页面中使用:
```astro
---
import MyComponent from '@/components/common/react/MyComponent'
---

<MyComponent
  sourceLanguage={sourceLanguage}
  client:load
/>
```

### 构建文章 URL

```typescript
import { buildArticleUrl } from '@/lib/language-utils'

// 场景1: 源语言文章
const url1 = buildArticleUrl('news', 'example-slug', 'ja', null)
// → '/article/news/example-slug'

// 场景2: 翻译文章
const url2 = buildArticleUrl('news', 'example-slug', 'ja', 'fr')
// → '/fr/article/news/example-slug'

// 场景3: 用户文章 (源语言)
const url3 = buildArticleUrl('news', 'example-slug', 'ja', null, 'user123')
// → '/u/user123/article/news/example-slug'

// 场景4: 用户文章 (翻译)
const url4 = buildArticleUrl('news', 'example-slug', 'ja', 'en', 'user123')
// → '/en/u/user123/article/news/example-slug'

// 完整 URL (需要手动拼接域名)
const fullUrl = `https://ja.detake.com${url2}`
// → 'https://ja.detake.com/fr/article/news/example-slug'
```

### 添加新翻译语言

**步骤1**: 创建翻译文件

```bash
# 创建新语言目录
mkdir public/locales/fr

# 复制英文翻译作为模板
cp public/locales/en/translation.json public/locales/fr/translation.json

# 编辑翻译内容
# 将所有英文文本替换为法语
```

**步骤2**: 导入翻译文件

```typescript
// src/lib/i18n.ts
import frTranslations from '../../public/locales/fr/translation.json'

const languageTranslations: Record<SourceLanguage, TranslationData> = {
  en: enTranslations as TranslationData,
  zh: zhTranslations as TranslationData,
  ja: jaTranslations as TranslationData,
  fr: frTranslations as TranslationData,  // 添加这行
}
```

**步骤3**: 更新类型定义

```typescript
// src/types/index.ts

// 如果是翻译语言 (仅用于文章翻译)
export type TranslationLanguage = 'en' | 'zh' | 'ja' | 'fr' | 'ar' | 'ru' | 'de' | 'es' | 'ko'

// 如果是新的源语言站点 (需要独立域名)
export type SourceLanguage = 'en' | 'zh' | 'ja' | 'fr'  // 添加 'fr'
```

**步骤4**: 更新配置 (仅源语言需要)

```typescript
// src/config/constants.ts
export const MULTI_SOURCE_CONFIG = {
  SOURCE_LANGUAGE_DOMAINS: {
    en: [...],
    zh: [...],
    ja: [...],
    fr: ['fr.detake.com', 'fr.dev.detake.com', ...],  // 添加域名映射
  },
}
```

### 获取和显示文章列表

```astro
---
import { fetchArticles } from '@/api/articles'
import ArticleCard from '@/components/article/astro/ArticleCard.astro'

const locale = 'ja'

// 获取最新文章
const latestArticles = await fetchArticles(locale, 1, 10, {
  order_by: 'Latest'
})

// 获取特定分类
const newsArticles = await fetchArticles(locale, 1, 10, {
  business_type_name: 'news'
})

// 获取特定作者
const authorArticles = await fetchArticles(locale, 1, 10, {
  author_name: 'John Doe'
})

// 获取带标签筛选
const taggedArticles = await fetchArticles(locale, 1, 10, {
  tag: 'bitcoin,ethereum'  // 逗号分隔多个标签
})
---

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {latestArticles?.articles.map(article => (
    <ArticleCard article={article} locale={locale} />
  ))}
</div>
```

### 实现状态管理

```tsx
import { useAtom, useAtomValue } from 'jotai'
import {
  persistedPromoteCodeAtom,
  isAuthenticatedAtom,
  setWalletAuthDataAtom
} from '@/stores'

function MyAuthComponent() {
  // 读写推广码
  const [promoteCode, setPromoteCode] = useAtom(persistedPromoteCodeAtom)

  // 只读认证状态
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  // 设置钱包登录数据
  const setAuthData = useSetAtom(setWalletAuthDataAtom)

  const handleLogin = async () => {
    const loginData = await walletLogin(address, signature)
    if (loginData) {
      // 同时设置 accessToken 和 userId
      setAuthData(loginData)
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>已登录,推广码: {promoteCode}</p>
      ) : (
        <button onClick={handleLogin}>登录</button>
      )}
    </div>
  )
}
```

### 添加分析事件追踪

```tsx
import { getAnalytics } from '@/lib/analytics'
import { useEffect } from 'react'

function ArticleDetailPage({ article }) {
  const analytics = getAnalytics()

  useEffect(() => {
    // 追踪文章浏览
    analytics.trackEvent('article_view', {
      articleId: article.entry_id,
      category: article.category_names[0],
      author: article.author_name,
      title: article.title,
    })

    // 追踪页面停留时间
    const startTime = Date.now()
    return () => {
      const duration = Date.now() - startTime
      analytics.trackEvent('time_on_page', {
        page: window.location.pathname,
        duration,
      })
    }
  }, [article])

  const handleShare = (platform: string) => {
    analytics.trackEvent('article_share', {
      articleId: article.entry_id,
      platform,
    })
    // 执行分享逻辑...
  }

  return (
    <div>
      <h1>{article.title}</h1>
      <button onClick={() => handleShare('twitter')}>
        分享到 Twitter
      </button>
    </div>
  )
}
```

---

## 🛠️ 常用命令

```bash
# 开发环境启动
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 类型检查 (提交前必跑!)
pnpm type-check

# 拼写检查
pnpm check:spelling

# 检查 /us 路由中的中文内容 (质量控制)
pnpm check:no-chinese-us

# Vercel 本地开发
pnpm start

# 模拟 Vercel 生产环境
pnpm vercel:simulate
```

### 测试不同源语言

```bash
# 测试英文站点
PUBLIC_SOURCE_LANGUAGE=en pnpm dev

# 测试中文站点
PUBLIC_SOURCE_LANGUAGE=zh pnpm dev

# 测试日文站点
PUBLIC_SOURCE_LANGUAGE=ja pnpm dev
```

---

## ⚠️ 重要开发约定

### 1. TypeScript 强类型优先

```typescript
// ✅ 好的做法
interface ArticleProps {
  article: ApiArticle
  locale: Locale
  sourceLanguage: SourceLanguage
}

function ArticleCard({ article, locale, sourceLanguage }: ArticleProps) {
  // ...
}

// ❌ 避免使用 any
function MyComponent(props: any) {  // 不推荐
  // ...
}

// 如果确实需要 any,必须在代码审查中说明原因
```

### 2. Astro + React 职责分工

```astro
<!-- ✅ 好的做法: 静态内容用 Astro -->
---
import BaseLayout from '@/layouts/BaseLayout.astro'
---

<BaseLayout>
  <header>
    <h1>静态标题</h1>
    <nav>...</nav>
  </header>

  <!-- 交互部分用 React Islands -->
  <InteractiveFilter client:load />
  <DynamicContent client:visible />
</BaseLayout>

<!-- ❌ 避免: 把整个静态页面写成 React -->
<BaseLayout>
  <StaticPageAsReactComponent client:load />  <!-- 不推荐 -->
</BaseLayout>
```

### 3. Tailwind CSS v4 最佳实践

```tsx
// ✅ 好的做法: 优先使用原子类
<div className="max-w-[1440px] mx-auto px-4 lg:px-8">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    标题
  </h1>
</div>

// ✅ 复用样式用 cn() 工具
import { cn } from '@/lib/utils'

<button className={cn(
  "px-4 py-2 rounded-lg",
  isPrimary ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  按钮
</button>

// ❌ 避免: 内联 style (除非动态值)
<div style={{ marginTop: '20px' }}>  <!-- 不推荐 -->
  应该用 className="mt-5"
</div>
```

### 4. 提交前必��检查

```bash
# 1. 类型检查 (零容忍错误)
pnpm type-check
# 必须显示: 0 errors

# 2. 拼写检查
pnpm check:spelling

# 3. 本地构建测试
pnpm build

# 4. 如果修改了 API 调用,测试 SSR
PUBLIC_SOURCE_LANGUAGE=ja pnpm build && pnpm preview
```

### 5. 注释规范

```typescript
/**
 * Build article URL with proper language handling
 * 构建带有语言处理的文章 URL
 *
 * @param category - Article category (文章分类)
 * @param slug - Article slug (文章 slug)
 * @param sourceLanguage - Current site's source language (当前站点源语言)
 * @param translationLanguage - Target translation language (目标翻译语言, null 表示源版本)
 * @param userId - Optional user ID for user-generated articles (用户文章的用户ID)
 * @returns Complete pathname (完整路径名)
 *
 * @example
 * buildArticleUrl('news', 'example', 'ja', 'fr')
 * // Returns: '/fr/article/news/example'
 */
export function buildArticleUrl(
  category: string,
  slug: string,
  sourceLanguage: SourceLanguage,
  translationLanguage: TranslationLanguage | null = null,
  userId?: string
): string {
  // 实现...
}
```

**原则**:
- 函数签名、接口定义: 英文注释
- 复杂业务逻辑: 英文 + 中文双语
- HTML/Astro 模板: 英文注释
- 临时 TODO: 可以用中文

### 6. 前端安全规范

```typescript
// ✅ 输入验证
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')  // 移除 HTML 标签
    .replace(/javascript:/gi, '')  // 移除 JavaScript 协议
    .trim()
}

// ✅ 防抖处理
import { debounce } from '@/lib/utils'

const handleSearch = debounce((query: string) => {
  // 搜索逻辑
}, 300)

// ✅ 生成唯一请求 ID
import crypto from 'crypto'

const generateRequestId = (userId: string) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return crypto.createHash('md5')
    .update(`${userId}-${timestamp}-${random}`)
    .digest('hex')
}

// ✅ 文本输入正则校验
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = (email: string) => emailRegex.test(email)

// ❌ 避免: 直接渲染用户输入
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // 危险!
```

### 7. 文件命名规范

```
组件文件:
- React 组件: PascalCase.tsx (ArticleCard.tsx, FilterBar.tsx)
- Astro 组件: PascalCase.astro (BaseLayout.astro, ArticleCard.astro)

工具文件:
- 工具库: camelCase.ts (i18n.ts, language-utils.ts, analytics.ts)
- API: camelCase.ts (articles.ts, collections.ts)

类型文件:
- index.ts (统一导出所有类型)

配置文件:
- constants.ts, config.ts
```

---

## 📊 技术指标与质量标准

### ✅ 项目当前状态

- **TypeScript 类型检查**: 0 错误
- **路由冲突**: 0 警告
- **向后兼容**: 完全支持旧 Locale 系统
- **SEO 优化**: ✅ Hreflang + Canonical + OG
- **多语言**: 3 源语言 + 9 翻译语言
- **代码分割**: ✅ Vendor + Utils chunks
- **生产优化**: ✅ Terser minification + CSS splitting
- **构建时间**: ~2-3 分钟 (生产环境)
- **包大小**:
  - Vendor chunk: ~200KB (gzipped)
  - 首屏 JS: ~100KB (gzipped)

### 性能目标

- **Lighthouse Score**: 90+ (Mobile)
- **首次内容绘制 (FCP)**: < 1.5s
- **最大内容绘制 (LCP)**: < 2.5s
- **累积布局偏移 (CLS)**: < 0.1
- **首次输入延迟 (FID)**: < 100ms

---

## 🎯 未来扩展计划

### 1. 功能页全站翻译

支持分类页、主页等功能页的翻译路径:

```
当前: ja.detake.com/research (仅日文)
未来: ja.detake.com/fr/research (法语翻译版)
```

**实现要点**:
- 扩展路由结构支持 `[translationLang]/[category]`
- 翻译所有 UI 文案
- 调整 API 返回对应语言的内容列表

### 2. 新源语言站点

添加更多源语言站点:

```
ko.detake.com  - 韩文源站点
es.detake.com  - 西班牙文源站点
ar.detake.com  - 阿拉伯文源站点
```

**实现步骤**:
1. 在 `SourceLanguage` 类型中添加新语言
2. 配置域名映射 (`MULTI_SOURCE_CONFIG`)
3. 创建翻译文件 (`public/locales/{lang}/`)
4. 部署独立实例
5. 配置独立 API endpoint

### 3. A/B 测试系统

基于现有 Analytics 系统扩展:

```typescript
// 定义实验
const experiments = {
  'homepage-layout': {
    variants: ['control', 'variant-a', 'variant-b'],
    weights: [0.34, 0.33, 0.33],
  }
}

// 分配用户到实验组
const variant = assignExperiment('homepage-layout', visitorId)

// 追踪转化
analytics.trackEvent('experiment_conversion', {
  experimentId: 'homepage-layout',
  variant,
  conversionType: 'signup',
})
```

### 4. 实时推送功能

WebSocket 集成用于实时通知:

```typescript
// 连接 WebSocket
const ws = new WebSocket('wss://ws.detake.com')

// 监听新文章
ws.on('new_article', (article) => {
  // 显示通知
  showNotification(`新文章: ${article.title}`)
})

// 监听评论更新
ws.on('comment_update', (comment) => {
  // 更新评论列表
  updateCommentList(comment)
})
```

### 5. PWA 支持

渐进式 Web 应用功能:

```javascript
// Service Worker
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

// Manifest
{
  "name": "DeTake",
  "short_name": "DeTake",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "icons": [...]
}
```

---

## 📚 项目文档索引

项目内置完整文档系统,位于 `docs/` 目录:

### 架构与设计

- **`MULTI_SOURCE_SITE_ARCHITECTURE.md`** - 多源站点架构设计完整说明
- **`FINAL_SUMMARY.md`** - 架构重构总结和里程碑
- **`ROUTE_CHANGES.md`** - 路由结构变更详细记录

### 开发指南

- **`I18N_UPDATE.md`** - 国际化系统更新和迁移指南
- **`MIGRATION_MULTI_SOURCE.md`** - 从旧架构迁移到多源架构的步骤
- **`ANALYTICS_GUIDE.md`** - 分析和埋点系统完整文档

### 配置与部署

- **`ENVIRONMENT_VARIABLES.md`** - 环境变量说明
- **`GA_IP_LOGIC.md`** - Google Analytics IP 检测逻辑

### 组件使用

- **`NEWSGRID_USAGE.md`** - NewsGrid 组件使用说明
- **`PROJECT_KNOWLEDGE_MAP.md`** - 本文档 (项目知识图谱)

### 项目根目录文档

- **`CLAUDE.md`** - AI 使用说明和项目开发规范
- **`README.md`** - 项目基础说明

---

## 🔍 快速查找指南

### 需要修改文章相关功能?

- **文章列表 API**: `src/api/articles.ts` → `fetchArticles()`
- **文章详情页面**: `src/pages/article/[category]/[slug].astro`
- **文章卡片组件**: `src/components/article/astro/ArticleCard.astro`
- **文章内容组件**: `src/components/article/react/ArticleContent.tsx`
- **文章类型定义**: `src/types/index.ts` → `ApiArticle`

### 需要修改语言切换?

- **语言工具函数**: `src/lib/language-utils.ts`
- **翻译系统**: `src/lib/i18n.ts`
- **翻译文件**: `public/locales/{lang}/translation.json`
- **语言切换组件**: `src/components/article/react/LanguageSwitcher.tsx`

### 需要修改导航/头部?

- **Header 组件**: `src/components/common/react/header/`
- **移动端导航**: `src/components/common/react/header/MobileNav.tsx`
- **分类下拉菜单**: `src/components/common/react/header/CategoryDropdown.tsx`

### 需要修改 SEO?

- **BaseLayout**: `src/layouts/BaseLayout.astro`
- **Hreflang 生成**: `src/lib/language-utils.ts` → `generateHreflangAlternates()`
- **Canonical URL**: `BaseLayout.astro` → `currentUrl`

### 需要修改状态管理?

- **所有 Atoms**: `src/stores/index.ts`
- **认证状态**: `isAuthenticatedAtom`, `accessTokenAtom`, `userIdAtom`
- **推广码**: `persistedPromoteCodeAtom`

### 需要修改 API 调用?

- **API 封装**: `src/api/`
- **SSR Fetch**: `src/lib/serverFetch.ts`
- **API 配置**: `src/config/constants.ts` → `SITE_CONFIG`

### 需要添加分析事件?

- **Analytics 系统**: `src/lib/analytics.ts`
- **事件类型**: `src/config/constants.ts` → `TRACKING_EVENTS`
- **Provider**: `src/components/common/AnalyticsProvider.tsx`

---

## 💡 常见问题解答

### Q: 如何在本地测试不同的源语言站点?

A: 设置环境变量:

```bash
PUBLIC_SOURCE_LANGUAGE=ja pnpm dev
# 或
PUBLIC_SOURCE_LANGUAGE=zh pnpm dev
```

### Q: 为什么用户文章使用 `/u/{userId}/` 前缀?

A: 为了避免与翻译语言路径 `/{lang}/` 冲突。如果没有这个前缀,`/ja/article/...` 会被误判为 "日语翻译" 而不是 "用户 'ja' 的文章"。

### Q: 翻译缺失时会发生什么?

A: 系统会按以下顺序回退:
1. 当前语言
2. 英文 (如果当前不是英文)
3. 自定义 fallback
4. 返回 key 本身

### Q: 如何判断当前是在 SSR 还是 CSR 环境?

A:

```typescript
if (typeof window === 'undefined') {
  // SSR 环境
} else {
  // CSR 环境 (浏览器)
}
```

### Q: 推广码的默认值是什么?

A: `xG0zT` (定义在 `src/config/constants.ts` → `DEFAULT_PROMOTE_CODE`)

### Q: 如何添加新的环境?

A: 修改 `src/config/constants.ts`:

```typescript
SITE_CONFIG = {
  API_ENDPOINTS: {
    beta: '...',
    web2: '...',
    web3: '...',
    my_new_env: 'https://my-api.detake.com',  // 添加这行
  },
  SITE_URLS: {
    // ...
    my_new_env: 'https://my-site.detake.com',  // 添加这行
  },
}
```

然后设置环境变量:
```bash
PUBLIC_SITE_ENV=my_new_env pnpm dev
```

### Q: 为什么有两个 API Base URL?

A:
- **`SSR_API_BASE_URL`**: 服务端渲染时使用,内网直连,速度快
- **`API_BASE_URL`**: 客户端请求使用,公网访问

这样可以优化首屏加载速度。

### Q: 如何调试 Analytics 事件?

A: 在浏览器控制台:

```javascript
// 启用调试模式
window.__ANALYTICS_DEBUG = true

// 查看事件队列
console.log(window.__ANALYTICS_EVENTS)

// 手动触发事件发送
window.dispatchEvent(new Event('beforeunload'))
```

---

## 📞 支持与反馈

### 遇到问题?

1. **查阅文档**: 先查看 `docs/` 目录中的相关文档
2. **检查类型**: 运行 `pnpm type-check` 确认类型错误
3. **查看日志**: 检查浏览器控制台和终端输出
4. **Git 历史**: 查看最近的提交记录,了解变更

### 需要帮助?

- **架构问题** → `docs/MULTI_SOURCE_SITE_ARCHITECTURE.md`
- **迁移问题** → `docs/MIGRATION_MULTI_SOURCE.md`
- **路由问题** → `docs/ROUTE_CHANGES.md`
- **国际化问题** → `docs/I18N_UPDATE.md`
- **分析系统** → `docs/ANALYTICS_GUIDE.md`

---

## 🏆 项目里程碑

- ✅ **2025-09**: 项目初始化,Astro + React 基础架构
- ✅ **2025-10**: 分析和埋点系统集成
- ✅ **2025-11**: 旧 Locale 系统 (`/us`, `/asia`)
- ✅ **2026-02-09**: 多源站点架构设计完成
- ✅ **2026-02-09**: 类型系统重构 (SourceLanguage + TranslationLanguage)
- ✅ **2026-02-09**: 路由结构重构 (移除 `[locale]` 路由)
- ✅ **2026-02-09**: 中间件自动跳转实现
- ✅ **2026-02-09**: SEO 优化 (Hreflang + Canonical)
- ✅ **2026-02-09**: 语言工具库完成 (20+ 函数)
- ✅ **2026-02-09**: 国际化系统更新
- ✅ **2026-02-09**: 旧 Locale 系统清理
- ✅ **2026-02-09**: 文档系统完成
- ✅ **2026-02-27**: 项目知识图谱生成 (本文档)

---

## 📝 文档维护

**本文档应在以下情况更新**:

1. 添加新的核心系统或模块
2. 重大架构变更
3. 新增源语言站点
4. API 接口重大调整
5. 新增重要的开发规范
6. 项目依赖版本升级 (主要版本)

**更新方式**:
- 直接编辑本文件: `docs/PROJECT_KNOWLEDGE_MAP.md`
- 更新 "最后更新" 日期
- 在 Git 提交信息中注明文档变更

---

**最后更新**: 2026-02-27
**文档版本**: 1.0.0
**项目状态**: ✅ 生产环境运行中
