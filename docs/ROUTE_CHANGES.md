# 路由结构变更说明

## 概览

本文档说明在清理旧路由后的最终路由结构。所有旧的 `[locale]` 路由在应用层已移除,统一通过服务器或中间件进行 301 重定向。

## 最终路由结构

### 文章路由 (Article Routes)

#### 普通文章

**源语言版本:**
```
/article/[category]/[slug]
示例: ja.detake.com/article/news/crypto-regulation
```

**翻译版本:**
```
/[translationLang]/article/[category]/[slug]
示例: ja.detake.com/fr/article/news/crypto-regulation
```

#### 用户文章 (使用 `/u/` 前缀)

**源语言版本:**
```
/u/[userId]/article/[category]/[slug]
示例: ja.detake.com/u/user123/article/news/my-analysis
```

**翻译版本:**
```
/[translationLang]/u/[userId]/article/[category]/[slug]
示例: ja.detake.com/fr/u/user123/article/news/my-analysis
```

**重要:** 用户文章路由使用 `/u/` 前缀以避免与翻译语言路由冲突。这确保了 `/fr/article/...` 明确是法语翻译,而 `/u/someuser/article/...` 是用户文章。

### Collection 路由

**源语言版本:**
```
/collections/[collectionId]/[slug]
示例: ja.detake.com/collections/123/crypto-market
```

**翻译版本:**
```
/[translationLang]/collections/[collectionId]/[slug]
示例: ja.detake.com/fr/collections/123/crypto-market
```

**Collection 列表:**
```
/collections
示例: ja.detake.com/collections
```

### 功能页路由 (无 locale 结构)

以下功能页使用源语言域名,不带 `/locale` 前缀:

**主页:**
```
/
示例: ja.detake.com/
```

**分类页:**
```
/[category]
示例: ja.detake.com/research
```

**Topic 页:**
```
/topics/[topic]
示例: ja.detake.com/topics/bitcoin
```

**作者页:**
```
/authors/[authorName]
示例: ja.detake.com/authors/john-doe
```

**教程页:**
```
/tutorials
/tutorials/[slug]
```

## 已删除的路由

以下旧路由已被移除,仅保留重定向:

1. ❌ `/[locale]/article/[category]/[slug]`
2. ❌ `/[locale]/[userId]/article/[category]/[slug]`
3. ❌ `/[locale]/collections/[collectionId]/[slug]`
4. ❌ `/[locale]/collections`
5. ❌ `/[locale]/[category]`
6. ❌ `/[locale]/topics/[topic]`
7. ❌ `/[locale]/authors/[authorName]`
8. ❌ `/[locale]/tutorials`
9. ❌ `/[locale]/tutorials/[slug]`

## URL 示例对比

### 普通文章

| 场景 | 旧URL | 新URL |
|------|-------|-------|
| 英文站英文文章 | `/us/article/news/example` | `en.detake.com/article/news/example` |
| 英文站中文翻译 | `/us/article/news/example?lang=zh` | `en.detake.com/zh/article/news/example` |
| 日文站法语翻译 | `/us/article/news/example?lang=fr` | `ja.detake.com/fr/article/news/example` |

### 用户文章

| 场景 | 旧URL | 新URL |
|------|-------|-------|
| 用户文章(源语言) | `/us/user123/article/news/example` | `en.detake.com/u/user123/article/news/example` |
| 用户文章(翻译) | `/us/user123/article/news/example?lang=zh` | `en.detake.com/zh/u/user123/article/news/example` |

### Collection

| 场景 | 旧URL | 新URL |
|------|-------|-------|
| Collection(源语言) | `/us/collections/123/example` | `en.detake.com/collections/123/example` |
| Collection(翻译) | `/us/collections/123/example?lang=zh` | `en.detake.com/zh/collections/123/example` |

## 中间件自动重定向

中间件会自动处理以下重定向:

```
ja.detake.com/ja/article/... → ja.detake.com/article/... (301)
ja.detake.com/ja/u/user123/article/... → ja.detake.com/u/user123/article/... (301)
ja.detake.com/ja/collections/... → ja.detake.com/collections/... (301)
```

## 路由优先级

Astro 按以下顺序匹配路由:

1. **静态路由** (如 `/article`)
2. **命名动态路由** (如 `/article/[category]/[slug]`)
3. **Rest 参数路由** (如 `/[...slug]`)

由于使用了 `/u/` 前缀,用户文章路由与翻译语言路由不会冲突:
- `/fr/article/...` → 翻译路由
- `/u/user123/article/...` → 用户文章路由

## 代码更新要点

### 1. 链接生成

使用工具函数生成链接:

```typescript
import { buildArticleUrl } from '@/lib/language-utils'

// 普通文章
const url = buildArticleUrl('news', 'example', 'ja', 'fr')
// 结果: /fr/article/news/example

// 用户文章
const userUrl = buildArticleUrl('news', 'example', 'ja', null, 'user123')
// 结果: /u/user123/article/news/example
```

### 2. ArticleContent 组件

更新文章内链接生成逻辑以支持 `/u/` 前缀:

```typescript
const baseArticlePath = userId
  ? `/u/${userId}/article/${category.toLowerCase()}/${slugWithPromote}`
  : `/article/${category.toLowerCase()}/${slugWithPromote}`
```

### 3. 语言切换

语言切换器需要处理 `/u/` 前缀:

```typescript
// 从 /u/user123/article/news/example
// 切换到法语: /fr/u/user123/article/news/example
```

## 测试检查清单

- [ ] 访问 `/article/news/example` 显示源语言文章
- [ ] 访问 `/fr/article/news/example` 显示法语翻译
- [ ] 访问 `/ja/article/news/example` (源语言是ja) 自动重定向到 `/article/news/example`
- [ ] 访问 `/u/user123/article/news/example` 显示用户文章
- [ ] 访问 `/fr/u/user123/article/news/example` 显示用户文章的法语翻译
- [ ] 访问 `/collections/123/example` 显示源语言Collection
- [ ] 访问 `/fr/collections/123/example` 显示法语翻译Collection
- [ ] 语言切换功能正常工作
- [ ] SEO标签(canonical, hreflang)正确
- [ ] 旧的 `/us/article/...` URL返回404或重定向

## 后续计划

### 短期
1. 添加服务器级重定向规则处理旧URL
2. 更新所有内部链接使用新路由
3. 监控404错误率

### 中期
1. 完全移除 `Locale` 类型引用
2. 优化语言切换体验

### 长期
1. 支持更多源语言站点
2. 实现功能页的全站翻译

## 故障排查

### 问题: 访问旧URL返回404

**原因:** 旧路由已被移除

**解决方案:**
1. 在服务器级别(Nginx/Vercel)配置重定向规则
2. 或者在Astro中添加中间件捕获并重定向旧URL

### 问题: 用户文章无法访问

**原因:** URL格式错误,缺少 `/u/` 前缀

**解决方案:**
确保所有用户文章链接使用新格式:
- ✅ `/u/user123/article/...`
- ❌ `/user123/article/...`

### 问题: 语言切换后路径错误

**原因:** 路径生成逻辑未更新

**解决方案:**
使用 `buildArticleUrl()` 函数确保正确的路径结构

## 参考文档

- [多源站点架构设计](./MULTI_SOURCE_SITE_ARCHITECTURE.md)
- [迁移指南](./MIGRATION_MULTI_SOURCE.md)
