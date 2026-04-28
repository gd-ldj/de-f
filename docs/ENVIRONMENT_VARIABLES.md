# 环境变量配置指南

本项目只需要 **4 个环境变量**，其余配置已硬编码或从这些变量自动推导。

## 必须配置的变量

| 变量 | 必须 | 说明 | 示例 |
|---|---|---|---|
| `PUBLIC_SITE_ENV` | 是 | 站点环境 | `beta`（本地/测试）/ `production`（生产） |
| `PUBLIC_SOURCE_LANGUAGE` | 是 | 站点语言，决定 API 域名前缀和站点 URL | `en` / `zh` / `ja` |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | 是 | Clerk 认证公钥（测试/生产不同） | `pk_test_...` / `pk_live_...` |
| `CLERK_SECRET_KEY` | 是 | Clerk 认证私钥（机密） | `sk_test_...` / `sk_live_...` |

## 环境与域名推导规则

`PUBLIC_SITE_ENV` 只有两个值：`beta` 和 `production`。

API 域名根据环境自动拼接（去掉/加上 `beta-` 前缀）：

| | beta | production |
|---|---|---|
| API | `{lang}-beta-api.detake.com` | `{lang}-api.detake.com` |
| SSR API | `{lang}-beta-ssr-api.detake.com` | `{lang}-ssr-api.detake.com` |
| Site URL | `beta.detake.com` | `{lang}.detake.com` |

## Vercel 自动注入（无需手动配置）

| 变量 | 说明 |
|---|---|
| `VERCEL_GIT_COMMIT_SHA` | Git commit hash，用作 Sentry release |
| `VERCEL_PROJECT_PRODUCTION_URL` | 生产域名，用作 Sentry domain tag |
| `NODE_ENV` | 运行环境 |

## 已删除的环境变量（全部硬编码或自动推导）

| 原环境变量 | 新行为 | 位置 |
|---|---|---|
| `PUBLIC_DEPLOY_ENV` / `DEPLOY_ENV` | 从 `PUBLIC_SITE_ENV` 推导 | `src/config/constants.ts` |
| `PUBLIC_SENTRY_RELEASE` / `SENTRY_RELEASE` | 直接用 `VERCEL_GIT_COMMIT_SHA` | `astro.config.mts` / `sentry.server.config.js` |
| `PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | 硬编码在 `sentry.*.config.js` | `sentry.*.config.js` |
| `SENTRY_AUTH_TOKEN` | 硬编码在 `astro.config.mts` | `astro.config.mts` |
| `SENTRY_DOMAIN` | 服务端用 `VERCEL_PROJECT_PRODUCTION_URL`，客户端用 `window.location.hostname` | `sentry.*.config.js` |
| `PUBLIC_GA_MEASUREMENT_ID` | 硬编码在 `constants.ts` | `src/config/constants.ts` |
| `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | 硬编码在 `constants.ts` | `src/config/constants.ts` |
| `PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | 硬编码 `0.1` | `sentry.client.config.js` |
| `PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE` | 硬编码 `0` | `sentry.client.config.js` |
| `PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE` | 硬编码 `1` | `sentry.client.config.js` |
| `SENTRY_TRACES_SAMPLE_RATE` | 硬编码 `0.1` | `sentry.server.config.js` |
| `SENTRY_ANNOTATE_COMPONENTS` | 硬编码 `true` | `astro.config.mts` |

## 本地开发 `.env.local` 示例

```bash
NODE_ENV=development
PUBLIC_SITE_ENV=beta
PUBLIC_SOURCE_LANGUAGE=en
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

## Vercel 部署配置

在 Vercel 项目设置的 Environment Variables 中，为每个部署配置上述 4 个变量即可：

- **测试环境**：`PUBLIC_SITE_ENV=beta`
- **生产环境**：`PUBLIC_SITE_ENV=production`

每个语言站点单独部署一个实例，设置对应的 `PUBLIC_SOURCE_LANGUAGE`。

### 安全须知

- `CLERK_SECRET_KEY` 是机密，不可提交到公开仓库
- `PUBLIC_` 前缀的变量会暴露给浏览器客户端，不要用于存储敏感信息
- 如需修改 Sentry DSN / Auth Token，编辑 `sentry.*.config.js` 和 `astro.config.mts`
- 如需修改 GA/CF analytics token，编辑 `src/config/constants.ts` 中的 `ANALYTICS_CONFIG`
