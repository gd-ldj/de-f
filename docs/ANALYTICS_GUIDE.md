# DeTake Analytics System

本文档介绍了 DeTake 项目中集成的分析追踪系统，包括访客标识生成、用户行为数据采集功能。

## 🎯 功能概述

### 1. 访客标识生成
- **Cloudflare Visitor ID**: 基于 CF-Ray、CF-Connecting-IP 等 Cloudflare 头部信息生成唯一访客标识
- **Google Analytics Client ID**: 集成 GA4 获取客户端标识符
- **混合标识策略**: 结合多种数据源确保访客标识的唯一性和持久性

### 2. 用户行为数据采集
- **页面浏览追踪**: PV/UV 统计和页面停留时间
- **文章互动追踪**: 文章查看、分享、评论等行为
- **滚动深度分析**: 用户阅读深度和内容消费模式
- **实时事件流**: 批量发送和实时处理用户行为事件

## 🏗️ 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Endpoints  │    │   Analytics     │
│                 │    │                  │    │   Processing    │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Analytics.ts  │───▶│ /api/analytics/  │───▶│ • Event Storage │
│ • VisitorID.ts  │    │   events         │    │ • Batch Process │
│ • Tracking.ts   │    │ /api/cf-visitor  │    │ • Real-time     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📂 文件结构

```
src/
├── lib/
│   └── analytics.ts              # 核心分析系统
├── components/
│   └── common/
│       ├── AnalyticsProvider.tsx  # 分析服务提供者
│       └── react/
└── pages/
    └── api/
        ├── analytics/
        │   └── events.ts          # 事件收集端点
        └── cf-visitor-id.ts       # Cloudflare 访客 ID 端点
```

## 🚀 快速开始

### 1. 环境配置

确保以下环境变量已正确配置：

```bash
# .env.local
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_token_here
```

### 2. 基础集成

```typescript
// Add Analytics Provider in layout
import AnalyticsProvider from '@/components/common/AnalyticsProvider'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <AnalyticsProvider />
    </>
  )
}
```

### 3. 事件追踪

```typescript
import { getAnalytics } from '@/lib/analytics'

// Track page views
const analytics = getAnalytics()
analytics.trackEvent('page_view', {
  page: window.location.pathname,
  title: document.title
})

// Track article views
analytics.trackEvent('article_view', {
  articleId: 'article-123',
  category: 'news',
  author: 'John Doe'
})
```

## 📊 支持的事件类型

### 核心事件
- `page_view`: 页面浏览
- `article_view`: 文章查看
- `article_share`: 文章分享
- `scroll_depth`: 滚动深度
- `time_on_page`: 页面停留时间

### 用户交互事件
- `click_event`: 点击事件
- `search_event`: 搜索事件
- `user_engagement`: 用户参与度

### 认证事件
- `login_attempt`: 登录尝试
- `login_success`: 登录成功
- `login_failure`: 登录失败

### 自定义 UI 事件
- `header_user_button_click`: 头部用户按钮点击
- `wallet_button_click`: 钱包按钮点击

## 🔧 API 端点

### 事件收集端点
```
POST /api/analytics/events
Content-Type: application/json

{
  "type": "page_view",
  "data": {
    "page": "/news/article-123",
    "title": "Article Title"
  }
}
```

### Cloudflare 访客 ID
```
GET /api/cf-visitor-id
Response: {
  "visitorId": "unique-visitor-id",
  "timestamp": 1623456789
}
```

## 📈 数据模型

### 访客数据
```typescript
interface VisitorData {
  visitorId: string
  gaClientId?: string
  cfVisitorId?: string
  sessionId: string
  firstVisit: number
  lastVisit: number
}
```

### 行为事件
```typescript
interface BehaviorEvent {
  type: string
  timestamp: number
  data: Record<string, any>
  visitorId: string
  sessionId: string
  pageUrl: string
}
```

## 🎛️ 配置选项

### Analytics 配置
```typescript
export const ANALYTICS_CONFIG = {
  // Google Analytics configuration
  GA_MEASUREMENT_ID: import.meta.env.PUBLIC_GA_MEASUREMENT_ID,
  
  // Cloudflare Analytics token
  CLOUDFLARE_ANALYTICS_TOKEN: import.meta.env.PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN,
  
  // Behavior tracking intervals
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  SCROLL_THROTTLE: 500, // 500ms
  CLICK_DEBOUNCE: 300, // 300ms
  
  // Data collection limits
  MAX_EVENTS_QUEUE: 100,
  BATCH_SEND_INTERVAL: 60000, // 1 minute
} as const
```

## 🔒 隐私与合规

### 数据收集原则
- 仅收集必要的分析数据
- 不收集个人身份信息 (PII)
- 支持用户 opt-out
- 遵循 GDPR/CCPA 等隐私法规

### 数据保护措施
- 客户端数据加密
- 安全的 API 传输
- 定期数据清理
- 访问权限控制

## 📝 测试与调试

### 开发环境测试
```typescript
// Enable debug mode
window.__ANALYTICS_DEBUG = true

// Check event sending
console.log(window.__ANALYTICS_EVENTS)
```

### 生产环境监控
- 事件发送成功率监控
- API 响应时间追踪
- 错误日志收集

## 🐛 故障排除

### 常见问题

**1. GA 事件未显示**
- 检查 GA4 配置和测量 ID
- 确认事件格式正确
- 验证网络连接

**2. 访客 ID 未生成**
- 检查 Cloudflare headers
- 验证 API 端点可访问性
- 确认环境变量配置

**3. 事件队列堆积**
```bash
# 检查事件发送状态
curl -X POST https://yoursite.com/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{"type": "test_event", "data": {}}'
```

## 📚 最佳实践

### 1. 事件命名规范
- 使用下划线分隔词汇
- 保持名称简洁明确
- 避免使用动态事件名称

### 2. 数据结构
- 保持事件数据结构一致
- 避免嵌套过深的对象
- 使用标准化的字段名

### 3. 性能优化
- 批量发送事件
- 使用防抖和节流
- 避免阻塞主线程

## 🔄 更新与维护

### 版本追踪
- 事件 schema 版本管理
- 向后兼容性保证
- 渐进式功能升级

### 监控指标
- 事件收集覆盖率
- API 性能指标
- 错误率监控

## 📖 参考资料

- [Google Analytics 4 文档](https://developers.google.com/analytics/devguides/collection/ga4)
- [Cloudflare Analytics API](https://developers.cloudflare.com/analytics/)
- [Web Analytics 最佳实践](https://web.dev/analytics-best-practices/)