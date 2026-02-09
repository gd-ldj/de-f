# 多源站点架构迁移指南

本文档说明如何从旧的地区站点架构 (`/us`, `/asia`) 迁移到新的多源站点架构。最终方案中不再保留旧 `[locale]` 路由,通过域名表达源语言,路径表达翻译语言。

## 概览

### 旧架构 (地区站点)
- URL格式: `detake.com/{locale}/article/...` 其中 `locale` 为 `us` 或 `asia`
- 语言切换: 使用 `?lang=en|zh|ar|ru|ja` 参数
- 数据: 所有地区共享同一套数据

### 新架构 (多源站点)
- URL格式: `{lang}.detake.com/article/...` (源语言) 或 `{lang}.detake.com/{translationLang}/article/...` (翻译版本)
- 用户文章: `{lang}.detake.com/u/{userId}/article/...` 或 `{lang}.detake.com/{translationLang}/u/{userId}/article/...`
- 功能页: 统一为 `{lang}.detake.com/...` 无 `/locale` 前缀
- 语言切换: 通过URL路径实现,如 `/fr/article/...`
- 数据: 每个源语言站点数据完全独立

## 主要变更

### 1. URL结构变更

#### 文章URL

**旧URL:**
```
https://detake.com/us/article/news/crypto-regulation
https://detake.com/asia/article/news/crypto-regulation?lang=zh
```

**新URL:**
```
# 英文源站点
https://en.detake.com/article/news/crypto-regulation

# 中文源站点
https://zh.detake.com/article/news/crypto-regulation

# 日文源站点 + 法语翻译
https://ja.detake.com/fr/article/news/crypto-regulation
```

#### Collection URL

**旧URL:**
```
https://detake.com/us/collections/123/crypto-market
https://detake.com/asia/collections/123/crypto-market?lang=zh
```

**新URL:**
```
# 英文源站点
https://en.detake.com/collections/123/crypto-market

# 日文源站点 + 英文翻译
https://ja.detake.com/en/collections/123/crypto-market
```

### 2. 类型系统变更

#### 新增类型

```typescript
// 源语言 (站点级别)
type SourceLanguage = 'en' | 'zh' | 'ja'

// 翻译语言 (内容级别)
type TranslationLanguage = 'en' | 'zh' | 'ja' | 'fr' | 'ar' | 'ru' | 'de' | 'es' | 'ko'

// 所有支持的语言
type SupportedLanguage = TranslationLanguage
```

#### 弃用类型

```typescript
// @deprecated 保留用于向后兼容
type Locale = 'us' | 'asia'
```

### 3. 路由结构变更

#### 新路由文件

创建了以下新路由:

**源语言文章路由 (不带语言前缀):**
- `src/pages/article/[category]/[slug].astro`
- `src/pages/u/[userId]/article/[category]/[slug].astro`

**翻译文章路由 (带语言前缀):**
- `src/pages/[translationLang]/article/[category]/[slug].astro`
- `src/pages/[translationLang]/u/[userId]/article/[category]/[slug].astro`

**Collection路由:**
- `src/pages/collections/[collectionId]/[slug].astro`
- `src/pages/[translationLang]/collections/[collectionId]/[slug].astro`

#### 旧路由处理

旧路由不再保留在应用层,统一通过服务器或中间件做 301 重定向。

### 4. 配置变更

#### 环境变量

需要添加新的环境变量:

```env
# 当前站点的源语言 (必需)
PUBLIC_SOURCE_LANGUAGE=ja

# 示例:
# - 英文源站点: PUBLIC_SOURCE_LANGUAGE=en
# - 中文源站点: PUBLIC_SOURCE_LANGUAGE=zh
# - 日文源站点: PUBLIC_SOURCE_LANGUAGE=ja
```

#### 配置文件

更新了 `src/config/constants.ts`,新增 `MULTI_SOURCE_CONFIG`:

```typescript
import { MULTI_SOURCE_CONFIG } from '@/config/constants'

// 从域名获取源语言
const sourceLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(hostname)

// 旧 Locale 仅用于重定向映射,新架构不再依赖
```

### 5. 组件变更

#### BaseArticlePage

新增必需参数:

```typescript
interface Props {
  category: string
  slug: string
  userId?: string
  sourceLanguage: SourceLanguage
  translationLanguage: TranslationLanguage | null
}
```

#### BaseLayout

新增可选参数用于SEO:

```typescript
interface Props {
  // ... 其他原有参数
  sourceLanguage?: SourceLanguage
  translationLanguage?: TranslationLanguage | null
  availableTranslations?: TranslationLanguage[]
}
```

### 6. 中间件变更

新增语言重定向中间件,自动处理以下情况:

```typescript
// 如果URL中的语言前缀与源语言相同,自动重定向到无前缀版本
// 示例:
ja.detake.com/ja/article/... → ja.detake.com/article/... (301)
en.detake.com/en/article/... → en.detake.com/article/... (301)
```

### 7. SEO变更

#### Canonical URL

**旧:**
```html
<link rel="canonical" href="https://detake.com/us/article/news/example" />
```

**新:**
```html
<!-- 源语言版本 -->
<link rel="canonical" href="https://ja.detake.com/article/news/example" />

<!-- 翻译版本 -->
<link rel="canonical" href="https://ja.detake.com/fr/article/news/example" />
```

#### Hreflang标签

**旧:**
```html
<link rel="alternate" hreflang="en-US" href="..." />
<link rel="alternate" hreflang="zh-CN" href="..." />
```

**新:**
```html
<link rel="alternate" hreflang="x-default" href="https://ja.detake.com/article/news/example" />
<link rel="alternate" hreflang="ja" href="https://ja.detake.com/article/news/example" />
<link rel="alternate" hreflang="en" href="https://ja.detake.com/en/article/news/example" />
<link rel="alternate" hreflang="fr" href="https://ja.detake.com/fr/article/news/example" />
```

## 迁移步骤

### 1. 环境准备

1. 为每个源语言站点配置独立的部署环境
2. 设置 `PUBLIC_SOURCE_LANGUAGE` 环境变量
3. 配置域名 (如 `ja.detake.com`, `en.detake.com`, `zh.detake.com`)

### 2. 数据迁移

1. 将现有数据按源语言分割到不同的数据库/API
2. 确保每个源站点的API endpoint正确配置
3. 测试翻译API的调用

### 3. URL重定向

配置服务器级重定向规则:

```nginx
# 示例: 将旧的 /us/ URL 重定向到英文源站点
location ~* ^/us/(.*)$ {
  return 301 https://en.detake.com/$1;
}

# 将旧的 /asia/ URL 重定向到中文源站点
location ~* ^/asia/(.*)$ {
  return 301 https://zh.detake.com/$1;
}
```

### 4. 功能测试

测试以下场景:

1. **源语言文章访问**
   - 访问 `ja.detake.com/article/news/example`
   - 验证显示日文源文章

2. **翻译文章访问**
   - 访问 `ja.detake.com/fr/article/news/example`
   - 验证显示日文文章的法语翻译

3. **自动重定向**
   - 访问 `ja.detake.com/ja/article/news/example`
   - 验证301重定向到 `ja.detake.com/article/news/example`

4. **用户文章访问**
   - 访问 `ja.detake.com/u/user123/article/news/example`
   - 验证显示日文源用户文章

5. **用户文章翻译**
   - 访问 `ja.detake.com/fr/u/user123/article/news/example`
   - 验证显示法语翻译用户文章

6. **SEO标签**
   - 检查 canonical URL 正确性
   - 检查 hreflang 标签完整性
   - 验证 Open Graph 标签

5. **语言切换**
   - 测试从任意语言版本切换到其他可用语言
   - 验证URL正确更新

### 5. 向后兼容性验证

1. 旧的 `/us/` 和 `/asia/` URL 应该重定向到新域名
2. 带 `?lang=` 参数的URL应该重定向到新的路径格式
3. 外部链接和书签应该能正常工作

## 工具函数

### 语言检测和URL生成

```typescript
import {
  getSourceLanguageFromUrl,
  buildArticleUrl,
  buildCollectionUrl,
  generateHreflangAlternates,
} from '@/lib/language-utils'

// 从URL获取源语言
const sourceLanguage = getSourceLanguageFromUrl(url)

// 生成文章URL
const articleUrl = buildArticleUrl(
  'news',
  'crypto-regulation',
  'ja',  // 源语言
  'fr'   // 翻译语言 (可选)
)

// 生成Collection URL
const collectionUrl = buildCollectionUrl(
  '123',
  'crypto-market',
  'ja',  // 源语言
  'en'   // 翻译语言 (可选)
)

// 生成hreflang alternates
const alternates = generateHreflangAlternates(
  url,
  'ja',  // 源语言
  ['en', 'zh', 'fr', 'ar']  // 可用翻译
)
```

## 故障排查

### 问题: 路由冲突警告

**症状:**
```
[WARN] [router] The route "/[locale]/article/[category]/[slug]" is defined in both...
```

**原因:** 新旧路由共存导致

**解决方案:**
1. 这是预期行为,不影响功能
2. 确认迁移完成后,删除旧的 `[locale]` 路由文件

### 问题: 中间件重定向循环

**症状:** 页面无限重定向

**原因:** 中间件配置错误或路由匹配问题

**解决方案:**
1. 检查 `src/middleware.ts` 中的重定向逻辑
2. 确保 `isTranslationPath()` 正确识别翻译路径
3. 验证源语言配置正确

### 问题: 翻译内容无法显示

**症状:** 访问翻译URL时显示源语言内容

**原因:** API调用或语言参数传递错误

**解决方案:**
1. 检查 `fetchTranslatedArticle()` API调用
2. 验证 `translationLanguage` 参数正确传递到组件
3. 查看浏览器控制台和网络请求

## 后续工作

### 短期

1. 监控新架构性能和错误率
2. 收集用户反馈
3. 优化SEO表现

### 中期

1. 删除旧的 `[locale]` 路由文件
2. 移除 `Locale` 类型的使用
3. 清理向后兼容代码

### 长期

1. 扩展到更多源语言站点 (韩语、西班牙语等)
2. 实现功能页的全站翻译
3. 优化语言切换体验

## 参考文档

- [多源站点架构设计](/docs/MULTI_SOURCE_SITE_ARCHITECTURE.md)
- [CLAUDE.md 项目规范](/CLAUDE.md)
