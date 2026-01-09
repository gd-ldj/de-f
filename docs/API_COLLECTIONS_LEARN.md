# Collections & Learn 接口文档（前端对接版）


## 2. Collections 接口

### 2.1 获取 Collections 列表

用于 Collections 列表页卡片渲染。

- 页面：`/src/pages/[locale]/collections/index.astro`
- Method：`GET`
- Path：`/api/v1/collections`

#### Query

| 参数   | 类型   | 必填 | 示例   | 说明        |
| ------ | ------ | ---: | ------ | ----------- |
| locale | string |   是 | `en`   | 语言        |
| page   | number |   否 | `1`    | page 分页   |
| limit  | number |   否 | `10`   | 每页条数    |
| cursor | string |   否 | `xxxx` | cursor 分页 |

#### Response.data

```json
{
  "list": [
    {
      "id": "zkcandy-ecosystem-1",
      "title": "ZKCandy Ecosystem",
      "description": "Dive into the ZKCandy Ecosystem & grow your onchain presence.",
      "image_url": "https://xxx/cover.png",
      "logo_url": "https://xxx/logo.png",
      "hunters": "1.4K",
      "bonus": "1.4K",
      "followers": "5,297"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "next": false,
    "next_cursor": null
  }
}
```

#### 字段说明

| 字段        | 类型   | 说明                                        |
| ----------- | ------ | ------------------------------------------- |
| id          | string | Collection 唯一标识（用于详情页 path 参数） |
| title       | string | 标题                                        |
| description | string | 描述                                        |
| image_url   | string | 卡片右侧封面图                              |
| logo_url    | string | 卡片左上角 logo                             |
| hunters     | string | 运营展示字段（可先按字符串返回）            |
| bonus       | string | 运营展示字段（可先按字符串返回）            |
| followers   | string | 运营展示字段（可先按字符串返回）            |

### 2.2 获取 Collection 详情元信息

用于 Collection 详情页头部标题/描述，以及 SEO。

- 页面：`/src/pages/[locale]/collections/[slug].astro`
- Method：`GET`
- Path：`/api/v1/collections/{collection_id}`

#### Path

| 参数          | 类型   | 必填 | 示例                  |
| ------------- | ------ | ---: | --------------------- |
| collection_id | string |   是 | `zkcandy-ecosystem-1` |

#### Query

| 参数   | 类型   | 必填 | 示例 |
| ------ | ------ | ---: | ---- |
| locale | string |   是 | `en` |

#### Response.data

```json
{
  "id": "zkcandy-ecosystem-1",
  "title": "ZKCandy Ecosystem",
  "description": "Dive into the ZKCandy Ecosystem & grow your onchain presence.",
  "cover_image_url": "https://xxx/cover.png",
  "logo_url": "https://xxx/logo.png"
}
```

> 最低需要 `id/title/description`，其余字段可选。

### 2.3 获取 Collection 下的文章列表

用于 Collection 详情页文章网格渲染。

- 页面：`/src/pages/[locale]/collections/[slug].astro`

#### Query

| 参数     | 类型   | 必填 | 示例     | 说明                      |
| -------- | ------ | ---: | -------- | ------------------------- |
| locale   | string |   是 | `en`     | 语言                      |
| page     | number |   否 | `1`      | page 分页                 |
| limit    | number |   否 | `10`     | 每页条数                  |
| cursor   | string |   否 | `xxxx`   | cursor 分页               |
| order_by | string |   否 | `Latest` | `Latest/Popular/Trending` |

#### Response.data

```json
{
  "list": [
    {
      "entry_id": "collection-article-1",
      "title": "Fusaka fork takes shape as Pectra enters final stretch",
      "sub_title": "Ethereum core developers finalize Pectra's May 7 launch...",
      "slug": "fusaka-fork-takes-shape-as-pectra-enters-final-stretch-1",
      "body": "",
      "author_name": "JACK KUBINEC",
      "author_avatar": "",
      "created_at": "2025-04-11T00:00:00.000Z",
      "updated_at": "2025-04-11T00:00:00.000Z",
      "category_name": "Markets Policy",
      "business_type_name": "News",
      "tags": ["DEFI"],
      "img_url": "https://xxx/cover.png",
      "language": "en",
      "page_view": "1200",
      "unique_vistor": "800",
      "contact": {
        "email": "editor@example.com",
        "phone": "",
        "title": "",
        "company": "",
        "full_name": ""
      },
      "author": {
        "id": "author-1",
        "name": "JACK KUBINEC",
        "avatar_url": "",
        "bio": ""
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "next": false,
    "next_cursor": null
  }
}
```

#### 文章字段说明（对齐前端 ApiArticle）

前端字段定义参考：`src/types/index.ts` 中的 `ApiArticle`。

至少需要确保以下字段可用（页面渲染会直接使用）：

| 字段                       | 必填 | 说明                                       |
| -------------------------- | ---: | ------------------------------------------ |
| entry_id                   |   是 | 文章唯一标识                               |
| title                      |   是 | 标题                                       |
| sub_title                  |   是 | 副标题/摘要                                |
| slug                       |   是 | 用于跳转详情页                             |
| created_at                 |   是 | 时间展示                                   |
| category_name              |   是 | 分类标签展示                               |
| business_type_name         |   是 | 用于拼接跳转路径（news/insights/research） |
| tags                       |   是 | 标签展示                                   |
| img_url                    |   否 | 封面图                                     |
| author.name 或 author_name |   否 | 作者展示（两者任一即可）                   |

## 3. Learn 接口

### 3.1 获取 Learn 术语列表

用于 Learn 列表页按字母展示。

- 页面：`/src/pages/[locale]/learn/index.astro`
- Method：`GET`
- Path：`/api/v1/learn/items`

#### Query

| 参数   | 类型   | 必填 | 示例   | 说明                            |
| ------ | ------ | ---: | ------ | ------------------------------- |
| locale | string |   是 | `en`   | 语言                            |
| q      | string |   否 | `eth`  | 搜索词（预留）                  |
| page   | number |   否 | `1`    | page 分页                       |
| limit  | number |   否 | `200`  | 建议默认返回较多以支持 A-Z 页面 |
| cursor | string |   否 | `xxxx` | cursor 分页                     |

#### Response.data

```json
{
  "list": [
    {
      "id": "1",
      "title": "51% Attack",
      "slug": "51-attack",
      "description": "Also known as a majority attack...",
      "first_letter": "#",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 200,
    "next": false,
    "next_cursor": null
  }
}
```

#### 字段说明

| 字段         | 类型   | 说明                     |
| ------------ | ------ | ------------------------ |
| id           | string | 术语唯一标识             |
| title        | string | 术语标题                 |
| slug         | string | 用于详情页 path 参数     |
| description  | string | 列表页描述               |
| first_letter | string | 分组字母（`#` 或 `A-Z`） |
| created_at   | string | ISO 时间                 |
| updated_at   | string | ISO 时间                 |

### 3.2 获取 Learn 可用字母

用于列表页顶部字母导航，仅展示有内容的字母。

- 页面：`/src/pages/[locale]/learn/index.astro`
- Method：`GET`
- Path：`/api/v1/learn/letters`

#### Query

| 参数   | 类型   | 必填 | 示例 |
| ------ | ------ | ---: | ---- |
| locale | string |   是 | `en` |

#### Response.data

```json
{
  "letters": ["#", "A", "B", "C"]
}
```

> 如果后端不想提供该接口，也可由 `/api/v1/learn/items` 返回后前端自行计算字母集合。

### 3.3 获取 Learn 术语详情

用于 Learn 详情页内容渲染。

- 页面：`/src/pages/[locale]/learn/[slug].astro`
- Method：`GET`
- Path：`/api/v1/learn/items/{slug}`

#### Path

| 参数 | 类型   | 必填 | 示例                  |
| ---- | ------ | ---: | --------------------- |
| slug | string |   是 | `ethereum-foundation` |

#### Query

| 参数   | 类型   | 必填 | 示例 |
| ------ | ------ | ---: | ---- |
| locale | string |   是 | `en` |

#### Response.data

```json
{
  "id": "7",
  "title": "Ethereum Foundation",
  "slug": "ethereum-foundation",
  "description": "The Ethereum Foundation is a non-profit organization...",
  "content": "## What Is the Ethereum Foundation\n\nThe Ethereum Foundation is ...\n\n### Mission and Goals\n\n...",
  "first_letter": "E",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### content 字段要求

- 建议返回纯文本（可包含 `##`、`###`、空行分段），由前端统一转换为 HTML
- 不建议返回未经清洗的 HTML，避免 XSS 风险

## 4. 页面依赖接口（现有接口，供联调时确认）

Collections 与 Learn 页面右侧栏会展示 Recent Research，会调用 Articles 列表接口：

- Method：`GET`
- Path：`/api/v1/articles`
- Query（示例）：`locale=en&limit=2&page=1&business_type_name=Research&order_by=Latest`

参考实现：`src/api/articles.ts` 的 `fetchArticles`。
