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

- 更细的架构设计、历史决策记录等  
  → 后续如有新增架构文档（例如 `docs/architecture.md`），在这里补充链接即可。

---

## 六、推荐 AI Skills 清单（首版）

> 这部分是给 AI 用的「能力菜单」，方便快速选择合适的 skill。  
> 如无特别说明，所有修改都默认遵守前文的类型、安全与样式约定。

1. **布局与样式调整（Tailwind + 响应式）**  
   - 能力：修改页面/组件布局，调整间距、对齐、配色；修复 mobile/desktop 响应式问题（包含滚动条、overflow、断点样式）。  
   - 主要位置：`src/components/**`、`src/pages/**`、`src/styles/global.css`。  
   - 注意：优先复用现有 Tailwind class 和布局模式（如 `max-w-[1440px]`、`layout-two-column-fixed-1440` 等）。

2. **Astro 页面与路由结构调整**  
   - 能力：增删改 Astro 路由页，调整页面骨架、`BaseLayout` 参数（SEO、OG、canonical 等），处理 `/us` / `/asia` 多语言路由。  
   - 主要位置：`src/pages/**`、`src/layouts/BaseLayout.astro`。  
   - 注意：保持现有 URL 结构不变，除非明确需求要求变更。

3. **文章详情页 / 列表页体验优化**  
   - 能力：修改文章详情（`ArticleContent`、`BaseArticlePage`）、分类页（`CategoryPage`）、Topic 页等的布局与交互，包括标题区、标签、作者信息、图片展示等。  
   - 主要位置：`src/components/article/astro/**`、`src/components/pages/**`。  
   - 注意：保持 SEO 相关结构（标题层级、主内容区域）稳定。

4. **移动端适配与滚动行为修复**  
   - 能力：针对小屏设备调整布局（如 `mt-[56px]` header 占位）、修复多余滚动条、遮挡、内容不可见等问题。  
   - 主要位置：各页面 `main` 容器、移动端专用组件、`global.css` 中与 `.prose`、滚动相关的样式。  
   - 注意：优先用 Tailwind 工具类与现有媒体查询模式，不随意新增全局样式。

5. **头部导航与移动端侧边栏（包含 Portal / z-index）**  
   - 能力：调整 `HeaderWithFallback`、`MobileSidebar`、`MobileCategoryPage` 等导航相关组件的结构、层级和交互（包含语言切换按钮遮挡问题等）。  
   - 主要位置：`src/components/common/react/header/**`、相关 Astro 页面中的挂载点。  
   - 注意：统一使用 Portal + 清晰 z-index 层级，避免再制造新的 stacking context 问题。

6. **筛选栏与分页（FilterBar / Topic / Category）**  
   - 能力：修改列表页筛选逻辑（分类、Topic、多选）、清空筛选、分页展示，以及与 URL 参数的同步。  
   - 主要位置：`src/components/common/react/FilterBar.tsx`、`src/components/pages/CategoryPage.tsx`、`src/components/pages/TopicPage.tsx` 等。  
   - 注意：遵循已有事件总线约定（如 `category:changed`、`filter:changed`、`filter:clear-all` 等自定义事件）。

7. **多语言与文案（i18n / 语言切换）**  
   - 能力：增删改文案 key，补充缺失翻译，调整语言切换行为（如文章详情语言按钮）。  
   - 主要位置：`src/locales/**`、`src/lib/i18n`、语言切换相关组件。  
   - 注意：不能随意改动已有 key，新增 key 时保持命名规范（如 `article.*`、`common.*`）。

8. **数据获取与 API 封装**  
   - 能力：调整文章、作者、Topic、合集等数据的获取逻辑，扩展查询参数，优化分页与缓存策略。  
   - 主要位置：`src/api/**`、`src/components/pages/**`、使用 React Query 的地方。  
   - 注意：遵循现有 API 封装模式，避免在组件里直接写裸 `fetch`。

9. **组件抽象与复用重构**  
   - 能力：将重复 UI / 逻辑提取为公共组件（React 或 Astro），统一列表卡片、按钮、标签等常见元素的用法。  
   - 主要位置：`src/components/common/**`、`src/components/article/**`、`src/components/home/**`。  
   - 注意：重构前先阅读现有类似组件，保证风格和 props 设计保持一致。

10. **诊断与排错（类型 / 交互 / 样式）**  
    - 能力：根据报错信息或截图排查问题，定位到具体组件或样式，并给出修复方案；包含 TypeScript 类型错误、React 渲染异常、Astro 构建错误、样式错乱等。  
    - 主要位置：全局。  
    - 注意：修复后优先运行 `pnpm type-check`，必要时说明缺失的 lint/test 命令。

---

# 通用团队规则（所有项目共用，保持简短）

## Communication

- 与人类沟通一律使用简体中文。

## Documentation

- `.md` 文档正文使用中文撰写。  
- 正式长期文档放在 `docs/` 目录。  

## React / Next.js / TypeScript / JavaScript

- React 强制使用 19 版本，不再使用 18 或以下版本。  
- Tailwind CSS 强制使用 v4，不再使用 v3 或以下版本。  
- 能用 TypeScript 就不要用 JavaScript。  
- 数据结构尽量全部定义成强类型；需要使用 `any` 时，先在对话里明确说明原因。  
- 新增代码时，遵循本文件前半部分所列的项目级约定。
