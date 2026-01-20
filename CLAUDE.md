# DeTake 前端 - Claude 使用说明（高频精简版）

> 本文件只放「AI 每次都需要记住的少量规则」，其余细节用链接指向 docs/ 下的文档。

## 一、项目速览

- 产品：加密货币新闻和分析平台 DeTake 前端
- 框架：Astro（开启 SSR）+ React 19（前端交互）
- 语言与样式：TypeScript + Tailwind CSS 4
- 包管理与部署：pnpm，部署在 Vercel
- 路由与多语言：`/us/...` 和 `/asia/...` 两套前缀

## 二、关键技术版本（只列最重要的）

- Astro：5.13.2
- React：19.x
- Tailwind CSS：4.1.11
- TypeScript：5.9.x
- 主要依赖：Jotai（全局状态）、TanStack React Query（请求）、Radix UI、i18next / astro-i18next（国际化）

更多依赖与架构细节按需查看：
- 分析与埋点：`docs/ANALYTICS_GUIDE.md`
- Collections / Learn 相关 API：`docs/API_COLLECTIONS_LEARN.md`

## 三、核心编程约定（高频规则，控制在 5 条内）

1. **优先使用 TypeScript 强类型**  
   - 新增数据结构必须定义类型，避免使用 `any`。  
   - 如果确实需要 `any` 或原始 JSON，先在对话中说明理由。

2. **Astro + React 组合策略**  
   - Astro 负责页面结构和 SEO；交互用 React 组件，通过 islands 方式挂载。  
   - 避免把纯静态内容写成 React 组件。

3. **样式统一使用 Tailwind CSS v4**  
   - 优先使用已有原子类；遵循项目中现有的命名和布局习惯。  
   - 需要复用的复杂样式优先抽成组件而不是写内联 style。

4. **命令与校验（提交前务必跑）**  
   - 类型检查：`pnpm type-check`  
   - 构建与本地预览：`pnpm build`、`pnpm preview`（或按项目脚本使用）。  
   - 如果后续补充 Lint / Test / Git Hooks，视为第一层「强制执行层」规则。

5. **注释与多语言约定**  
   - 代码注释以英文为基础说明，但对**复杂或核心函数**，可以额外补充简体中文解释，帮助人类快速理解。  
   - HTML / Astro 模板中的注释使用英文。  
   - 与用户对话一律使用简体中文。

## 四、项目结构与使用方式（简版）

仅保留 AI 高频需要的结构，详细内容请去 docs。

```text
src/
├── api/           # 与后端交互的 API 封装
├── components/    # 组件（article/common/home 等子目录）
├── config/        # 全局常量与站点配置
├── layouts/       # 页面布局
├── lib/           # 工具库（i18n、analytics 等）
├── locales/       # 文本翻译
├── pages/         # Astro 路由页面
├── stores/        # Jotai 全局状态
├── styles/        # 全局样式
└── types/         # TypeScript 类型定义
```

常用脚本（只列最重要的）：

```bash
pnpm dev              # 开发
pnpm build            # 构建
pnpm preview          # 预览构建
pnpm type-check       # 类型检查（改动代码后必跑）
```

## 五、按需查阅层（只放链接，不在此堆细节）

这些内容**AI 并不需要每次都完整加载**，只在相关改动时按需打开：

- 详细分析与埋点系统  
  → `docs/ANALYTICS_GUIDE.md`

- Collections / Learn 接口协议与字段说明  
  → `docs/API_COLLECTIONS_LEARN.md`

- 更细的架构设计、历史决策记录等  
  → 后续如有新增架构文档（例如 `docs/architecture.md`），在这里补充链接即可。

---

# 通用团队规则（所有项目共用，保持简短）

## Communication

- 与人类沟通一律使用简体中文。

## Documentation

- `.md` 文档正文使用中文撰写。  
- 正式长期文档放在 `docs/` 目录。  
- 方案 / 评审类文档建议放在 `discuss/` 目录（如存在）。

## React / Next.js / TypeScript / JavaScript

- React 强制使用 19 版本，不再使用 18 或以下版本。  
- Tailwind CSS 强制使用 v4，不再使用 v3 或以下版本。  
- 能用 TypeScript 就不要用 JavaScript。  
- 数据结构尽量全部定义成强类型；需要使用 `any` 时，先在对话里明确说明原因。  
- 新增代码时，遵循本文件前半部分所列的项目级约定。
