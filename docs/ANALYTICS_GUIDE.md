# DeTake Analytics & Verification System

本文档介绍了 DeTake 项目中集成的分析追踪和验证系统，包括访客标识生成、虚假流量过滤和用户行为数据采集功能。

## 🎯 功能概述

### 1. 访客标识生成
- **Cloudflare Visitor ID**: 基于 CF-Ray、CF-Connecting-IP 等 Cloudflare 头部信息生成唯一访客标识
- **Google Analytics Client ID**: 集成 GA4 获取客户端标识符
- **混合标识策略**: 结合多种数据源确保访客标识的唯一性和持久性

### 2. 虚假流量过滤
- **Cloudflare Turnstile**: 集成 Cloudflare 的机器人检测和验证服务
- **行为模式分析**: 检测异常点击、滚动和访问模式
- **多维度验证**: 结合 IP、User-Agent、访问频率等多个维度进行流量质量评估

### 3. 用户行为数据采集
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
│ • Turnstile.tsx │    │   events         │    │ • Fraud Filter  │
│ • BaseLayout    │    │ /api/cf-visitor- │    │ • Real-time     │
│ • Event Tracking│    │   id             │    │   Dashboard     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 文件结构

```
src/
├── lib/
│   └── analytics.ts              # 核心分析系统类
├── components/common/react/
│   └── TurnstileVerification.tsx  # Cloudflare Turnstile 组件
├── config/
│   └── constants.ts              # 分析配置常量
├── pages/api/
│   ├── analytics/
│   │   └── events.ts             # 事件收集 API
│   └── cf-visitor-id.ts          # Cloudflare 访客 ID API
├── layouts/
│   └── BaseLayout.astro          # 全局分析初始化
└── pages/
    └── test-analytics.astro      # 分析功能测试页面
```

## ⚙️ 配置说明

### 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# Google Analytics
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Cloudflare Turnstile
PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAAAxxxxxxxxxxxxxxxxxx

# Cloudflare Analytics
PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_cloudflare_analytics_token
```

### 常量配置

在 `src/config/constants.ts` 中可以调整以下参数：

```typescript
export const ANALYTICS_CONFIG = {
  // 行为追踪间隔
  HEARTBEAT_INTERVAL: 30000,     // 心跳间隔 (30秒)
  SCROLL_THROTTLE: 500,          // 滚动节流 (500ms)
  CLICK_DEBOUNCE: 300,           // 点击防抖 (300ms)
  
  // 数据收集限制
  MAX_EVENTS_QUEUE: 100,         // 最大事件队列长度
  BATCH_SEND_INTERVAL: 60000,    // 批量发送间隔 (1分钟)
}
```

## 🚀 使用指南

### 1. 基础集成

分析系统会在 `BaseLayout.astro` 中自动初始化，无需额外配置：

```javascript
// 系统会自动初始化，并在全局暴露 analytics 实例
window.detakeAnalytics // 可用于调试和手动事件追踪
```

### 2. 文章追踪

在文章页面中追踪用户行为：

```javascript
// 追踪文章查看
window.detakeAnalytics.trackArticleView('article-123', 'Article Title', 'crypto')

// 追踪文章分享
window.detakeAnalytics.trackArticleShare('article-123', 'twitter')
```

### 3. 自定义事件

追踪自定义用户行为：

```javascript
window.detakeAnalytics.trackEvent('custom_event', {
  action: 'button_click',
  category: 'navigation',
  value: 1
})
```

### 4. Turnstile 验证

在需要验证的组件中使用：

```tsx
import TurnstileVerification from '../components/common/react/TurnstileVerification'

<TurnstileVerification
  onVerify={(token) => console.log('Verified:', token)}
  onError={(error) => console.error('Verification failed:', error)}
  size="normal"
  theme="auto"
/>
```

## 📊 数据收集说明

### 自动收集的数据

1. **页面数据**
   - 页面 URL 和标题
   - 访问时间和停留时长
   - 来源页面 (Referrer)

2. **设备信息**
   - 屏幕分辨率和视窗大小
   - 用户代理 (User-Agent)
   - 时区和语言设置

3. **行为数据**
   - 点击事件和位置
   - 滚动深度和模式
   - 表单交互

4. **访客标识**
   - Cloudflare Visitor ID
   - Google Analytics Client ID
   - 会话 ID 和访问历史

### 隐私保护

- 所有个人身份信息都经过哈希处理
- IP 地址仅用于地理位置分析，不存储完整 IP
- 用户可以通过浏览器设置禁用追踪
- 遵循 GDPR 和其他隐私法规要求

## 🔍 虚假流量检测

### 检测规则

1. **时间模式异常**
   - 短时间内大量事件 (10秒内超过50个事件)
   - 规律性过强的访问模式

2. **行为模式异常**
   - 快速连续点击 (100ms内多次点击)
   - 不可能的滚动跳跃 (单次滚动超过50%)

3. **技术特征**
   - 可疑的 User-Agent
   - 已知的机器人 IP 段
   - 缺少必要的浏览器特征

### 处理策略

- **轻度可疑**: 标记但保留数据
- **中度可疑**: 降低数据权重
- **高度可疑**: 过滤掉相关事件

## 🧪 测试和调试

### 测试页面

访问 `/test-analytics` 页面进行功能测试：

- 实时事件追踪演示
- Turnstile 验证测试
- 访客信息查看
- 事件日志监控

### 调试工具

```javascript
// 查看访客信息
window.detakeAnalytics.getVisitorData()

// 手动触发事件发送
window.detakeAnalytics.sendQueuedEvents(true)

// 清理分析数据
window.detakeAnalytics.destroy()
```

### 控制台日志

系统会输出详细的调试信息：

```
[Analytics] System initialized successfully
[Analytics] Event tracked: { type: 'page_view', ... }
[Analytics] Sent 10 events successfully
[Turnstile] Verification successful
```

## 🔧 高级配置

### 自定义事件类型

在 `constants.ts` 中添加新的事件类型：

```typescript
export const TRACKING_EVENTS = {
  // 现有事件...
  CUSTOM_ACTION: 'custom_action',
  USER_FEEDBACK: 'user_feedback',
}
```

### 扩展分析功能

继承 `AnalyticsManager` 类添加自定义功能：

```typescript
class CustomAnalytics extends AnalyticsManager {
  trackCustomMetric(metric: string, value: number) {
    this.trackEvent('custom_metric', { metric, value })
  }
}
```

## 📈 性能优化

### 数据传输优化

- **批量发送**: 事件累积到一定数量后批量发送
- **压缩传输**: 使用 gzip 压缩减少传输大小
- **异步处理**: 所有分析操作都在后台异步执行

### 内存管理

- **事件队列限制**: 防止内存泄漏
- **定期清理**: 自动清理过期数据
- **懒加载**: 按需加载分析模块

## 🚨 故障排除

### 常见问题

1. **分析系统未初始化**
   - 检查环境变量配置
   - 确认网络连接正常
   - 查看控制台错误信息

2. **Turnstile 验证失败**
   - 验证 Site Key 配置
   - 检查域名白名单设置
   - 确认网络可以访问 Cloudflare

3. **事件发送失败**
   - 检查 API 端点状态
   - 验证请求格式正确
   - 查看服务器日志

### 监控和告警

建议设置以下监控指标：

- 事件发送成功率
- 虚假流量检测率
- API 响应时间
- 系统错误率

## 📚 相关资源

- [Google Analytics 4 文档](https://developers.google.com/analytics/devguides/collection/ga4)
- [Cloudflare Turnstile 文档](https://developers.cloudflare.com/turnstile/)
- [Cloudflare Analytics API](https://developers.cloudflare.com/analytics/)
- [Web Analytics 最佳实践](https://web.dev/vitals/)

## 🤝 贡献指南

如需扩展或修改分析系统：

1. 遵循现有的代码结构和命名规范
2. 添加适当的类型定义和注释
3. 编写相应的测试用例
4. 更新相关文档

---

**注意**: 本系统收集的所有数据仅用于改善用户体验和产品优化，严格遵循隐私保护原则。