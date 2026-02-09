# 多源站点国际化架构设计

## 概览

本文档描述 DeTake 前端的多源站点国际化架构,从原有的地区站点模式 (`/us`, `/asia`) 迁移到源语言域名+翻译路径模式。最终方案中不再保留旧 `[locale]` 路由,仅通过域名表达源语言,路径表达翻译语言。

## 核心概念

### 1. 源站点 (Source Site)

- **定义**: 以特定语言为源头语料的站点,面向该语言的受众
- **域名格式**: `{lang}.detake.com`
  - `en.detake.com` - 英文源站点
  - `zh.detake.com` - 中文源站点
  - `ja.detake.com` - 日文源站点
- **数据隔离**: 各源站点的后端数据完全分割

### 2. 翻译版本 (Translation)

- **定义**: 源语言文章的其他语言翻译版本
- **路径格式**: `/{translationLang}/...`
- **示例**:
  - `ja.detake.com/fr/article/news/trump-says-it-would-be-gr-erxf-xG0zT` - 日文源站的法语翻译
  - `en.detake.com/zh/article/insights/crypto-market-analysis` - 英文源站的中文翻译

### 3. 自动跳转规则

- **规则**: 当路径中的语言代码与源站点语言相同时,自动跳转到无语言路径的版本
- **示例**:
  - `ja.detake.com/ja/article/...` → `ja.detake.com/article/...`
  - `en.detake.com/en/article/...` → `en.detake.com/article/...`

### 4. 翻译路径适用范围

- **支持**: 文章详情页 (`/article/...`), 用户文章 (`/u/...`), Collection 详情页 (`/collections/...`)
- **不支持(暂时)**: 分类页、搜索页、主页等功能页
- **原因**: 保留未来对功能页进行全站翻译的升级可能

## 技术实现

### 1. 类型定义

```typescript
// 源语言代码 (站点级别)
export type SourceLanguage = 'en' | 'zh' | 'ja';

// 翻译语言代码 (文章/内容级别)
export type TranslationLanguage = 'en' | 'zh' | 'ja' | 'fr' | 'ar' | 'ru' | 'de' | 'es' | 'ko';

// 所有支持的语言
export type SupportedLanguage = TranslationLanguage;

// 站点配置
export interface SiteConfig {
  sourceLanguage: SourceLanguage;
  domain: string;
}
```

### 2. URL 结构

#### 源语言文章 (无翻译)

```
{domain}/article/{category}/{slug}
例: ja.detake.com/article/news/japan-crypto-regulation
```

#### 翻译文章

```
{domain}/{translationLang}/article/{category}/{slug}
例: ja.detake.com/fr/article/news/japan-crypto-regulation
```

#### Collection

```
# 源语言
{domain}/collections/{collectionId}/{slug}

# 翻译版本
{domain}/{translationLang}/collections/{collectionId}/{slug}
```

#### 功能页 (不支持翻译路径)

```
{domain}/
{domain}/{category}
{domain}/topics/{topic}
{domain}/authors/{author}
{domain}/tutorials
{domain}/tutorials/{slug}
```

### 3. 路由结构

```
src/pages/
├── index.astro                           # 主页
├── article/
│   └── [category]/
│       └── [slug].astro                  # 源语言文章
├── u/
│   └── [userId]/
│       └── article/
│           └── [category]/
│               └── [slug].astro          # 源语言用户文章
├── [translationLang]/
│   ├── article/
│   │   └── [category]/
│   │       └── [slug].astro              # 翻译文章
│   ├── u/
│   │   └── [userId]/
│   │       └── article/
│   │           └── [category]/
│   │               └── [slug].astro      # 翻译用户文章
│   └── collections/
│       ├── [collectionId]/
│       │   └── [slug].astro              # 翻译Collection
│       └── index.astro
├── collections/
│   ├── [collectionId]/
│   │   └── [slug].astro                  # 源语言Collection
│   └── index.astro
├── [category]/
│   └── index.astro                       # 分类页
├── topics/
│   └── [topic].astro                     # Topic页
└── authors/
    └── [authorName].astro                # 作者页
```

### 4. 域名与源语言映射

通过环境变量或服务器端检测确定当前站点的源语言:

```typescript
// 从域名获取源语言
function getSourceLanguageFromDomain(hostname: string): SourceLanguage {
  if (hostname.startsWith('ja.')) return 'ja';
  if (hostname.startsWith('zh.')) return 'zh';
  if (hostname.startsWith('en.')) return 'en';
  // 默认使用环境变量或配置
  return (import.meta.env.PUBLIC_SOURCE_LANGUAGE as SourceLanguage) || 'en';
}
```

### 5. 语言跳转中间件

在 Astro 中间件中实现自动跳转逻辑:

```typescript
// src/middleware/language-redirect.ts
export function languageRedirect(context: APIContext, next: () => Promise<Response>) {
  const { pathname } = context.url;
  const hostname = context.url.hostname;
  const sourceLanguage = getSourceLanguageFromDomain(hostname);

  // 匹配 /{lang}/article/... 或 /{lang}/u/... 或 /{lang}/collections/... 模式
  const match = pathname.match(/^\/([a-z]{2})(\/((article|collections)\/.*|u\/.*))$/);

  if (match) {
    const [, lang, restPath] = match;

    // 如果路径中的语言与源站点语言相同,跳转到无语言路径版本
    if (lang === sourceLanguage) {
      return Response.redirect(new URL(restPath, context.url), 301);
    }
  }

  return next();
}
```

### 6. SEO 优化

#### Canonical URL

- 源语言文章: `https://{domain}/article/{category}/{slug}`
- 翻译文章: `https://{domain}/{lang}/article/{category}/{slug}`

#### Hreflang 标签

```html
<!-- 源语言 -->
<link rel="alternate" hreflang="ja" href="https://ja.detake.com/article/news/example" />

<!-- 翻译版本 -->
<link rel="alternate" hreflang="en" href="https://ja.detake.com/en/article/news/example" />
<link rel="alternate" hreflang="zh" href="https://ja.detake.com/zh/article/news/example" />
<link rel="alternate" hreflang="fr" href="https://ja.detake.com/fr/article/news/example" />

<!-- x-default 指向源语言 -->
<link rel="alternate" hreflang="x-default" href="https://ja.detake.com/article/news/example" />
```

#### Open Graph

```html
<meta property="og:locale" content="ja_JP" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:locale:alternate" content="zh_CN" />
```

### 7. API 调用适配

API 调用需要携带源站点信息:

```typescript
// 获取文章时指定源语言
async function fetchArticle(slug: string, sourceLanguage: SourceLanguage, category: string) {
  const response = await fetch(`${API_BASE_URL}/articles/${slug}?source_lang=${sourceLanguage}&category=${category}`);
  return response.json();
}

// 获取翻译版本
async function fetchTranslatedArticle(entryId: string, translationLang: TranslationLanguage) {
  const response = await fetch(`${API_BASE_URL}/articles/${entryId}/translations/${translationLang}`);
  return response.json();
}
```

### 8. 语言切换组件

语言切换器需要:

- 显示当前文章的可用翻译语言
- 生成正确的翻译 URL
- 高亮当前语言

```typescript
// 示例: 当前在 ja.detake.com/article/news/example
// 切换到法语: ja.detake.com/fr/article/news/example
// 切换到日语(源语言): ja.detake.com/article/news/example
// 用户文章: ja.detake.com/u/user123/article/news/example
// 切换到法语: ja.detake.com/fr/u/user123/article/news/example
```

## 兼容性考虑

### 旧 URL 重定向

旧的 `/us/...` 和 `/asia/...` URL 应该重定向到新的域名结构,应用层不再保留旧路由:

- `/us/article/...` → `en.detake.com/article/...`
- `/asia/article/...` → `zh.detake.com/article/...`

### 环境变量

```env
# 当前站点的源语言
PUBLIC_SOURCE_LANGUAGE=ja

# 站点域名
PUBLIC_SITE_DOMAIN=ja.detake.com

# API base URL
PUBLIC_API_BASE_URL=https://api-ja.detake.com
```

## 测试场景

1. **源语言文章访问**: `ja.detake.com/article/news/example` → 显示日文源文章
2. **翻译文章访问**: `ja.detake.com/fr/article/news/example` → 显示日文文章的法语翻译
3. **自动跳转**: `ja.detake.com/ja/article/news/example` → 301 重定向到 `ja.detake.com/article/news/example`
4. **功能页访问**: `ja.detake.com/research` → 正常显示,不受翻译路径影响
5. **语言切换**: 从任意语言版本切换到其他可用语言
6. **SEO 标签**: 检查 canonical、hreflang、og:locale 正确性

## 后续扩展

### 功能页全站翻译

未来可以支持 `ja.detake.com/fr/research` 这样的功能页翻译,需要:

1. 扩展路由结构
2. 翻译 UI 文案
3. 调整 API 以返回对应语言的内容列表

### 更多源语言站点

按需添加更多源语言站点,如:

- `ko.detake.com` - 韩文源站点
- `es.detake.com` - 西班牙文源站点
- `ar.detake.com` - 阿拉伯文源站点

每个新站点只需:

1. 配置域名和源语言
2. 部署独立实例
3. 配置独立 API endpoint
