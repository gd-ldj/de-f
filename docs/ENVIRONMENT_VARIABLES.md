# 环境变量配置指南

本文档详细说明了项目中新增的环境变量以及如何在代码中获取和使用它们。

## 新增的环境变量及获取方式

### 1. Google Analytics 配置
```bash
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
- **用途**: Google Analytics 测量 ID，用于网站流量分析
- **获取网站**: https://analytics.google.com/
- **获取步骤**:
  1. 登录 [Google Analytics](https://analytics.google.com/)
  2. 选择或创建一个账户
  3. 创建新的 GA4 属性
  4. 在「管理」>「属性设置」>「数据流」中找到测量 ID
  5. 复制格式为 `G-XXXXXXXXXX` 的测量 ID
- **示例**: `G-1234567890`

### 2. Cloudflare Analytics 配置
```bash
PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_cloudflare_analytics_token
```
- **用途**: Cloudflare Analytics API 令牌，用于访客标识生成
- **获取网站**: https://dash.cloudflare.com/profile/api-tokens
- **获取步骤**:
  1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
  2. 点击右上角头像 > 「My Profile」
  3. 选择「API Tokens」标签页
  4. 点击「Create Token」
  5. 选择「Custom token」
  6. 设置权限：Zone:Analytics:Read
  7. 复制生成的 API Token

### 3. Privy 配置
```bash
PUBLIC_PRIVY_APP_ID=your_privy_app_id
```
- **用途**: Privy 钱包连接应用 ID
- **获取网站**: https://dashboard.privy.io/
- **获取步骤**:
  1. 登录 [Privy Dashboard](https://dashboard.privy.io/)
  2. 创建或选择应用
  3. 在应用设置中找到 App ID


## 在代码中使用环境变量

### 基本使用方式

在 TypeScript/JavaScript 代码中获取环境变量：

```typescript
// src/config/constants.ts
export const ANALYTICS_CONFIG = {
  // Google Analytics configuration
  GA_MEASUREMENT_ID: import.meta.env.PUBLIC_GA_MEASUREMENT_ID,
  
  // Cloudflare Analytics token
  CLOUDFLARE_ANALYTICS_TOKEN: import.meta.env.PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN,
  
  // Other configuration...
} as const
```

### 在 Astro 组件中使用

```astro
---
// src/layouts/BaseLayout.astro
const gaId = import.meta.env.PUBLIC_GA_MEASUREMENT_ID

// Use environment variable
if (gaId) {
  // Initialize Google Analytics
}
---
```

### 在 React 组件中使用

```typescript
// src/components/Analytics.tsx
import { ANALYTICS_CONFIG } from '@/config/constants'

export const Analytics: React.FC = () => {
  const { GA_MEASUREMENT_ID } = ANALYTICS_CONFIG
  
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics not configured')
    return null
  }
  
  // Initialize Analytics using GA_MEASUREMENT_ID
  return <></>
}
```

## 环境变量验证

为了确保关键的环境变量已正确配置，可以在应用启动时进行验证：

```typescript
// src/config/env-check.ts
export function validateEnvironmentVariables() {
  const errors: string[] = []
  
  if (!import.meta.env.PUBLIC_GA_MEASUREMENT_ID) {
    errors.push('Google Analytics Measurement ID is missing')
  }
  
  if (!import.meta.env.PUBLIC_PRIVY_APP_ID) {
    errors.push('Privy App ID is missing')
  }
  
  if (errors.length > 0) {
    console.error('Environment variable validation failed:', errors)
    // Can throw error in development environment, log warning in production
    if (import.meta.env.DEV) {
      throw new Error(`Missing environment variables: ${errors.join(', ')}`)
    }
  }
}
```

## 最佳实践

### 1. 环境变量命名规范

- ✅ **公开变量**: 使用 `PUBLIC_` 前缀（如 `PUBLIC_GA_MEASUREMENT_ID`）
- ✅ **私密变量**: 不使用 `PUBLIC_` 前缀（如 `DATABASE_URL`）
- ✅ **描述性命名**: 使用明确描述用途的名称

### 2. 安全考虑

- ✅ **安全**: 这些变量适合存储公开的配置信息（如 GA 测量 ID）
- ❌ **不安全**: 永远不要在 `PUBLIC_` 变量中存储敏感信息（如 API 私钥、数据库密码）

### 3. 环境分离

```bash
# .env.local (本地开发)
PUBLIC_GA_MEASUREMENT_ID=G-DEV123456789

# .env.production (生产环境)
PUBLIC_GA_MEASUREMENT_ID=G-PROD123456789
```

## 使用状态检查

可以创建一个简单的状态检查组件来确认配置：

```typescript
// src/components/ConfigStatus.tsx (development environment only)
export const ConfigStatus: React.FC = () => {
  if (import.meta.env.PROD) return null
  
  const config = {
    hasGA: !!ANALYTICS_CONFIG.GA_MEASUREMENT_ID,
    hasPrivy: !!import.meta.env.PUBLIC_PRIVY_APP_ID,
  }
  
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '12px' }}>
      <div>GA: {config.hasGA ? '✅' : '❌'}</div>
      <div>Privy: {config.hasPrivy ? '✅' : '❌'}</div>
      <div>API: {config.hasAPI ? '✅' : '❌'}</div>
    </div>
  )
}
```

## 故障排除

### 常见问题

**1. 环境变量未生效**
- 确保变量名正确（区分大小写）
- 确保 `.env.local` 文件在项目根目录
- 重启开发服务器

**2. 生产环境配置**
- 在 Vercel/Netlify 等平台的环境变量设置中配置
- 确保生产环境的变量值与开发环境区分

**3. 类型检查**
```typescript
// Add type declarations for environment variables
interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID: string
  readonly PUBLIC_PRIVY_APP_ID: string
  readonly PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 参考链接

- [Astro 环境变量文档](https://docs.astro.build/en/guides/environment-variables/)
- [Google Analytics GA4 文档](https://developers.google.com/analytics/devguides/collection/ga4)
- [Privy 文档](https://docs.privy.io/)
- [Cloudflare Analytics API](https://developers.cloudflare.com/analytics/)