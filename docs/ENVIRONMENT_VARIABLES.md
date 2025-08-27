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

### 2. Cloudflare Turnstile 配置
```bash
PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAAAxxxxxxxxxxxxxxxxxx
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAAAAxxxxxxxxxxxxxxxxxx
```
- **用途**: 
  - `PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`: 客户端站点密钥，用于显示验证挑战
  - `CLOUDFLARE_TURNSTILE_SECRET_KEY`: 服务端密钥，用于验证令牌（敏感信息，不含 PUBLIC_ 前缀）
- **获取网站**: https://dash.cloudflare.com/
- **获取步骤**:
  1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
  2. 在左侧菜单选择「Turnstile」
  3. 点击「Add site」创建新站点
  4. 填写站点名称和域名
  5. 选择 Widget Mode（推荐 Managed）
  6. 复制生成的「Site Key」和「Secret Key」
- **示例**: 
  - Site Key: `0x4AAAAAAABkKtQlHLVyQcgq`
  - Secret Key: `0x4AAAAAAABkKtQlHLVyQcgq`（与 Site Key 不同）

### 3. Cloudflare Analytics 配置
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
  5. 选择「Custom token」模板
  6. 配置权限：
     - **Permissions**: Zone:Analytics:Read
     - **Zone Resources**: Include - Specific zone - 选择你的域名
  7. 点击「Continue to summary」然后「Create Token」
  8. 复制生成的 API Token
- **权限要求**: Zone:Analytics:Read
- **注意**: 令牌只显示一次，请妥善保存

## 在代码中获取环境变量

### 方法一：直接使用 `import.meta.env`

```typescript
// 在任何 .ts/.tsx/.astro 文件中
const gaId = import.meta.env.PUBLIC_GA_MEASUREMENT_ID
const turnstileKey = import.meta.env.PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY
const cfToken = import.meta.env.PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN
```

### 方法二：通过配置常量（推荐）

在 `src/config/constants.ts` 中已经定义了统一的配置：

```typescript
export const ANALYTICS_CONFIG = {
  // Google Analytics configuration
  GA_MEASUREMENT_ID: import.meta.env.PUBLIC_GA_MEASUREMENT_ID,
  
  // Cloudflare Turnstile configuration
  TURNSTILE_SITE_KEY: import.meta.env.PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
  
  // Cloudflare Analytics token
  CLOUDFLARE_ANALYTICS_TOKEN: import.meta.env.PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN,
  
  // 其他配置...
} as const
```

在其他文件中使用：

```typescript
import { ANALYTICS_CONFIG } from '../config/constants'

// 使用 Google Analytics ID
if (ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
  // 初始化 GA
}

// 使用 Turnstile 站点密钥
if (ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
  // 初始化 Turnstile
}
```

## 实际使用示例

### 1. 在 Analytics 系统中使用

```typescript
// src/lib/analytics.ts
import { ANALYTICS_CONFIG } from '../config/constants'

export class AnalyticsManager {
  async initialize() {
    // 检查 GA 配置
    if (ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
      await this.initializeGoogleAnalytics()
    }
    
    // 使用 Cloudflare token
    if (ANALYTICS_CONFIG.CLOUDFLARE_ANALYTICS_TOKEN) {
      await this.getCloudflareVisitorId()
    }
  }
  
  private async initializeGoogleAnalytics() {
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA_MEASUREMENT_ID}`
    // ...
  }
}
```

### 2. 在 React 组件中使用

```tsx
// src/components/common/react/TurnstileVerification.tsx
import { ANALYTICS_CONFIG } from '../../../config/constants'

export const TurnstileVerification: React.FC<Props> = ({ onVerify, onError }) => {
  const siteKey = ANALYTICS_CONFIG.TURNSTILE_SITE_KEY
  
  if (!siteKey) {
    console.warn('Turnstile site key not configured')
    return null
  }
  
  // 使用 siteKey 初始化 Turnstile
  // ...
}
```

### 3. 在 API 路由中使用

```typescript
// src/pages/api/cf-visitor-id.ts
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ request }) => {
  const cfToken = import.meta.env.PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN
  
  if (!cfToken) {
    return new Response(JSON.stringify({ error: 'CF token not configured' }), {
      status: 500
    })
  }
  
  // 使用 token 调用 Cloudflare API
  // ...
}
```

### 4. 在 Astro 组件中使用

```astro
---
// src/pages/test-analytics.astro
import { ANALYTICS_CONFIG } from '../config/constants'

const hasGA = !!ANALYTICS_CONFIG.GA_MEASUREMENT_ID
const hasTurnstile = !!ANALYTICS_CONFIG.TURNSTILE_SITE_KEY
---

<div>
  {hasGA && <p>Google Analytics 已配置</p>}
  {hasTurnstile && <p>Turnstile 验证已启用</p>}
</div>
```

## 详细配置指南

### Google Analytics 详细配置

**前置条件**:
- 拥有 Google 账户
- 网站已部署或有明确的域名

**详细步骤**:
1. **访问 Google Analytics**
   - 打开 https://analytics.google.com/
   - 使用 Google 账户登录

2. **创建账户和属性**
   - 点击「开始测量」
   - 输入账户名称（如：Detake Analytics）
   - 选择数据共享设置
   - 点击「下一步」

3. **设置属性**
   - 输入属性名称（如：Detake Website）
   - 选择时区和货币
   - 点击「下一步」

4. **配置数据流**
   - 选择「网站」
   - 输入网站 URL（如：https://detake.com）
   - 输入数据流名称
   - 点击「创建数据流」

5. **获取测量 ID**
   - 在数据流详情页面找到「测量 ID」
   - 格式为 `G-XXXXXXXXXX`
   - 复制此 ID

**费用**: 免费（标准版）

### Cloudflare Turnstile 详细配置

**前置条件**:
- 拥有 Cloudflare 账户
- 网站域名（可以是 localhost 用于开发）

**详细步骤**:
1. **访问 Cloudflare Dashboard**
   - 打开 https://dash.cloudflare.com/
   - 登录你的 Cloudflare 账户

2. **进入 Turnstile 服务**
   - 在左侧导航栏找到「Turnstile」
   - 如果没有看到，可能需要先添加域名到 Cloudflare

3. **创建新站点**
   - 点击「Add site」
   - **Site name**: 输入站点名称（如：Detake Frontend）
   - **Domain**: 输入域名（开发环境可用 `localhost`）
   - **Widget Mode**: 选择 `Managed`（推荐）
   - 点击「Create」

4. **获取站点密钥**
   - 创建成功后会显示两个密钥
   - 复制「Site Key」（以 `0x4AAAAAAA` 开头）
   - 「Secret Key」用于服务端验证，暂不需要

**费用**: 免费（每月 100 万次验证）

### Cloudflare Analytics API 详细配置

**前置条件**:
- 拥有 Cloudflare 账户
- 域名已添加到 Cloudflare（至少免费计划）

**详细步骤**:
1. **访问 API Tokens 页面**
   - 打开 https://dash.cloudflare.com/profile/api-tokens
   - 或在 Dashboard 右上角点击头像 > "My Profile" > "API Tokens"

2. **创建自定义令牌**
   - 点击「Create Token」
   - 选择「Custom token」

3. **配置令牌权限**
   - **Token name**: 输入名称（如：Detake Analytics Token）
   - **Permissions**: 
     - 添加 `Zone:Analytics:Read`
     - 可选添加 `Zone:Zone:Read`（用于获取区域信息）
   - **Zone Resources**:
     - 选择 `Include - Specific zone`
     - 从下拉菜单选择你的域名
   - **Client IP Address Filtering**: 可选，留空表示不限制
   - **TTL**: 可选，建议设置过期时间

4. **生成和保存令牌**
   - 点击「Continue to summary」
   - 检查权限配置
   - 点击「Create Token」
   - **重要**: 立即复制令牌，它只会显示一次

**费用**: 免费（Analytics API 包含在免费计划中）

## 环境变量配置步骤

### 1. 复制环境变量模板
```bash
cp .env.example .env.local
```

### 2. 编辑 `.env.local` 文件
```bash
# Google Analytics 配置
PUBLIC_GA_MEASUREMENT_ID=G-1234567890

# Cloudflare Turnstile 配置
PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAAABkKtQlHLVyQcgq
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAAAAyour_secret_key_here

# Cloudflare Analytics 配置
PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_actual_cloudflare_token_here
```

### 3. 重启开发服务器
```bash
npm run dev
```

## 安全注意事项

### 1. PUBLIC_ 前缀安全性
- ⚠️ **重要**: 所有以 `PUBLIC_` 开头的环境变量会被暴露到客户端
- ✅ **安全**: 这些变量适合存储公开的配置信息（如 GA 测量 ID、Turnstile 站点密钥）
- ❌ **危险**: 不要在 `PUBLIC_` 变量中存储敏感信息（如 API 密钥、数据库密码）
- 🔒 **服务端专用**: 敏感变量不要使用 `PUBLIC_` 前缀

### 2. API 令牌安全
- **Cloudflare API Token**: 虽然标记为 `PUBLIC_`，但应限制权限范围
- **最小权限原则**: 只授予必要的权限（Analytics:Read）
- **定期轮换**: 建议每 3-6 个月更换一次 API 令牌
- **监控使用**: 定期检查 API 令牌的使用情况

### 3. 域名限制
- **Turnstile**: 配置时指定具体域名，避免使用通配符
- **开发环境**: 可以添加 `localhost` 用于本地开发
- **生产环境**: 确保只包含实际的生产域名

## 类型安全和错误处理

### 1. 类型检查
```typescript
// 建议添加类型检查
if (typeof ANALYTICS_CONFIG.GA_MEASUREMENT_ID !== 'string') {
  console.warn('GA Measurement ID not configured')
  return
}

// 检查配置完整性
function validateAnalyticsConfig() {
  const errors: string[] = []
  
  if (!ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    errors.push('Google Analytics Measurement ID is missing')
  }
  
  if (!ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
    errors.push('Cloudflare Turnstile Site Key is missing')
  }
  
  if (errors.length > 0) {
    console.warn('Analytics configuration issues:', errors)
  }
  
  return errors.length === 0
}
```

### 2. 默认值处理
```typescript
// 提供默认值或错误处理
const gaId = ANALYTICS_CONFIG.GA_MEASUREMENT_ID || 'GA_NOT_CONFIGURED'

// 优雅降级
if (!ANALYTICS_CONFIG.TURNSTILE_SITE_KEY) {
  console.info('Turnstile not configured, skipping bot protection')
  // 继续执行其他功能
}
```

### 3. 生产环境配置
- **部署平台**: 在 Vercel/Netlify 等平台的环境变量设置中配置
- **CI/CD**: 确保构建流程中包含必要的环境变量
- **验证**: 部署前验证所有必需的环境变量都已设置
- **监控**: 设置告警监控 API 配额使用情况

## 故障排除

### 常见问题

**1. Google Analytics 不工作**
```bash
# 检查测量 ID 格式
echo $PUBLIC_GA_MEASUREMENT_ID
# 应该输出: G-XXXXXXXXXX
```
- 确认测量 ID 格式正确（以 G- 开头）
- 检查 GA4 属性是否正确配置
- 验证网站 URL 是否匹配

**2. Turnstile 验证失败**
```bash
# 检查站点密钥格式
echo $PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY
# 应该输出: 0x4AAAAAAA...
```
- 确认站点密钥格式正确（以 0x4AAAAAAA 开头）
- 检查域名配置是否包含当前访问域名
- 验证 Widget Mode 设置

**3. Cloudflare Analytics API 错误**
```bash
# 测试 API 令牌
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer $PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN"
```
- 确认 API 令牌权限正确
- 检查令牌是否过期
- 验证域名是否已添加到 Cloudflare

### 调试命令

```bash
# 检查所有环境变量
env | grep PUBLIC_

# 验证配置文件
cat .env.local

# 检查构建时的环境变量
npm run build -- --verbose
```

## 调试和验证

### 检查环境变量是否正确加载
```typescript
console.log('Environment check:', {
  hasGA: !!ANALYTICS_CONFIG.GA_MEASUREMENT_ID,
  hasTurnstile: !!ANALYTICS_CONFIG.TURNSTILE_SITE_KEY,
  hasCFToken: !!ANALYTICS_CONFIG.CLOUDFLARE_ANALYTICS_TOKEN
})
```

### 在浏览器开发者工具中验证
```javascript
// 在浏览器控制台中运行
console.log('Analytics config:', window.detakeAnalytics?.config)
```

## 相关文档

- [Analytics 系统指南](./ANALYTICS_GUIDE.md)
- [Astro 环境变量文档](https://docs.astro.build/en/guides/environment-variables/)
- [Cloudflare Turnstile 文档](https://developers.cloudflare.com/turnstile/)
- [Google Analytics 4 文档](https://developers.google.com/analytics/devguides/collection/ga4)