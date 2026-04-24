# 用户文章路由迁移 + is_promoted SEO 控制 — 详细改造方案

> 状态：待评审
> 创建时间：2026-04-24
> 前提：项目未上线，无需考虑旧链接兼容和 301 迁移

---

## 一、改造目标

1. **路由前缀迁移**：用户文章从 `/{userId}/article/...` 改为 `/user/{userId}/article/...`
2. **robots.txt 精准拦截**：新增 `Disallow: /user/` 规则，阻止搜索引擎抓取所有未审核用户文章
3. **is_promoted SEO 分流**：审核通过的文章（`is_promoted: true`）使用公开路径 `/article/...`，可被索引；未审核文章保持 `/user/{userId}/article/...`，不可被索引
4. **页面级 noindex 兜底**：未审核文章在 HTML `<meta>` 层面输出 `noindex, nofollow`
5. **Sitemap 排除**：未审核文章不进入 sitemap；已审核文章以公开 URL 进入 sitemap

---

## 二、改动总览

### 文件影响清单（共 22 个文件）

| # | 文件路径 | 改动类型 | 改动级别 |
|---|---------|---------|---------|
| 1 | `src/types/index.ts` | 新增字段 | P0 |
| 2 | `src/lib/language-utils.ts` | 核心逻辑改造（buildArticleUrl + isTranslationPath） | P0 |
| 3 | `src/pages/user/[userId]/article/[category]/[slug].astro` | **新建**（替代旧路由） | P0 |
| 4 | `src/pages/[translationLang]/user/[userId]/article/[category]/[slug].astro` | **新建**（替代旧路由） | P0 |
| 5 | `src/pages/[userId]/article/[category]/[slug].astro` | **删除** | P0 |
| 6 | `src/pages/[translationLang]/[userId]/article/[category]/[slug].astro` | **删除** | P0 |
| 7 | `src/pages/[translationLang]/article/[category]/[slug].astro` | 移除路由碰撞 hack | P0 |
| 8 | `src/components/article/astro/BaseArticlePage.astro` | 防绕过 + 301 重定向 + robots + props 下传 | P0 |
| 9 | `src/layouts/BaseLayout.astro` | 新增 robotsOverride props | P0 |
| 10 | `src/components/common/react/ArticleLink.tsx` | URL + data attributes 统一改造 | P0 |
| 11 | `src/components/common/astro/ArticleLink.astro` | 同上 | P0 |
| 12 | `src/components/common/astro/ArticleCard.astro` | URL 拼接改造 | P0 |
| 13 | `src/components/author/react/AuthorArticlesSection.tsx` | 同上 | P0 |
| 14 | `src/components/article/astro/ArticleContent.astro` | 新增 isPromoted prop + URL 改造 | P0 |
| 15 | `src/components/article/astro/PodcastContent.astro` | 同上 | P0 |
| 16 | `src/scripts/article-link-manager.js` | URL 前缀 + isPromoted 读取 | P0 |
| 17 | `src/middleware.ts` | 无需改动（依赖 isTranslationPath 已在 #2 中修复） | — |
| 18 | `src/lib/utils.ts` | `getArticleUrl()` 重构 | P1 |
| 19 | `src/utils/seo.ts` | `getCanonicalArticleUrl()` 等重构 | P1 |
| 20 | `src/pages/robots.txt.ts` | 新增 Disallow 规则 | P1 |
| 21 | `src/pages/sitemap-articles.xml.ts` | 排除未审核文章 | P1 |
| 22 | `tests/e2e/recent-research.spec.ts` | URL 路径更新 | P2 |

---

## 三、详细改动说明

### 3.1 类型定义 — 新增 `is_promoted` 字段

**文件**: `src/types/index.ts`

在以下 4 个 interface 中都新增 `is_promoted` 字段：

```ts
// ApiArticle (约 L5-49)
export interface ApiArticle {
  // ... 现有字段 ...
  is_promoted?: boolean; // true = 审核通过，走公开路径；false/undefined = 未审核，走用户路径
}

// HomeLatestArticle (约 L325)
export interface HomeLatestArticle {
  // ... 现有字段 ...
  user_id?: string;      // 同时补上，当前缺失
  is_promoted?: boolean;
}

// HomeNewsArticle (约 L343)
export interface HomeNewsArticle {
  // ... 现有字段 ...
  is_promoted?: boolean; // user_id 已存在
}

// HomeMostReadArticle (约 L367)
export interface HomeMostReadArticle {
  // ... 现有字段 ...
  user_id?: string;      // 同时补上，当前缺失
  is_promoted?: boolean;
}
```

---

### 3.2 核心 URL 生成函数 — `buildArticleUrl()` 改造

**文件**: `src/lib/language-utils.ts`

这是**唯一的 URL source of truth**，所有其他地方必须调用它，不再自行拼接。

#### 改造后签名

```ts
export interface ArticleUrlOptions {
  category: string;
  slug: string;
  sourceLanguage: SourceLanguage;
  translationLanguage?: TranslationLanguage | null;
  userId?: string;
  isPromoted?: boolean;
  promoteCode?: string; // 可选，某些场景需要附加
}

export function buildArticleUrl(options: ArticleUrlOptions): string;

// 同时保留旧签名的兼容重载，避免一次改太多调用点
export function buildArticleUrl(
  category: string,
  slug: string,
  sourceLanguage: SourceLanguage,
  translationLanguage?: TranslationLanguage | null,
  userId?: string,
  isPromoted?: boolean,
): string;
```

#### 核心逻辑

```ts
export function buildArticleUrl(
  categoryOrOptions: string | ArticleUrlOptions,
  slug?: string,
  sourceLanguage?: SourceLanguage,
  translationLanguage?: TranslationLanguage | null,
  userId?: string,
  isPromoted?: boolean,
): string {
  // 参数归一化（支持 object 和 positional 两种调用方式）
  let opts: ArticleUrlOptions;
  if (typeof categoryOrOptions === 'object') {
    opts = categoryOrOptions;
  } else {
    opts = {
      category: categoryOrOptions,
      slug: slug!,
      sourceLanguage: sourceLanguage!,
      translationLanguage: translationLanguage ?? null,
      userId,
      isPromoted,
    };
  }

  // 核心决策：是否使用用户路径前缀
  // promoted 的文章 → 走公开路径（无 /user/{userId}）
  // 未 promoted 且有 userId → 走用户路径（/user/{userId}/article/...）
  const effectiveUserId = (opts.userId && !opts.isPromoted) ? opts.userId : undefined;

  const slugPart = opts.promoteCode ? `${opts.slug}-${opts.promoteCode}` : opts.slug;
  const basePath = effectiveUserId
    ? `/user/${effectiveUserId}/article/${opts.category}/${slugPart}`  // 新路径格式
    : `/article/${opts.category}/${slugPart}`;

  // 翻译版本加语言前缀
  if (opts.translationLanguage && opts.translationLanguage !== opts.sourceLanguage) {
    return `/${opts.translationLanguage}${basePath}`;
  }

  return basePath;
}
```

#### 同步修改 `isNumericUserId()` / `detectFirstPathSegmentType()`

由于用户路由从 `/{userId}/article/...` 变为 `/user/{userId}/article/...`，这两个函数的用途会缩减：

- `isNumericUserId()` — 保留，仍用于验证路由参数
- `detectFirstPathSegmentType()` — 不再需要区分首段是 language 还是 userId，因为用户路由不再占用顶级路径段。但保留函数本身以备其他用途。

#### 移除 `[translationLang]/article/` 路由中的碰撞 hack

当前 `src/pages/[translationLang]/article/[category]/[slug].astro` L21-38 有一段"检查 translationLang 是否为数字 userId"的逻辑，**迁移后这段完全不需要了**，因为 `/user/{userId}/article/...` 永远不会和 `/{translationLang}/article/...` 碰撞。

#### 同步修改 `isTranslationPath()` 和 middleware

**文件**: `src/lib/language-utils.ts` L136-145

当前 `isTranslationPath()` 只匹配 `/{lang}/(article|collections|learn)/` 形态：

```ts
// 当前代码
return /^\/(en|zh|ja|fr|ar|ru|de|es|ko)\/(article|collections|learn)\//.test(pathname);
```

迁移后，翻译版用户文章的路径变为 `/{lang}/user/{userId}/article/...`，这个正则匹配不到，导致 middleware 中的 source-language redirect 规则（`ja.detake.com/ja/user/10/article/...` → `ja.detake.com/user/10/article/...`）不会生效。

**改造**：扩展正则，增加 `user/` 路径支持：

```ts
// 改后
return /^\/(en|zh|ja|fr|ar|ru|de|es|ko)\/(article|collections|learn|user)\//.test(pathname);
```

同时检查 `removeTranslationPrefix()` （L154-162）是否需要同步改。当前实现是移除第一个 `/{lang}` 段：

```ts
export function removeTranslationPrefix(pathname: string): string {
  const translationLang = extractTranslationLanguageFromPath(pathname);
  if (!translationLang) return pathname;
  return pathname.replace(/^\/[a-z]{2}/, '');
}
```

这个实现是通用的（只移除第一段），不依赖后续路径结构，所以 **不需要改**。但要验证：`/ja/user/10/article/news/slug` → 移除 `/ja` → `/user/10/article/news/slug`，是正确的。

**文件**: `src/middleware.ts` L35

middleware 的重定向逻辑本身不需要改，因为它只调用 `isTranslationPath()` → `shouldRedirectToSourceVersion()` → `removeTranslationPrefix()`。只要 `isTranslationPath()` 能正确识别新路径，middleware 就能正常工作。

---

### 3.3 路由文件改造

#### 删除旧路由（2 个文件）

- `src/pages/[userId]/article/[category]/[slug].astro` — **删除**
- `src/pages/[translationLang]/[userId]/article/[category]/[slug].astro` — **删除**

#### 新建路由（2 个文件）

**文件 A**: `src/pages/user/[userId]/article/[category]/[slug].astro`

```astro
---
/**
 * Source language user article route
 * URL pattern: /user/{userId}/article/{category}/{slug}
 * Example: ja.detake.com/user/10/article/news/author-create-cbe4
 */
import BaseArticlePage from '@/components/article/astro/BaseArticlePage.astro';
import type { SourceLanguage } from '@/types';
import { MULTI_SOURCE_CONFIG } from '@/config/constants';
import { getSourceLanguageFromRequest, isNumericUserId } from '@/lib/language-utils';

const { userId, category, slug } = Astro.params as {
  userId: string;
  category: string;
  slug: string;
};

// Validate that userId is numeric
if (!isNumericUserId(userId)) {
  return Astro.redirect('/404');
}

const sourceLanguage: SourceLanguage = getSourceLanguageFromRequest(Astro.request, Astro.url.hostname);
const locale = MULTI_SOURCE_CONFIG.languageToLocale(sourceLanguage);
---

<BaseArticlePage
  locale={locale}
  category={category}
  slug={slug}
  userId={userId}
  sourceLanguage={sourceLanguage}
  translationLanguage={null}
/>
```

**文件 B**: `src/pages/[translationLang]/user/[userId]/article/[category]/[slug].astro`

```astro
---
/**
 * Translated user article route
 * URL pattern: /{translationLang}/user/{userId}/article/{category}/{slug}
 * Example: ja.detake.com/fr/user/10/article/news/author-create-cbe4
 */
import BaseArticlePage from '@/components/article/astro/BaseArticlePage.astro';
import type { SourceLanguage, TranslationLanguage } from '@/types';
import { MULTI_SOURCE_CONFIG } from '@/config/constants';
import { getSourceLanguageFromRequest, isValidTranslationLanguage, isNumericUserId } from '@/lib/language-utils';

const { translationLang, userId, category, slug } = Astro.params as {
  translationLang: string;
  userId: string;
  category: string;
  slug: string;
};

if (!isValidTranslationLanguage(translationLang)) {
  return Astro.redirect('/404');
}

if (!isNumericUserId(userId)) {
  return Astro.redirect('/404');
}

const sourceLanguage: SourceLanguage = getSourceLanguageFromRequest(Astro.request, Astro.url.hostname);
const locale = MULTI_SOURCE_CONFIG.languageToLocale(sourceLanguage);
---

<BaseArticlePage
  locale={locale}
  category={category}
  slug={slug}
  userId={userId}
  sourceLanguage={sourceLanguage}
  translationLanguage={translationLang as TranslationLanguage}
/>
```

#### 简化翻译文章路由

**文件**: `src/pages/[translationLang]/article/[category]/[slug].astro`

移除 L21-38 的 `isNumericUserId(translationLang)` 碰撞检测逻辑，改为：

```astro
---
/**
 * Translated article route (admin/system articles only)
 * URL pattern: /{translationLang}/article/{category}/{slug}
 *
 * No longer needs userId collision detection since user articles
 * now use /user/{userId}/article/... pattern.
 */
import BaseArticlePage from '@/components/article/astro/BaseArticlePage.astro';
import type { SourceLanguage, TranslationLanguage } from '@/types';
import { MULTI_SOURCE_CONFIG } from '@/config/constants';
import { getSourceLanguageFromRequest, isValidTranslationLanguage } from '@/lib/language-utils';

const { translationLang, category, slug } = Astro.params as {
  translationLang: string;
  category: string;
  slug: string;
};

// Pure translation route — no more userId collision possible
if (!isValidTranslationLanguage(translationLang)) {
  return Astro.redirect('/404');
}

const sourceLanguage: SourceLanguage = getSourceLanguageFromRequest(Astro.request, Astro.url.hostname);
const locale = MULTI_SOURCE_CONFIG.languageToLocale(sourceLanguage);
---

<BaseArticlePage
  locale={locale}
  category={category}
  slug={slug}
  sourceLanguage={sourceLanguage}
  translationLanguage={translationLang as TranslationLanguage}
/>
```

---

### 3.4 BaseArticlePage — 防绕过 + 301 重定向 + robots 控制 + props 下传

**文件**: `src/components/article/astro/BaseArticlePage.astro`

#### 3.4.1 防绕过：未审核文章不能通过公开路由访问

> **背景**：即使前端链接都指向 `/user/{userId}/article/...`，用户仍可手动构造 `/article/{category}/{slug}` 访问未审核文章。如果后端 slug-only 查询能返回未审核文章数据，整个 `/user/` + robots + noindex 隔离就被绕过了。

在 L56（拿到 `baseArticle` 之后）插入防绕过检查：

```ts
if (!baseArticle) {
  return Astro.redirect('/404');
}

// --- 新增：防绕过检查 ---
// 如果文章有 user_id 但未 promoted，且当前访问的是公开路由（无 userId 参数），
// 说明用户在尝试通过 /article/... 访问未审核的用户文章 → 拒绝访问
const isPublicRoute = !userId;
const isUnpromotedUserArticle_raw = !!baseArticle.user_id && !baseArticle.is_promoted;
if (isPublicRoute && isUnpromotedUserArticle_raw) {
  // Option A: 重定向到用户路径（暴露 userId，但保持可访问）
  // const userPath = buildArticleUrl(category, actualSlug, sourceLanguage, translationLanguage, baseArticle.user_id, false);
  // return Astro.redirect(userPath, 302);

  // Option B: 直接 404（推荐 — 更安全，不泄露用户路径）
  return Astro.redirect('/404');
}
// --- 结束防绕过检查 ---
```

#### 3.4.2 promoted 文章 301 重定向

```ts
// --- promoted 文章重定向 ---
// 如果文章已 promoted 且当前访问的是用户路径（/user/{userId}/article/...），
// 301 重定向到公开路径（/article/...）
if (baseArticle.is_promoted && userId) {
  const publicPath = buildArticleUrl(
    category,
    actualSlug,         // 不含 promoteCode 的纯 slug
    sourceLanguage,
    translationLanguage,
    undefined,          // 不传 userId → 生成公开路径
    true,               // isPromoted
  );
  return Astro.redirect(publicPath, 301);
}
// --- 结束重定向 ---
```

#### 3.4.3 canonical URL + robots 计算

修改 L98 的 canonical URL 生成：

```ts
// 改前
const articlePath = buildArticleUrl(category, actualSlug, sourceLanguage, translationLanguage, userId);

// 改后
const articlePath = buildArticleUrl(
  category,
  actualSlug,
  sourceLanguage,
  translationLanguage,
  userId,
  article.is_promoted,
);
const canonicalUrl = `${url.origin}${articlePath}`;

// 计算是否为未审核用户文章
const isUnpromotedUserArticle = !!userId && !article.is_promoted;
```

#### 3.4.4 BaseLayout 调用 + isPromoted 传递给子组件

修改 L126 BaseLayout 调用，传入新 props：

```astro
<BaseLayout
  title={title}
  description={description}
  locale={locale}
  canonicalUrl={canonicalUrl}
  ogImage={ogImageUrl}
  ogImageAlt={...}
  ogType="article"
  twitterCard="summary_large_image"
  author={author}
  publishedTime={publishedTime}
  modifiedTime={modifiedTime}
  keywords={keywords}
  articleSection={categoryDisplayName}
  pageLang={articleLang}
  sourceLanguage={sourceLanguage}
  translationLanguage={translationLanguage}
  availableTranslations={isUnpromotedUserArticle ? undefined : availableTranslations}
  robotsOverride={isUnpromotedUserArticle ? 'noindex, nofollow' : undefined}
>
```

**关键：同步修改子组件调用，传入 `isPromoted` prop**（当前 L171-190）：

```astro
{isPodcast ? (
  <PodcastContent
    article={article}
    locale={locale}
    category={category}
    categoryDisplayName={categoryDisplayName}
    slugWithPromote={slugWithPromote}
    articleLang={articleLang}
    userId={userId}
    isPromoted={article.is_promoted}
  />
) : (
  <ArticleContent
    article={article}
    locale={locale}
    category={category}
    categoryDisplayName={categoryDisplayName}
    slugWithPromote={slugWithPromote}
    articleLang={articleLang}
    userId={userId}
    isPromoted={article.is_promoted}
  />
)}
```

> 如果不在这里传 `isPromoted`，ArticleContent / PodcastContent 内部的 `baseArticlePath` 计算就没法区分 promoted 和 unpromoted，语言切换按钮的链接会指错。

---

### 3.5 BaseLayout — 支持页面级 robots 覆盖

**文件**: `src/layouts/BaseLayout.astro`

#### Props 新增

```ts
export interface Props {
  // ... 现有 props ...
  robotsOverride?: string; // 页面级覆盖 robots meta（如 'noindex, nofollow'）
}
```

#### robotsContent 计算（约 L109）

```ts
// 改前
const robotsContent = isProductionSite
  ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  : 'noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

// 改后
const robotsContent = Astro.props.robotsOverride
  || (isProductionSite
    ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
```

#### hreflang 控制（约 L114）

当 `robotsOverride` 包含 `noindex` 时，不输出 hreflang alternates，避免暴露翻译版入口：

```ts
// 改前
const hreflangAlternates = sourceLanguage && availableTranslations
  ? generateHreflangAlternates(Astro.url, sourceLanguage, availableTranslations)
  : null;

// 改后
const shouldSuppressHreflang = Astro.props.robotsOverride?.includes('noindex');
const hreflangAlternates = (sourceLanguage && availableTranslations && !shouldSuppressHreflang)
  ? generateHreflangAlternates(Astro.url, sourceLanguage, availableTranslations)
  : null;
```

---

### 3.6 所有 URL 拼接点统一改造

所有散落的 URL 拼接逻辑统一调用 `buildArticleUrl()`，不再自行拼字符串。

#### 3.6.1 `ArticleLink.tsx`（React 客户端组件）

**文件**: `src/components/common/react/ArticleLink.tsx`

**问题**：客户端组件无法直接调用 `buildArticleUrl()`（它需要 `sourceLanguage`），且需要从 `localStorage` 读取 `promoteCode`。

**方案**：提取一个纯函数 `buildClientArticleUrl()`，复用相同的路径逻辑：

```tsx
interface ArticleLinkProps {
  slug: string;
  locale: Locale;
  business: string;
  userId?: string;
  isPromoted?: boolean;  // 新增
  article?: any;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const ArticleLink: React.FC<ArticleLinkProps> = ({
  slug, locale, business, userId, isPromoted, article, children, className = '', onClick
}) => {
  const getArticleUrl = (slug: string) => {
    const promoteCode = (typeof window !== 'undefined'
      ? localStorage.getItem('promote_code')
      : null) || DEFAULT_PROMOTE_CODE;
    const businessPath = business.toLowerCase();

    // Determine userId from multiple sources
    let finalUserId = userId;
    if (!finalUserId && article) {
      if (article.user_id) finalUserId = article.user_id;
      else if (article.author?.role === 'Authors' && article.author?.id) {
        finalUserId = article.author.id;
      }
    }

    // Determine promoted status
    const finalIsPromoted = isPromoted ?? article?.is_promoted ?? false;

    // promoted → public path; unpromoted with userId → /user/{userId}/...
    if (finalUserId && !finalIsPromoted) {
      return `/user/${finalUserId}/article/${businessPath}/${slug}-${promoteCode}`;
    }
    return `/article/${businessPath}/${slug}-${promoteCode}`;
  };

  // ...
};
```

#### 3.6.2 `ArticleLink.astro`（Astro 服务端组件）

**文件**: `src/components/common/astro/ArticleLink.astro`

同样的改造思路，新增 `isPromoted` prop，URL 拼接时加 `/user/` 前缀：

```ts
interface Props {
  slug: string;
  locale: Locale;
  business: string;
  userId?: string;
  isPromoted?: boolean;  // 新增
  article?: any;
  // ...
}

// getArticleUrl 内部改造
if (finalUserId && !finalIsPromoted) {
  return `/user/${finalUserId}/article/${businessPath}/${slug}-${promoteCode}`;
}
return `/article/${businessPath}/${slug}-${promoteCode}`;
```

#### 3.6.3 `ArticleCard.astro`

**文件**: `src/components/common/astro/ArticleCard.astro`

L77-97 的 `getArticleUrl()` 改造：

```ts
function getArticleUrl(article: any, locale: Locale): string {
  if (article.url) return article.url;
  if (article.slug) {
    const businessSegment = getArticleBusinessPath(article);

    let userId = article.user_id;
    if (!userId && article.author?.role === 'Authors' && article.author?.id) {
      userId = article.author.id;
    }

    const isPromoted = article.is_promoted ?? false;

    // promoted → public path; unpromoted with userId → /user/{userId}/...
    if (userId && !isPromoted) {
      return `/user/${userId}/article/${businessSegment}/${article.slug}-${promoteCode}`;
    }
    return `/article/${businessSegment}/${article.slug}-${promoteCode}`;
  }
  return '#';
}
```

#### 3.6.4 `AuthorArticlesSection.tsx`

**文件**: `src/components/author/react/AuthorArticlesSection.tsx`

L56-71 的 `getArticleUrl()` 改造：

```ts
const getArticleUrl = (): string => {
  const businessPath = getArticleBusinessPath(article);

  let userId = article.user_id;
  if (!userId && article.author?.role === 'Authors' && article.author?.id) {
    userId = article.author.id;
  }

  const isPromoted = article.is_promoted ?? false;

  if (userId && !isPromoted) {
    return `/user/${userId}/article/${businessPath}/${article.slug}`;
  }
  return `/article/${businessPath}/${article.slug}`;
};
```

#### 3.6.5 `ArticleContent.astro`

**文件**: `src/components/article/astro/ArticleContent.astro`

L45-49 的 `baseArticlePath` 改造。需要新增 `isPromoted` prop（从 BaseArticlePage 传入）：

```ts
interface Props {
  article: ApiArticle;
  // ... 现有 props ...
  userId?: string;
  isPromoted?: boolean;  // 新增
}

const baseArticlePath = collection
  ? `/collections/${collection.id}/${slugWithPromote}`
  : (userId && !isPromoted)
    ? `/user/${userId}/article/${category.toLowerCase()}/${slugWithPromote}`
    : `/article/${category.toLowerCase()}/${slugWithPromote}`;
```

#### 3.6.6 `PodcastContent.astro`

**文件**: `src/components/article/astro/PodcastContent.astro`

L31-33 同理改造，新增 `isPromoted` prop：

```ts
interface Props {
  // ... 现有 props ...
  userId?: string;
  isPromoted?: boolean;  // 新增
}

const baseArticlePath = (userId && !isPromoted)
  ? `/user/${userId}/article/${category.toLowerCase()}/${slugWithPromote}`
  : `/article/${category.toLowerCase()}/${slugWithPromote}`;
```

#### 3.6.7 `article-link-manager.js`

**文件**: `src/scripts/article-link-manager.js`

##### 问题：`data-author-id` 和实际使用的 userId 不一致

当前 ArticleLink 组件存在一个 bug：`getArticleUrl()` 内部会从 `article.user_id` 或 `article.author.id` 推导 `finalUserId`，但 `<a>` 标签上的 `data-author-id` 只写了 props 传入的 `userId`。如果 props 没传 `userId` 但 `article` 对象上有 `user_id`，DOM 上的 `data-author-id` 就是空的/undefined，`article-link-manager.js` 拿不到正确的 authorId，会把用户文章链接错误地改成公开路径。

##### 改造方案

**ArticleLink.tsx** — `<a>` 标签的 data attributes 必须写入**推导后的最终值**：

```tsx
const ArticleLink: React.FC<ArticleLinkProps> = ({
  slug, locale, business, userId, isPromoted, article, children, className = '', onClick
}) => {
  // Resolve final values ONCE, used for both URL and data attributes
  let finalUserId = userId;
  if (!finalUserId && article) {
    if (article.user_id) finalUserId = article.user_id;
    else if (article.author?.role === 'Authors' && article.author?.id) {
      finalUserId = article.author.id;
    }
  }
  const finalIsPromoted = isPromoted ?? article?.is_promoted ?? false;

  const getArticleUrl = (slug: string) => {
    const promoteCode = (typeof window !== 'undefined'
      ? localStorage.getItem('promote_code')
      : null) || DEFAULT_PROMOTE_CODE;
    const businessPath = business.toLowerCase();

    if (finalUserId && !finalIsPromoted) {
      return `/user/${finalUserId}/article/${businessPath}/${slug}-${promoteCode}`;
    }
    return `/article/${businessPath}/${slug}-${promoteCode}`;
  };

  const articleUrl = getArticleUrl(slug);

  return (
    <a
      href={articleUrl}
      className={`hover:text-primary transition-colors ${className}`}
      onClick={onClick}
      data-article-link="true"
      data-slug={slug}
      data-locale={locale}
      data-business={business.toLowerCase()}
      data-author-id={finalUserId || ''}
      data-is-promoted={String(finalIsPromoted)}
    >
      {children}
    </a>
  );
};
```

**ArticleLink.astro** — 同样的改造，确保 `data-author-id` 写入推导后的 `finalUserId`：

```astro
<a
  href={articleUrl}
  class={`hover:text-primary transition-colors ${className}`}
  onclick={onClick}
  data-article-link="true"
  data-slug={slug}
  data-locale={locale}
  data-business={business.toLowerCase()}
  data-author-id={finalUserId || ''}
  data-is-promoted={String(finalIsPromoted)}
>
  <slot />
</a>
```

**article-link-manager.js** — L64-69 改造：

```js
// 改前
const authorId = link.dataset.authorId;
const prefix = authorId ? `/${authorId}/article` : `/article`;

// 改后
const authorId = link.dataset.authorId;
const isPromoted = link.dataset.isPromoted === 'true';
const prefix = (authorId && !isPromoted) ? `/user/${authorId}/article` : `/article`;
```

这样 DOM → JS 的数据传递链路完整：组件推导 `finalUserId` + `finalIsPromoted` → 写入 data attributes → `article-link-manager.js` 从 data attributes 读取 → 正确构建 URL。

---

### 3.7 `src/lib/utils.ts` — `getArticleUrl()` 重构

**文件**: `src/lib/utils.ts`

L43-59 改造：

```ts
export const getArticleUrl = (
  slug: string,
  locale: string,
  business: string = 'news',
  userId?: string,
  promoteCode?: string,
  isPromoted?: boolean,
) => {
  const finalPromoteCode = promoteCode || DEFAULT_PROMOTE_CODE;
  const businessPath = business.toLowerCase();

  if (userId && !isPromoted) {
    return `/user/${userId}/article/${businessPath}/${slug}-${finalPromoteCode}`;
  }
  return `/article/${businessPath}/${slug}-${finalPromoteCode}`;
};
```

---

### 3.8 `src/utils/seo.ts` — SEO 工具函数重构

**文件**: `src/utils/seo.ts`

所有接受 `userId` 参数的函数同步新增 `isPromoted` 参数：

```ts
// getCanonicalArticleUrl
export function getCanonicalArticleUrl(
  slug: string,
  locale: Locale,
  category: string = 'news',
  promoteCode?: string,
  userId?: string,
  isPromoted?: boolean,  // 新增
): string {
  const normalizedCategory = category.toLowerCase();
  const normalizedSlug = promoteCode ? `${slug}-${promoteCode}` : slug;

  if (userId && !isPromoted) {
    return `/user/${userId}/article/${normalizedCategory}/${normalizedSlug}`;
  }
  return `/article/${normalizedCategory}/${normalizedSlug}`;
}
```

`generateArticleStructuredData()`、`generateArticleMetaTags()`、`generateSitemapEntry()`、`generateAlternateLinks()` 的入参 article 类型中同步新增 `is_promoted?: boolean`，内部调用 `getCanonicalArticleUrl()` 时传入。

---

### 3.9 robots.txt — 新增 Disallow 规则

**文件**: `src/pages/robots.txt.ts`

在生产环境 robots 规则中（L36-60）新增一行：

```ts
return [
  '# DeTake Website - Robots.txt',
  '# Allow all crawlers to access the production site',
  '',
  'User-agent: *',
  'Allow: /',
  '',
  '# Block user article directory (unpromoted content)',
  '# Source language: /user/{userId}/article/...',
  'Disallow: /user/',
  '# Translated versions: /{lang}/user/{userId}/article/...',
  'Disallow: /*/user/',
  '',
  '# Sitemap location',
  `Sitemap: ${sitemapUrl}`,
  `Sitemap: ${sitemapArticlesUrl}`,
  `Sitemap: https://${host}/sitemap-categories.xml`,
  '',
].join('\n');
```

两条规则配合覆盖所有未审核用户文章路径：
- `Disallow: /user/` — 匹配 `/user/{userId}/article/...`（源语言版本）
- `Disallow: /*/user/` — 匹配 `/{lang}/user/{userId}/article/...`（翻译版本，如 `/fr/user/10/article/...`）

不会误伤其他路径，因为只有用户文章路由包含 `/user/` 段。

---

### 3.10 Sitemap — 排除未审核文章

**文件**: `src/pages/sitemap-articles.xml.ts`

在 L48 遍历首页文章时，增加过滤逻辑：

```ts
for (const article of allHomeArticles) {
  const userId = (article as any).user_id;
  const isPromoted = (article as any).is_promoted;

  // Skip unpromoted user articles — they should not appear in sitemap
  if (userId && !isPromoted) continue;

  const category = getArticleBusinessPath(article as any);
  const createdAt = (article as any).created_at || nowIso;

  // promoted user articles → use public URL (no userId prefix)
  const entry = generateSitemapEntry(
    {
      slug: (article as any).slug,
      created_at: createdAt,
      category,
      // promoted → don't pass user_id so URL is public format
      user_id: isPromoted ? undefined : userId,
      is_promoted: isPromoted,
    },
    locale,
    baseUrl,
  );

  addEntry(entry.url, entry.lastmod);
  // ... alternates ...
}
```

---

### 3.11 E2E 测试更新

**文件**: `tests/e2e/recent-research.spec.ts`

L27-29 更新 URL 构建：

```ts
// 改前
return article.user_id
  ? `/${article.user_id}/article/${businessPath}/${article.slug}-${DEFAULT_PROMOTE_CODE}`
  : `/article/${businessPath}/${article.slug}-${DEFAULT_PROMOTE_CODE}`;

// 改后
return (article.user_id && !article.is_promoted)
  ? `/user/${article.user_id}/article/${businessPath}/${article.slug}-${DEFAULT_PROMOTE_CODE}`
  : `/article/${businessPath}/${article.slug}-${DEFAULT_PROMOTE_CODE}`;
```

---

## 四、URL 路由对照表

| 场景 | 旧路由 | 新路由 |
|------|--------|--------|
| 用户文章（未审核） | `/{userId}/article/{category}/{slug}` | `/user/{userId}/article/{category}/{slug}` |
| 用户文章（已审核） | `/{userId}/article/{category}/{slug}` | `/article/{category}/{slug}`（公开路径） |
| 翻译版用户文章（未审核） | `/{lang}/{userId}/article/{category}/{slug}` | `/{lang}/user/{userId}/article/{category}/{slug}` |
| 翻译版用户文章（已审核） | `/{lang}/{userId}/article/{category}/{slug}` | `/{lang}/article/{category}/{slug}` |
| 系统文章 | `/article/{category}/{slug}` | 不变 |
| 翻译版系统文章 | `/{lang}/article/{category}/{slug}` | 不变 |

---

## 五、SEO 三层防护机制

| 层级 | 机制 | 作用 | 覆盖范围 |
|------|------|------|---------|
| **L1 — robots.txt** | `Disallow: /user/` + `Disallow: /*/user/` | 阻止爬虫访问源语言和翻译版 `/user/` 路径 | 所有未审核用户文章（含翻译版） |
| **L2 — 页面 meta** | `<meta name="robots" content="noindex, nofollow">` | 即使爬虫绕过 L1，也不索引 | 未审核文章详情页 |
| **L3 — Sitemap** | 不包含未审核文章 URL | 不主动向搜索引擎提交 | sitemap 级别 |

> **注意**：L1 和 L2 在同一 URL 上不矛盾。robots.txt 阻止爬虫访问 `/user/` 路径，爬虫不会看到页面内容。但如果某些爬虫不遵守 robots.txt（如社交媒体爬虫），页面级 `noindex` 作为兜底。当文章 promoted 后，URL 变为 `/article/...`，不在 `/user/` 下，三层防护自动解除。

---

## 六、数据流全景

```
用户发布文章
  → 后端存储，is_promoted = false
  → 前端生成 URL: /user/{userId}/article/{category}/{slug}
  → robots.txt Disallow: /user/ 阻止爬虫
  → 页面输出 noindex, nofollow
  → Sitemap 不包含此文章

审核通过
  → 后端设置 is_promoted = true
  → 所有 API 接口返回 is_promoted: true
  → 前端生成 URL: /article/{category}/{slug}（公开路径）
  → 如果用户访问旧的 /user/{userId}/article/... 路径
    → BaseArticlePage 检测到 is_promoted && userId
    → 301 重定向到 /article/{category}/{slug}
  → robots.txt 不拦截 /article/ 路径
  → 页面输出 index, follow
  → Sitemap 包含此文章的公开 URL
```

---

## 七、后端前置条件（已确认 ✅）

### 确认项 1：promoted 文章的 API 查询 ✅

当文章 `is_promoted = true` 后，调用 `/api/v1/articles/info?slug={slug}` （不传 `user_id`）能正常返回文章数据。公开路由 `/article/{category}/{slug}` 可正常工作。

### 确认项 2：所有列表接口返回 `is_promoted` ✅

以下接口的响应中均包含 `is_promoted` 字段：

- 首页数据接口（`fetchHomePageData`）
- 文章列表接口（`fetchArticles`）
- 文章详情接口（`fetchArticle`）
- 作者文章列表接口

---

## 八、执行顺序

```
Phase 1 — 基础设施（无可见变化）
  ├── 1.1 types/index.ts 加 is_promoted 字段
  ├── 1.2 language-utils.ts 改造 buildArticleUrl()
  ├── 1.3 lib/utils.ts 改造 getArticleUrl()
  └── 1.4 utils/seo.ts 改造所有 URL 函数

Phase 2 — 路由迁移
  ├── 2.1 新建 src/pages/user/[userId]/article/[category]/[slug].astro
  ├── 2.2 新建 src/pages/[translationLang]/user/[userId]/article/[category]/[slug].astro
  ├── 2.3 删除旧路由文件（2 个）
  └── 2.4 简化 [translationLang]/article/ 路由（移除碰撞 hack）

Phase 3 — 组件适配（所有链接指向新路径）
  ├── 3.1 ArticleLink.tsx — 加 isPromoted + /user/ 前缀
  ├── 3.2 ArticleLink.astro — 同上
  ├── 3.3 ArticleCard.astro — 同上
  ├── 3.4 AuthorArticlesSection.tsx — 同上
  ├── 3.5 ArticleContent.astro — 同上
  ├── 3.6 PodcastContent.astro — 同上
  └── 3.7 article-link-manager.js — 同上

Phase 4 — SEO 控制
  ├── 4.1 BaseArticlePage.astro — 301 重定向 + isUnpromotedUserArticle 计算
  ├── 4.2 BaseLayout.astro — robotsOverride + hreflang 控制
  ├── 4.3 robots.txt.ts — 新增 Disallow: /user/
  └── 4.4 sitemap-articles.xml.ts — 过滤未审核文章

Phase 5 — 测试与清理
  ├── 5.1 E2E 测试 URL 更新
  ├── 5.2 pnpm type-check 确保 0 错误
  ├── 5.3 pnpm build 确保构建通过
  └── 5.4 浏览器验证所有文章链接指向正确
```

---

## 九、风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 后端 promoted 文章不支持无 user_id 查询 | 中 | 高（公开路由 404） | **已确认**：后端支持 ✅ |
| 未审核文章通过公开路由 `/article/...` 被访问（绕过隔离） | 高 | 高 | 3.4.1 防绕过检查：公开路由 + 未审核 user_id → 返回 404 |
| middleware source-language redirect 对新路径不生效 | 高 | 中 | 3.2 扩展 `isTranslationPath()` 正则匹配 `/user/` |
| data-author-id 与实际 userId 不一致导致客户端链接错误 | 高 | 中 | 3.6.7 ArticleLink 写入推导后的 `finalUserId` 到 DOM |
| ArticleContent/PodcastContent 缺少 isPromoted 导致语言切换链接错误 | 高 | 中 | 3.4.4 BaseArticlePage 明确传入 `isPromoted={article.is_promoted}` |
| 遗漏 URL 拼接点 | 低 | 中 | 全局搜索 `/${` + `article` 模式验证 |
| Astro 路由优先级变化 | 低 | 中 | `/user/` 是静态段，不会和 `[translationLang]` 碰撞 |
| article-link-manager.js 客户端缓存旧 URL | 低 | 低 | 同步更新 data attributes |
