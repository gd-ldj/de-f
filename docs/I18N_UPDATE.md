# 国际化 (i18n) 更新说明

## 概览

国际化系统已从旧的locale模式 (`us`, `asia`) 更新为源语言模式 (`en`, `zh`, `ja`),以支持新的多源站点架构。

## 文件结构变更

### 旧结构
```
public/locales/
├── us/
│   └── translation.json          # 英文翻译
└── asia/
    └── translation.json          # 中文翻译
```

### 新结构
```
public/locales/
├── en/
│   └── translation.json          # 英文翻译
├── zh/
│   └── translation.json          # 中文翻译
├── ja/
│   └── translation.json          # 日文翻译 (新增)
├── us/                           # 保留用于向后兼容
│   └── translation.json
└── asia/                         # 保留用于向后兼容
    └── translation.json
```

## API 变更

### 旧API (仍然支持,用于向后兼容)

```typescript
import { t, useTranslation, createTranslator } from '@/lib/i18n'

// 使用locale
const text = t('us', 'common.filters')

// 在组件中使用
const { t } = useTranslation('us')
const text = t('common.filters')

// 创建绑定的翻译器
const translate = createTranslator('us')
const text = translate('common.filters')
```

### 新API (推荐用于新代码)

```typescript
import { tl, useLanguageTranslation, createLanguageTranslator } from '@/lib/i18n'

// 使用源语言
const text = tl('en', 'common.filters')

// 在组件中使用
const { t } = useLanguageTranslation('en')
const text = t('common.filters')

// 创建绑定的翻译器
const translate = createLanguageTranslator('en')
const text = translate('common.filters')
```

## 支持的语言

| 语言代码 | 语言名称 | 本地名称 | 状态 |
|---------|---------|---------|------|
| `en` | English | English | ✅ 完整支持 |
| `zh` | Chinese | 中文 | ✅ 完整支持 |
| `ja` | Japanese | 日本語 | ✅ 新增支持 |

## 翻译文件内容

所有语言的翻译文件包含以下主要部分:

### 1. 导航 (navigation)
```json
{
  "navigation": {
    "allCategories": "...",
    "socialMedia": "...",
    "explore": "...",
    "technology": "...",
    "collections": "...",
    "trending": "...",
    "learn": "...",
    "search": "...",
    "switchLanguage": "...",
    "settings": "...",
    "openMenu": "...",
    "switchToAsia": "..."
  }
}
```

### 2. 通用文案 (common)
```json
{
  "common": {
    "filters": "...",
    "clearAll": "...",
    "category": "...",
    "author": "...",
    "topic": "...",
    "topics": "...",
    "none": "...",
    "prev": "...",
    "next": "...",
    // ... 更多
  }
}
```

### 3. 页面特定文案
- `pages` - 页面标题和描述
- `learn` - 学习页面
- `article` - 文章页面
- `author` - 作者页面
- `collections` - 合集页面
- `home` - 主页
- `footer` - 页脚
- `wallet` - 钱包相关
- `auth` - 认证相关
- `research` - 研究页面
- `social` - 社交功能

## 迁移指南

### 从旧API迁移到新API

**步骤1: 识别locale到language的映射**

```typescript
// 旧代码
const locale = 'us'  // or 'asia'

// 新代码
import { MULTI_SOURCE_CONFIG } from '@/config/constants'
const language = MULTI_SOURCE_CONFIG.localeToLanguage(locale)
// 'us' → 'en'
// 'asia' → 'zh'
```

**步骤2: 更新翻译函数调用**

```typescript
// 旧代码
import { t, createTranslator } from '@/lib/i18n'
const text = t('us', 'common.filters')
const translate = createTranslator('us')

// 新代码
import { tl, createLanguageTranslator } from '@/lib/i18n'
const text = tl('en', 'common.filters')
const translate = createLanguageTranslator('en')
```

**步骤3: 更新组件**

```typescript
// 旧代码
import { useTranslation } from '@/lib/i18n'
const { t } = useTranslation('us')

// 新代码
import { useLanguageTranslation } from '@/lib/i18n'
const { t } = useLanguageTranslation('en')
```

### 在Astro组件中使用

```astro
---
import { createLanguageTranslator } from '@/lib/i18n'
import { MULTI_SOURCE_CONFIG } from '@/config/constants'

// 从域名获取源语言
const sourceLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(Astro.url.hostname)

// 创建翻译函数
const t = createLanguageTranslator(sourceLanguage)
---

<h1>{t('pages.homeTitle')}</h1>
<p>{t('pages.homeDescription')}</p>
```

### 在React组件中使用

```tsx
import { useLanguageTranslation } from '@/lib/i18n'
import { MULTI_SOURCE_CONFIG } from '@/config/constants'

export function MyComponent() {
  // 从当前域名获取源语言
  const sourceLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(window.location.hostname)
  const { t } = useLanguageTranslation(sourceLanguage)

  return (
    <div>
      <h1>{t('common.filters')}</h1>
      <button>{t('common.clearAll')}</button>
    </div>
  )
}
```

## 添加新的翻译键

当需要添加新的翻译键时:

1. **在所有三个语言文件中添加相同的键**
   - `public/locales/en/translation.json`
   - `public/locales/zh/translation.json`
   - `public/locales/ja/translation.json`

2. **保持JSON结构一致**
   ```json
   {
     "mySection": {
       "newKey": "English text",
       "anotherKey": "More English text"
     }
   }
   ```

3. **使用描述性的键名**
   - ✅ `article.shareToEarn`
   - ❌ `text1`, `label2`

4. **按功能分组**
   - 导航相关 → `navigation.*`
   - 通用文案 → `common.*`
   - 页面特定 → `pages.*`, `article.*`, 等

## 语言切换按钮

语言切换按钮使用短标签:

```json
{
  "learn": {
    "languageShort": {
      "zh": "中",
      "en": "A",
      "ar": "ع",
      "ru": "RU",
      "ja": "あ"
    }
  }
}
```

在UI中使用:
```typescript
const languageLabels = {
  en: 'A',
  zh: '中',
  ja: 'あ',
  fr: 'F',
  ar: 'ع',
  ru: 'RU',
  de: 'D',
  es: 'E',
  ko: '한',
}
```

## 测试翻译

### 手动测试

1. **英文站点** (`en.detake.com` 或 `PUBLIC_SOURCE_LANGUAGE=en`)
   ```typescript
   const text = tl('en', 'common.filters')
   // 应该返回: "Filters"
   ```

2. **中文站点** (`zh.detake.com` 或 `PUBLIC_SOURCE_LANGUAGE=zh`)
   ```typescript
   const text = tl('zh', 'common.filters')
   // 应该返回: "筛选"
   ```

3. **日文站点** (`ja.detake.com` 或 `PUBLIC_SOURCE_LANGUAGE=ja`)
   ```typescript
   const text = tl('ja', 'common.filters')
   // 应该返回: "フィルター"
   ```

### 回退机制测试

```typescript
// 如果键不存在,会回退到英文
const text = tl('ja', 'nonexistent.key')
// 会尝试: ja → en → 返回键本身

// 使用自定义回退
const text = tl('ja', 'nonexistent.key', 'Default Text')
// 返回: "Default Text"
```

## 常见问题

### Q: 旧的 `us` 和 `asia` locale还能用吗?

A: 是的,为了向后兼容,旧API仍然可用。但建议新代码使用新的语言API。

### Q: 如何添加新语言(如法语、德语)?

A:
1. 在 `public/locales/` 创建新目录 (如 `fr/`, `de/`)
2. 复制 `en/translation.json` 作为模板
3. 翻译所有文本
4. 在 `src/lib/i18n.ts` 中导入并添加到 `languageTranslations`
5. 更新 `SourceLanguage` 或 `TranslationLanguage` 类型

### Q: 翻译缺失时会发生什么?

A: 系统会按以下顺序回退:
1. 尝试当前语言
2. 回退到英文 (如果当前不是英文)
3. 返回自定义fallback (如果提供)
4. 返回键本身

### Q: 如何在开发环境测试不同语言?

A: 设置环境变量:
```bash
# 测试英文
PUBLIC_SOURCE_LANGUAGE=en pnpm dev

# 测试中文
PUBLIC_SOURCE_LANGUAGE=zh pnpm dev

# 测试日文
PUBLIC_SOURCE_LANGUAGE=ja pnpm dev
```

## 最佳实践

1. **总是提供fallback**: `t('key', 'Fallback Text')`
2. **使用描述性键名**: `article.shareToEarn` 而不是 `text1`
3. **保持翻译文件同步**: 所有语言文件应有相同的键
4. **避免硬编码文本**: 使用翻译函数替代硬编码
5. **测试所有语言**: 确保新功能在所有语言下正常工作

## 参考

- [多源站点架构设计](./MULTI_SOURCE_SITE_ARCHITECTURE.md)
- [路由变更说明](./ROUTE_CHANGES.md)
- [迁移指南](./MIGRATION_MULTI_SOURCE.md)
