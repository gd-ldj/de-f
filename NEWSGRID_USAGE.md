# NewsGrid 组件使用说明

## 概述
NewsGrid 组件已更新，现在支持两种数据传递方式：
1. 传统的 `initialArticles` 数组（向后兼容）
2. 新的 `newsData` 结构，包含标签和对应的数据

## 新数据结构

### newsData 格式
```typescript
interface NewsData {
  tag: string;        // Category tag name
  data: HomeNewsArticle[];  // Array of articles under this category
}
```

### 使用示例

#### 1. 使用新的 newsData 结构
```typescript
const newsData = [
  {
    "tag": "All",
    "data": [
      {
        "entry_id": "dtc-CpLxFSTl",
        "slug": "phac-cutting-hundreds-of--6v3v",
        "title": "PHAC Cutting Hundreds of Jobs as Part of 'Post-Pandemic Recalibration' Effort",
        "img_url": "https://i.cbc.ca/1.7258772.1720559062!/fileImage/httpImage/image.jpg_gen/derivatives/16x9_620/public-health-agency-of-canada-sign.jpg",
        "body": "The Public Health Agency of Canada is cutting about 10 percent of its workforce...",
        "created_at": "2025-09-04T05:55:41.034Z",
        "business_type_name": "News",
        "author": {
          "name": "Nicole Lewis",
          "avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=nicolelewis"
        }
      }
    ]
  },
  {
    "tag": "Markets",
    "data": [
      // Markets category article data
    ]
  },
  {
    "tag": "Opinion",
    "data": [
      // Opinion category article data
    ]
  }
];
```

#### 2. 在 Astro 组件中使用
```astro
---
// NewsSection.astro
import NewsGrid from '@/components/home/react/NewsGrid'

const newsData = [
  { tag: "All", data: allArticles },
  { tag: "Markets", data: marketsArticles },
  { tag: "Opinion", data: opinionArticles }
];
---

<NewsGrid 
  newsData={newsData}
  locale={locale}
  client:load
/>
```

#### 3. 向后兼容的使用方式
```astro
<!-- Still supports traditional initialArticles approach -->
<NewsGrid 
  initialArticles={articles}
  locale={locale}
  client:load
/>
```

## 功能特性

### 动态分类生成
- 当使用 `newsData` 时，组件会自动根据 `tag` 生成分类标签
- 自动添加 "All" 分类显示所有文章
- 支持中英文分类名称

### 分类切换
- 点击分类标签可切换显示对应分类的文章
- "All" 分类显示所有分类的文章合集
- 支持加载状态显示

### 数据处理
- 自动处理空数据情况
- 支持数据结构的向后兼容
- 错误处理和回退机制

## 注意事项

1. **优先级**：如果同时传递 `newsData` 和 `initialArticles`，组件会优先使用 `newsData`
2. **标签命名**：`tag` 字段会被转换为小写作为分类的 key
3. **国际化**：分类名称支持国际化，可以根据 locale 显示不同语言
4. **性能**：使用 `useMemo` 优化分类生成，避免不必要的重新计算

## 迁移指南

如果你当前使用的是 `initialArticles`，可以按以下步骤迁移到新的数据结构：

1. 将现有的文章数组按分类分组
2. 为每个分组创建包含 `tag` 和 `data` 的对象
3. 将 `initialArticles` 替换为 `newsData`
4. 测试分类切换功能是否正常工作