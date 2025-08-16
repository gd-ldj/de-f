# Vercel 部署指南

## 配置更改

已将项目配置从 Node.js 适配器更改为 Vercel 适配器，以支持 Vercel 部署。

### 主要更改：

1. **astro.config.mts**: 将 `@astrojs/node` 适配器替换为 `@astrojs/vercel/serverless`
2. **vercel.json**: 添加了 Vercel 部署配置文件
3. **环境变量**: 更新了示例环境变量中的站点 URL

## 部署步骤

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```
PUBLIC_API_BASE_URL=https://api.detake.com
PUBLIC_PRIVY_APP_ID=cmcuapi5h003ui60mwcvnwtm7
PUBLIC_SITE_URL=https://your-actual-domain.vercel.app
PUBLIC_GA_MEASUREMENT_ID=G-S508W8QNEG
PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAABmK5tti2DA6UbL0
PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=jlpZdddOes4MHKwbLG6iTfzF48YFxZRxo3zkYHv6
```

**重要**: 将 `PUBLIC_SITE_URL` 替换为你的实际 Vercel 域名。

### 2. 构建设置

在 Vercel 项目设置中：
- **Framework Preset**: Astro
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### 3. Node.js 版本

确保使用 Node.js 18.x 或更高版本。

## 常见问题解决

### 1. 路由问题
- 确保 `vercel.json` 中的重写规则正确配置
- 检查 i18n 路由配置是否与 Vercel 兼容

### 2. 环境变量问题
- 确保所有 `PUBLIC_` 前缀的环境变量都在 Vercel 中正确设置
- 检查 API 端点 URL 是否正确

### 3. 构建错误
- 检查依赖版本兼容性
- 确保所有必需的包都已安装

## 验证部署

部署完成后，检查以下功能：
1. 页面正常加载
2. 多语言路由工作正常
3. API 调用成功
4. 认证功能正常
5. 静态资源加载正确