# DeTake 前端 - Claude 代码文档

## 项目概述

DeTake 是一个使用现代 Web 技术构建的加密货币新闻和分析平台。前端使用 Astro 和 React 组件开发，提供服务端渲染 (SSR) 功能和多语言支持。

## 技术栈

### 核心技术

- **框架**: Astro 5.13.2 (启用 SSR)
- **UI 库**: React 19.1.0
- **样式**: Tailwind CSS 4.1.11
- **语言**: TypeScript
- **包管理器**: pnpm
- **部署**: Vercel

### 关键库

- **身份验证**: Privy (@privy-io/react-auth)
- **钱包集成**: Solana SPL Token, Reown AppKit
- **状态管理**: Jotai
- **数据获取**: TanStack React Query
- **UI 组件**: Radix UI primitives
- **国际化**: i18next, astro-i18next
- **分析**: 自定义分析系统 + Vercel Analytics
- **图表**: Recharts
- **图标**: Lucide React
- **动画**: Framer Motion

## 项目结构

```
src/
├── api/                    # API 集成层
│   ├── articles.ts
│   ├── auth.ts
│   └── users.ts
├── components/
│   ├── article/           # 文章相关组件
│   │   ├── astro/         # Astro 组件
│   │   └── react/         # React 组件
│   ├── common/            # 可复用组件
│   │   ├── astro/         # Astro 组件
│   │   └── react/         # React 组件
│   └── home/              # 首页组件
├── config/
│   └── constants.ts       # 全局常量
├── layouts/
│   └── BaseLayout.astro   # 主布局模板
├── lib/                   # 工具库
│   ├── analytics.ts       # 分析系统
│   ├── i18n.ts           # 国际化
│   └── utils.ts          # 通用工具
├── locales/              # 翻译文件
│   ├── asia/
│   └── us/
├── pages/                # Astro 页面 (基于文件的路由)
│   ├── [locale]/         # 本地化路由
│   └── api/              # API 端点
├── stores/               # 全局状态管理
├── styles/
│   └── global.css        # 全局样式
└── types/                # TypeScript 类型定义
```

## 开发命令

```bash
# 开发
pnpm dev                  # 启动开发服务器
pnpm build               # 构建生产版本
pnpm preview             # 预览生产构建
pnpm start               # 启动 Vercel 开发服务器
pnpm vercel:simulate     # 本地构建并启动 Vercel

# 类型检查
pnpm type-check          # 运行 Astro 类型检查
```

## 架构

### 渲染策略

- **SSR**: 启用服务端渲染以获得更好的 SEO 和性能
- **Islands 架构**: React 组件使用 Astro 的 islands 按需水合
- **客户端指令**:
  - `client:load` - 页面加载时立即水合
  - `client:only` - 仅在客户端渲染 (防止 SSR 水合问题)
  - `client:idle` - 浏览器空闲时水合

### 国际化

- **支持的语言环境**: 美国英语 (`us`) 和亚洲 (`asia`)
- **路由**: 基于前缀的路由 (`/us/...`, `/asia/...`)
- **实现**: astro-i18next 与 React i18next 集成

### 身份验证和钱包集成

- **Privy**: 处理用户身份验证和钱包连接
- **钱包支持**: 多钱包支持，包括 Solana 钱包
- **状态管理**: 使用 Jotai atoms 管理全局认证状态

### 分析系统

- **自定义分析**: 支持访客 ID 的事件跟踪系统
- **Vercel Analytics**: 集成性能监控
- **实现**: SSR 到客户端的分析事件桥接

## 关键功能

### 多语言支持

- 基于语言环境的动态路由
- 组件级国际化
- 针对不同市场的 SEO 优化

### 高级身份验证

- 基于钱包的身份验证
- 通过 Privy 的社交登录集成
- 全局身份验证状态管理

### 内容管理

- 支持丰富内容的文章系统
- 作者管理和个人资料
- 基于分类的过滤
- 搜索功能

### 分析和跟踪

- 自定义行为跟踪
- 性能监控
- 用户参与度指标
- A/B 测试功能

## 开发指南

### 组件架构

- **Astro 组件**: 用于静态内容和 SEO 关键元素
- **React 组件**: 用于交互功能和客户端状态
- **混合方法**: 结合两者以获得最佳性能

### 状态管理

- **Jotai**: 用于全局状态 (认证、用户偏好)
- **本地状态**: React 的 useState 用于组件特定状态
- **服务器状态**: TanStack Query 用于 API 数据

### 样式

- **Tailwind CSS**: 实用优先的方法
- **组件变体**: 使用 class-variance-authority
- **响应式设计**: 移动优先的方法

### 性能优化

- **代码分割**: Astro islands 自动处理
- **图像优化**: 自定义图像组件
- **包分析**: 监控包大小和依赖项

## 常见问题与解决方案

### 水合不匹配

- 确保 SSR 和客户端渲染相同内容
- 对具有客户端特定行为的组件使用 `client:only`
- 实现适当的加载状态

### 钱包集成

- 优雅地处理钱包连接状态
- 为不支持的钱包实现回退 UI
- 管理钱包断开连接场景

### 国际化

- 保持翻译键在各语言环境中的一致性
- 处理动态内容翻译
- 在开发过程中测试所有语言环境

## 部署

### Vercel 配置

- 框架: Astro
- 输出: 无服务器函数
- 分析: 已启用
- 环境变量: 在 Vercel 控制台中配置

### 构建过程

1. 类型检查
2. Astro 构建 (SSG/SSR 混合)
3. 资源优化
4. 部署到 Vercel 边缘网络

## 环境变量

需要配置的关键环境变量:

- `VERCEL_ANALYTICS_ID`: 用于 Vercel 分析
- Privy 配置密钥
- API 端点
- 功能标志

## 故障排除

### 构建错误

1. **类型错误**: 运行 `pnpm type-check` 识别 TypeScript 问题
2. **导入错误**: 检查文件路径并确保正确导出
3. **环境变量**: 验证所有必需变量已设置

### 运行时问题

1. **水合错误**: 检查浏览器控制台中的特定组件问题
2. **API 失败**: 验证 API 端点和网络连接
3. **身份验证问题**: 检查 Privy 配置和钱包连接

### 性能问题

1. **加载缓慢**: 分析包大小并优化导入
2. **内存泄漏**: 检查 useEffect 钩子中的适当清理
3. **SEO 问题**: 验证元标签和结构化数据

## 贡献指南

在此项目上工作时：

1. **遵循既定模式** 进行组件结构设计
2. **在多个语言环境中测试** 再提交更改
3. **检查钱包功能** 在不同钱包类型中的表现
4. **运行类型检查** 在提交之前
5. **测试 SSR 行为** 以避免水合问题

## 性能监控

### 需要跟踪的指标

- **核心 Web 指标**: LCP、FID、CLS
- **包大小**: 监控 JavaScript 负载
- **API 响应时间**: 跟踪后端性能
- **用户参与度**: 分析和转化率

### 工具

- **Vercel Analytics**: 内置性能监控
- **Lighthouse**: 定期进行性能和 SEO 审计
- **Bundle Analyzer**: 分析 webpack 包组成
- **自定义分析**: 跟踪用户行为和功能使用情况

### 优化策略

- **代码分割**: 利用 Astro 的自动分割
- **图像优化**: 使用优化格式和懒加载
- **缓存**: 实现适当的缓存头和策略
- **CDN**: 利用 Vercel 的全球边缘网络

# 任何项目都务必遵守的规则（极其重要！！！）

## Communication

- 永远使用简体中文进行思考和对话

## Documentation

- 编写 .md 文档时，也要用中文
- 正式文档写到项目的 docs/ 目录下
- 用于讨论和评审的计划、方案等文档，写到项目的 discuss/ 目录下

## React / Next.js / TypeScript / JavaScript

- Next.js 强制使用 v5.13 版本
- React 强制使用 v19 版本，不要再用 v18 或以下版本
- Tailwind CSS 强制使用 Tailwind CSS v4。不要再用 v3 或以下版本
- 尽可能使用 TypeScript。只有在构建工具完全不支持 TypeScript 的时候，才使用 JavaScript（如微信小程序的主工程）
- 数据结构尽可能全部定义成强类型。如果个别场景不得不使用 any 或未经结构化定义的 json，需要先停下来征求用户的同意
