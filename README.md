# DeTake - Platform

一个基于 Astro 框架构建的现代化加密货币新闻和分析平台，支持国际化、SEO 优化和用户认证。

## 🚀 特性

- **🌍 国际化支持**: 支持美国 (US) 和亚洲 (Asia) 两个地区站点
- **⚡ 高性能**: 使用 Astro 的 SSR/ISR 渲染模式
- **🔐 用户认证**: 集成 Privy 钱包登录
- **📱 响应式设计**: 基于 Tailwind CSS 和 shadcn/ui 组件
- **🎯 SEO 优化**: 完整的 meta 标签和结构化数据
- **🔄 状态管理**: 使用 Jotai 进行状态管理
- **📊 数据获取**: React Query 用于 API 数据管理

## 🛠️ 技术栈

- **框架**: Astro 5.x
- **前端**: React 19, TypeScript
- **样式**: Tailwind CSS, shadcn/ui
- **状态管理**: Jotai
- **数据获取**: React Query
- **认证**: Privy
- **UI 组件**: Radix UI
- **部署**: Node.js 适配器

## 📁 项目结构

```
src/
├── api/           # API 接口和数据获取
├── components/    # React 组件
├── layouts/       # Astro 布局组件
├── lib/           # 工具函数
├── pages/         # 页面路由
├── stores/        # Jotai 状态管理
├── styles/        # 全局样式
└── types/         # TypeScript 类型定义
```

## 🚀 快速开始

### 环境要求

- Node.js 18.0.0 或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

复制环境变量模板并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# API Configuration
PUBLIC_API_BASE_URL=https://api.detake.com

# Privy Authentication
PUBLIC_PRIVY_APP_ID=your-privy-app-id-here

# Site Configuration
PUBLIC_SITE_URL=https://detake.com
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:4321](http://localhost:4321)

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 启动生产服务器

```bash
npm start
```

## 🌐 国际化

项目支持两个地区：

- **US**: 英文内容，URL 前缀 `/us/`
- **Asia**: 中文内容，URL 前缀 `/asia/`

### URL 结构

```
/us/                    # 美国站首页
/us/news/article-slug   # 美国站文章详情
/asia/                  # 亚洲站首页
/asia/news/article-slug # 亚洲站文章详情
```

## 🔧 API 集成

### 文章 API

项目通过以下 API 端点获取数据：

- `GET /articles?locale={locale}&page={page}&limit={limit}` - 获取文章列表
- `GET /articles/{slug}?locale={locale}` - 获取单篇文章

### Mock 数据

开发环境下，如果 API 不可用，系统会自动使用 mock 数据。

## 🎨 UI 组件

项目使用 shadcn/ui 组件库，基于 Radix UI 构建：

- 完整的设计系统
- 深色/浅色主题支持
- 无障碍访问优化
- 自定义 CSS 变量

## 🔐 用户认证

集成 Privy 提供多种登录方式：

- 邮箱登录
- 钱包连接
- 社交媒体登录

## 📈 SEO 优化

- 完整的 meta 标签
- Open Graph 支持
- Twitter Card 支持
- JSON-LD 结构化数据
- 多语言 hreflang 标签
- 规范化 URL

## 🚀 部署

### Vercel 部署

```bash
npm i -g vercel
vercel
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4321
CMD ["npm", "start"]
```

## 📝 开发指南

### 添加新页面

1. 在 `src/pages/[locale]/` 下创建新的 `.astro` 文件
2. 确保支持国际化参数
3. 添加适当的 SEO meta 标签

### 添加新组件

1. 在 `src/components/` 下创建 React 组件
2. 使用 TypeScript 类型定义
3. 遵循 shadcn/ui 设计规范

### API 集成

1. 在 `src/api/` 下添加新的 API 函数
2. 使用 TypeScript 类型定义
3. 添加错误处理和 mock 数据

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如有问题或建议，请创建 [Issue](https://github.com/your-repo/issues)。
