# 全局搜索接口文档

> 适用功能：Header 右上角搜索图标 → 展开搜索框 → 输入关键词 → 展示文章列表 → Load More 分页

---

## 接口概览

| 属性 | 值 |
|------|-----|
| Method | `GET` |
| Path | `/api/v1/search` |
| Auth | 无需登录（公开接口） |

---

## 请求参数（Query String）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `q` | `string` | 是 | 搜索关键词，最少 1 个字符，最多 200 个字符 |
| `locale` | `string` | 是 | 内容语言，枚举值：`en` / `zh` / `ja`，默认 `en` |
| `page` | `number` | 否 | 页码，从 `1` 开始，默认 `1` |
| `limit` | `number` | 否 | 每页条数，默认 `8`，最大 `20` |
| `cursor` | `string` | 否 | 游标分页 token（由上一页响应的 `next_cursor` 提供，与 `page` 二选一，优先使用 cursor） |

### 请求示例

```
GET /api/v1/search?q=bitcoin&locale=en&page=1&limit=8
GET /api/v1/search?q=bitcoin&locale=en&cursor=eyJpZCI6MTIzfQ%3D%3D&limit=8
```

---

## 搜索范围说明

后端需对以下字段进行全文检索（优先级从高到低）：

1. `title` — 文章标题（权重最高）
2. `sub_title` — 文章副标题 / 摘要
3. `tags` — 标签
4. `author_name` — 作者名
5. `body` — 正文内容（可选，视性能而定）

---

## 响应格式

### 成功响应（HTTP 200）

```json
{
  "code": 2000,
  "msg": {
    "en": "success",
    "zh": "成功"
  },
  "data": {
    "list": [
      {
        "entry_id": "abc123",
        "title": "AI Odyssey Part 2: Perils of Prompting",
        "sub_title": "AI Odyssey Part 2: Perils of Prompting",
        "slug": "ai-odyssey-part-2-perils-of-prompting",
        "author_name": "NICOLE LEWIS",
        "author_avatar": "https://cdn.example.com/avatars/nicole.jpg",
        "created_at": "2026-03-13T08:00:00Z",
        "updated_at": "2026-03-13T08:00:00Z",
        "category_names": ["TECHNOLOGY"],
        "subcategory_names": ["NEW RELEASES"],
        "business_type_name": "TECHNOLOGY",
        "tags": ["AI", "prompting"],
        "img_url": "https://cdn.example.com/images/article-cover.jpg",
        "language": "en"
      }
    ],
    "pagination": {
      "total": 128,
      "page": 1,
      "limit": 8,
      "next": true,
      "next_cursor": "eyJpZCI6MTIzfQ=="
    }
  }
}
```

### list 单条数据字段说明

| 字段名 | 类型 | 必返回 | 说明 |
|--------|------|--------|------|
| `entry_id` | `string` | 是 | 文章唯一 ID |
| `title` | `string` | 是 | 文章标题 |
| `sub_title` | `string` | 是 | 副标题 / 摘要（用于卡片摘要展示，过长时前端截断） |
| `slug` | `string` | 是 | URL slug，用于生成详情页链接 |
| `author_name` | `string` | 是 | 作者名（大写展示） |
| `author_avatar` | `string` | 否 | 作者头像 URL |
| `created_at` | `string` | 是 | 发布时间，ISO 8601 格式 |
| `updated_at` | `string` | 是 | 更新时间，ISO 8601 格式 |
| `category_names` | `string[]` | 是 | 一级分类列表（如 `["TECHNOLOGY"]`） |
| `subcategory_names` | `string[]` | 是 | 二级分类列表（如 `["NEW RELEASES"]`） |
| `business_type_name` | `string` | 否 | 业务类型（`News` / `Research` 等） |
| `tags` | `string[]` | 是 | 标签列表，没有时返回空数组 `[]` |
| `img_url` | `string` | 否 | 文章封面图 URL，无图时返回 `null` 或不返回 |
| `language` | `string` | 否 | 文章语言（`en` / `zh` / `ja`） |

### pagination 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `total` | `number` | 搜索结果总条数 |
| `page` | `number` | 当前页码 |
| `limit` | `number` | 每页条数 |
| `next` | `boolean` | 是否还有下一页 |
| `next_cursor` | `string \| null` | 游标 token，`next` 为 `false` 时返回 `null` |

---

## 错误响应

### 参数缺失或非法（HTTP 400）

```json
{
  "code": 4000,
  "msg": {
    "en": "Missing required parameter: q",
    "zh": "缺少必填参数：q"
  },
  "data": null
}
```

### 关键词过长（HTTP 400）

```json
{
  "code": 4001,
  "msg": {
    "en": "Search keyword exceeds maximum length of 200 characters",
    "zh": "搜索关键词超过最大长度 200 个字符"
  },
  "data": null
}
```

### 服务端错误（HTTP 500）

```json
{
  "code": 5000,
  "msg": {
    "en": "Internal server error",
    "zh": "服务器内部错误"
  },
  "data": null
}
```

---

## 前端交互说明（供参考）

| 场景 | 行为 |
|------|------|
| 用户输入后 300ms 防抖触发搜索 | 每次输入变化重置 page/cursor 为初始值 |
| `q` 为空字符串 | 前端不发请求，清空结果列表 |
| Load More | 使用上一次响应的 `next_cursor` 追加加载，附加到现有列表 |
| `next = false` | 隐藏 Load More 按钮 |
| 无搜索结果 | `list = []`，前端展示空状态 |
| 切换语言 | 带新 `locale` 重新发起请求，重置分页 |

---

## 与现有文章接口的关系

- 本接口为独立搜索接口，**不复用** `/api/v1/articles`
- 响应数据结构与 `/api/v1/articles` 保持一致（共用 `ApiArticle` 类型），便于前端复用卡片组件
- 后端可在搜索索引（如 Elasticsearch / PostgreSQL Full-Text）中实现，无需修改文章列表接口
